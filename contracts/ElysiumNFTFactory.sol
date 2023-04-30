// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./ElysiumNFT.sol";

/* elysium elysiumNFT Factory
    Create new elysium elysiumNFT collection
*/
contract ElysiumNFTFactory {
    // owner address => nft list
    mapping(address => address[]) private nfts;

    mapping(address => bool) private elysiumNFT;

    event CreatedNFTCollection(
        address creator,
        address nft,
        string name,
        string symbol
    );

    function createNFTCollection(
        string memory _name,
        string memory _symbol,
        uint256 _royalty,
        address payable _royaltyRecipient
    ) external {
        ElysiumNFT nft = new ElysiumNFT(
            _name,
            _symbol,
            msg.sender,
            _royalty,
            _royaltyRecipient
        );
        nfts[msg.sender].push(address(nft));
        elysiumNFT[address(nft)] = true;
        emit CreatedNFTCollection(msg.sender, address(nft), _name, _symbol);
    }

    function getOwnCollections() external view returns (address[] memory) {
        return nfts[msg.sender];
    }

    function isElysiumNFT(address _nft) external view returns (bool) {
        return elysiumNFT[_nft];
    }
}
