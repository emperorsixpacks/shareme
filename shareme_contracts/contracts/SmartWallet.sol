// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

struct CreatorSpace {
    bytes32 spaceId;
    address wallet;
}

struct CreatorWallets {
    CreatorSpace[] spaces;
}

library CreatorWalletsLib {
    function addSpace(
        CreatorWallets storage self,
        bytes32 spaceId,
        address wallet
    ) internal {
        self.spaces.push(CreatorSpace({spaceId: spaceId, wallet: wallet}));
    }

    function getSpaceById(
        CreatorWallets storage self,
        bytes32 spaceId
    ) internal view returns (CreatorSpace storage) {
        for (uint256 i = 0; i < self.spaces.length; i++) {
            if (self.spaces[i].spaceId == spaceId) {
                return self.spaces[i];
            }
        }
        revert("Space not found");
    }

    function hasSpace(
        CreatorWallets storage self,
        bytes32 spaceId
    ) internal view returns (bool) {
        for (uint256 i = 0; i < self.spaces.length; i++) {
            if (self.spaces[i].spaceId == spaceId) {
                return true;
            }
        }
        return false;
    }
}

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

interface ISmartWalletFactory {
    function getPlatformFee() external view returns (uint256);
    function getPlatformWallet() external view returns (address);
    function isAllowedAsset(address token) external view returns (bool);
}

contract SmartWallet {
    address private controller;
    address public creator;
    address public creatorToken;
    bool public allowOnlyCreatorToken;

    ISmartWalletFactory public factory;

    event PaymentReceived(address sender, uint amount);
    event PaymentSplit(address creator, uint creatorAmount, uint platformAmount);

    modifier onlyController() {
        require(msg.sender == controller, "Not controller");
        _;
    }

    constructor(
        address _controller,
        address _creator,
        address _factory
    ) {
        controller = _controller;
        creator = _creator;
        factory = ISmartWalletFactory(_factory);
        allowOnlyCreatorToken = false;
    }

    /// Toggle creator token restriction
    function allowOnlyCreatorTokenOff() external onlyController {
        allowOnlyCreatorToken = false;
    }

    function setCreatorToken(address tokenAddress) external onlyController {
        require(tokenAddress != address(0), "Invalid address");
        creatorToken = tokenAddress;
    }

    function getCreatorToken() external view returns (address) {
        require(creatorToken != address(0), "Creator token not set");
        return creatorToken;
    }

    /// Forward token payments
    function forwardTransfer(address token, uint256 amount, address initiator) external onlyController {
        require(factory.isAllowedAsset(token), "Token not allowed");
        require(amount > 0, "No payment");

        uint256 platformFee = factory.getPlatformFee();
        uint256 platformAmount = (amount * platformFee) / 100;
        uint256 creatorAmount = amount - platformAmount;

        require(IERC20(token).transfer(creator, creatorAmount), "Creator transfer failed");
        require(IERC20(token).transfer(factory.getPlatformWallet(), platformAmount), "Platform transfer failed");

        emit PaymentReceived(initiator, amount);
        emit PaymentSplit(creator, creatorAmount, platformAmount);
    }

    receive() external payable {
        uint256 platformFee = factory.getPlatformFee();
        uint256 platformAmount = (msg.value * platformFee) / 100;
        uint256 creatorAmount = msg.value - platformAmount;

        payable(creator).transfer(creatorAmount);
        payable(factory.getPlatformWallet()).transfer(platformAmount);

        emit PaymentReceived(msg.sender, msg.value);
        emit PaymentSplit(creator, creatorAmount, platformAmount);
    }
}

contract SmartWalletFactory {
    address public platformWallet;
    address private controller;

    using CreatorWalletsLib for CreatorWallets;
    mapping(address => CreatorWallets) private creatorWallets;
    mapping(address => address) public walletToCreator;
    mapping(address => bool) public allowedAssets;
    uint256 public platformFee; 

    event WalletCreated(address indexed creator, address wallet);
    event AllowedAssetAdded(address token);
    event AllowedAssetRemoved(address token);
    event PlatformFeeUpdated(uint256 newFee);

    modifier onlyController() {
        require(msg.sender == controller, "Not controller");
        _;
    }

    constructor(address _platformWallet) {
        platformWallet = _platformWallet;
        controller = msg.sender;
    }

    function createWallet(bytes32 spaceID) external returns (address) {
        CreatorWallets storage cw = creatorWallets[msg.sender];
        require(!cw.hasSpace(spaceID), "Space already exists");

        SmartWallet wallet = new SmartWallet(address(this), msg.sender, address(this));
        cw.addSpace(spaceID, address(wallet));
        walletToCreator[address(wallet)] = msg.sender;

        emit WalletCreated(msg.sender, address(wallet));
        return address(wallet);
    }

    function executeForwardTransfer(address payable walletAddress, address token, uint256 amount) external onlyController {
        address creator = walletToCreator[walletAddress];
        require(creator != address(0), "Not a valid wallet");

        SmartWallet(walletAddress).forwardTransfer(token, amount, creator);
    }

    // Allowed assets management
    function addAllowedAsset(address token) external onlyController {
        allowedAssets[token] = true;
        emit AllowedAssetAdded(token);
    }

    function removeAllowedAsset(address token) external onlyController {
        allowedAssets[token] = false;
        emit AllowedAssetRemoved(token);
    }

    function isAllowedAsset(address token) external view returns (bool) {
        return allowedAssets[token];
    }

    // Platform fee management
    function setPlatformFee(uint256 fee) external onlyController {
        require(fee <= 100, "Fee too high");
        platformFee = fee;
        emit PlatformFeeUpdated(fee);
    }

    function getPlatformFee() external view returns (uint256) {
        return platformFee;
    }
 
    function getPlatformWallet() external view returns (address) {
      return platformWallet;
    }

}

