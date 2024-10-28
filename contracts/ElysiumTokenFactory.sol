// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import "./ElysiumToken.sol";

/* Elysium Token Factory
    Create new elysium token collection
*/
/// @custom:security-contact davidbong@gmail.com
contract ElysiumTokenFactory {
    // owner address => collection list
    mapping(address => address[]) private _elysiumCollections;

    mapping(address => bool) private _elysiumCollection;

    event CreatedCollection(
        address creator,
        address collectionAddress,
        string name,
        string symbol
    );

    function createCollection(
        string memory name,
        string memory symbol,
        uint256 royalty,
        address payable royaltyRecipient
    ) external {
        ElysiumToken token = new ElysiumToken(
            name,
            symbol,
            msg.sender,
            royalty,
            royaltyRecipient
        );
        _elysiumCollections[msg.sender].push(address(token));
        _elysiumCollection[address(token)] = true;
        emit CreatedCollection(msg.sender, address(token), name, symbol);
    }

    function getUserCollections() external view returns (address[] memory) {
        return _elysiumCollections[msg.sender];
    }

    function isElysiumCollection(address token) external view returns (bool) {
        return _elysiumCollection[token];
    }
}
