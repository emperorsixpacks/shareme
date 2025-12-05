pragma solidity ^0.8.20;

contract SpacesContract {

    struct Content {
        address creator;
        string contentHash; // IPFS hash or identifier
        bool exists;
    }

    mapping(bytes32 => Content) public contents;

    event ContentCreated(bytes32 indexed contentId, address creator, uint256 price);

    function createContent(bytes32 contentId, uint256 price, string memory contentHash) external {
        require(!contents[contentId].exists, "Content already exists");
        
        contents[contentId] = Content({
            creator: msg.sender,
            contentHash: contentHash,
            exists: true
        });
        emit ContentCreated(contentId, msg.sender, price);
    }
}
