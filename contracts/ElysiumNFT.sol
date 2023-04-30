// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/*  NFT-ERC721 */
contract ElysiumNFT is
    ERC721,
    ERC721URIStorage,
    ERC721Enumerable,
    ERC721Burnable,
    Ownable
{
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    uint256 private royalty;
    address payable private royaltyRecipient;

    event NewNFTMinted(uint256 tokenId, address owner, string tokenUri);

    constructor(
        string memory _name,
        string memory _symbol,
        address _owner,
        uint256 _royalty,
        address _royaltyRecipient
    ) ERC721(_name, _symbol) {
        require(_royalty <= 10000, "can't more than 10 percent");
        require(_royaltyRecipient != address(0));
        royalty = _royalty;
        royaltyRecipient = payable(_royaltyRecipient);
        transferOwnership(_owner);
    }

    function safeMint(address _to, string memory _uri) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(_to, tokenId);
        _setTokenURI(tokenId, _uri);

        emit NewNFTMinted(tokenId, _to, _uri);
    }

    // The following functions are overrides required by Solidity.

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function getRoyalty() external view returns (uint256) {
        return royalty;
    }

    function getRoyaltyRecipient() external view returns (address) {
        return royaltyRecipient;
    }

    function updateRoyalty(uint256 _royalty) external onlyOwner {
        require(_royalty <= 10000, "can't more than 10 percent");
        royalty = _royalty;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
