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

    function spaceCount(
        CreatorWallets storage self
    ) internal view returns (uint256) {
        return self.spaces.length;
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

contract SmartWallet {
    address private controller;
    address public creator;
    address public platformWallet;

    uint256 public platformFee = 20; // 20%
    mapping(address => bool) public allowedAssets;

    event PaymentReceived(address sender, uint amount);
    event PaymentSplit(
        address creator,
        uint creatorAmount,
        uint platformAmount
    );

    modifier onlyController() {
        require(msg.sender == controller, "Not controller");
        _;
    }

    constructor(
        address _controller,
        address _creator,
        address _platformWallet
    ) {
        controller = _controller;
        creator = _creator;
        platformWallet = _platformWallet;
    }

    function forwardTransfer(
        address token,
        uint256 amount
    ) external onlyController {
        require(allowedAssets[token], "Token not allowed");
        require(amount > 0, "No payment");

        uint256 platformAmount = (amount * platformFee) / 100;
        uint256 creatorAmount = amount - platformAmount;

        require(
            IERC20(token).transfer(creator, creatorAmount),
            "Creator transfer failed"
        );
        require(
            IERC20(token).transfer(platformWallet, platformAmount),
            "Platform transfer failed"
        );

        emit PaymentReceived(msg.sender, amount);
        emit PaymentSplit(creator, creatorAmount, platformAmount);
    }

    function addAllowedAsset(address _token) external onlyController {
        allowedAssets[_token] = true;
    }

    function removeAllowedAsset(address _token) external onlyController {
        allowedAssets[_token] = false;
    }

    function updatePlatformFee(uint256 newFee) external onlyController {
        platformFee = newFee;
    }

    // function getBalance(address token) external view returns (uint256) {
    //     require(!allowedAssets(address), "Address not Supported")
    //     return IERC20(token).balanceOf(address(this));
    // }

    receive() external payable {
        uint256 platformAmount = (msg.value * platformFee) / 100;
        uint256 creatorAmount = msg.value - platformAmount;

        payable(creator).transfer(creatorAmount);
        payable(platformWallet).transfer(platformAmount);

        emit PaymentReceived(msg.sender, msg.value);
        emit PaymentSplit(creator, creatorAmount, platformAmount);
    }
}

contract SmartWalletFactory {
    address public platformWallet;

    using CreatorWalletsLib for CreatorWallets;
    mapping(address => CreatorWallets) private creatorWallets;

    event WalletCreated(address indexed creator, address wallet);

    constructor(address _platformWallet) {
        platformWallet = _platformWallet;
    }

    function createWallet(bytes32 spaceID) external returns (address) {
        CreatorWallets storage cw = creatorWallets[msg.sender];
        require(!cw.hasSpace(spaceID), "Space already exists");

        SmartWallet wallet = new SmartWallet(
            platformWallet,
            msg.sender,
            platformWallet
        );

        cw.addSpace(spaceID, address(wallet));

        emit WalletCreated(msg.sender, address(wallet));
        return address(wallet);
    }
}
