// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import "./ElysiumToken.sol";

/* Elysium Token Factory
    Create new elysium token collection
*/
/// @custom:security-contact davidbong@gmail.com
contract ElysiumTokenFactory{
    // owner address => collection list
    address[] private _elysiumUsers;
    address[] private _elysiumCollections;
    mapping(address => address[]) private _elysiumUserCollections;
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
        if (_elysiumUserCollections[msg.sender].length == 0) {
            _elysiumUsers.push(msg.sender);
        }
        _elysiumUserCollections[msg.sender].push(address(token));
        _elysiumCollection[address(token)] = true;
        _elysiumCollections.push(address(token));
        emit CreatedCollection(msg.sender, address(token), name, symbol);
    }

    function getAllCollections() external view returns (address[][] memory) {
        address[][] memory collections = new address[][](_elysiumUsers.length);

        for (uint i = 0; i < _elysiumUsers.length; i++) {
            collections[i] = _elysiumUserCollections[_elysiumUsers[i]];
        }

        return collections;
    }

    function getAllCollections(uint256 start,uint256 pagination) external view returns (address[] memory) {
        uint256 totalCount = _elysiumCollections.length;
        uint256 end = start + pagination;

        if (start >= totalCount) {
            return new address[](0);
        }

        if (end > totalCount) {
            end = totalCount;
        }

        uint256 resultSize = end - start;
        address[] memory result = new address[](resultSize);

        for (uint256 i = 0; i < resultSize; i++) {
            result[i] = _elysiumCollections[start + i];
        }

        return result;
    }

    function getAllUsers() external view returns (address[] memory) {
        return _elysiumUsers;
    }

    function getAllUsers(uint256 start,uint256 pagination) external view returns (address[] memory) {
        uint256 totalCount = _elysiumUsers.length;
        uint256 end = start + pagination;

        if (start >= totalCount) {
            return new address[](0);
        }

        if (end > totalCount) {
            end = totalCount;
        }

        uint256 resultSize = end - start;
        address[] memory result = new address[](resultSize);

        for (uint256 i = 0; i < resultSize; i++) {
            result[i] = _elysiumUsers[start + i];
        }

        return result;
    }

    function getUserCollections(address userAddress) external view returns (address[] memory) {
        return _elysiumUserCollections[userAddress];
    }

    function isElysiumCollection(address collectionAddress) external view returns (bool) {
        return _elysiumCollection[collectionAddress];
    }
}
