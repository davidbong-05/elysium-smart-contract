// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface elysiumNFTFactoryInterface {
    function createNFTCollection(
        string memory _name,
        string memory _symbol,
        uint256 _royalty
    ) external;

    function isElysiumNFT(address _nft) external view returns (bool);
}

interface elysiumNFTInterface {
    function getRoyalty() external view returns (uint256);

    function getRoyaltyRecipient() external view returns (address);
}

/* NFT Marketplace
    List NFT, 
    Buy NFT, 
    & support Royalty
*/
contract ElysiumNFTMarketplace is Ownable, ReentrancyGuard {
    elysiumNFTFactoryInterface private immutable elysiumNFTFactory;

    uint256 private platformFee = 0.001 ether;
    address payable private feeRecipient;

    struct ListNFT {
        address nft;
        uint256 tokenId;
        address payable seller;
        uint256 price;
        bool sold;
        //TODO add expired date
    }

    // nft => tokenId => list struct
    mapping(address => mapping(uint256 => ListNFT)) private listNfts;

    // events
    event ListedNFT(
        address indexed nft,
        uint256 indexed tokenId,
        uint256 price,
        address indexed seller
    );
    event BoughtNFT(
        address indexed nft,
        uint256 indexed tokenId,
        uint256 price,
        address seller,
        address indexed buyer
    );

    constructor(
        uint256 _platformFee,
        elysiumNFTFactoryInterface _elysiumNFTFactory
    ) {
        platformFee = _platformFee;
        feeRecipient = payable(msg.sender);
        elysiumNFTFactory = _elysiumNFTFactory;
    }

    modifier isElysiumNFT(address _nft) {
        require(elysiumNFTFactory.isElysiumNFT(_nft), "not Elysium NFT");
        _;
    }

    modifier isListedNFT(address _nft, uint256 _tokenId) {
        ListNFT memory listedNFT = listNfts[_nft][_tokenId];
        require(
            listedNFT.seller != address(0) && !listedNFT.sold,
            "not listed"
        );
        _;
    }

    modifier isNotListedNFT(address _nft, uint256 _tokenId) {
        ListNFT memory listedNFT = listNfts[_nft][_tokenId];
        require(
            listedNFT.seller == address(0) || listedNFT.sold,
            "already listed"
        );
        _;
    }

    // @notice List NFT on Marketplace
    function listNft(
        address _nft,
        uint256 _tokenId,
        uint256 _price
    ) external isElysiumNFT(_nft) {
        IERC721 nft = IERC721(_nft);
        require(nft.ownerOf(_tokenId) == msg.sender, "not nft owner");
        require(
            _price > platformFee,
            "price must be greater than platform fee"
        );
        nft.transferFrom(msg.sender, address(this), _tokenId);

        listNfts[_nft][_tokenId] = ListNFT({
            nft: _nft,
            tokenId: _tokenId,
            seller: payable(msg.sender),
            price: _price,
            sold: false
        });

        emit ListedNFT(_nft, _tokenId, _price, msg.sender);
    }

    // @notice Cancel listed NFT
    function cancelListNFT(
        address _nft,
        uint256 _tokenId
    ) external isListedNFT(_nft, _tokenId) {
        ListNFT memory listedNFT = listNfts[_nft][_tokenId];
        require(
            listedNFT.seller == msg.sender,
            "Only original owner can cancel listing"
        );
        IERC721(_nft).transferFrom(address(this), msg.sender, _tokenId);
        delete listNfts[_nft][_tokenId];
    }

    // @notice Buy listed NFT
    function buyNFT(
        address _nft,
        uint256 _tokenId
    ) public payable isListedNFT(_nft, _tokenId) {
        ListNFT storage listedNft = listNfts[_nft][_tokenId];

        require(!listedNft.sold, "nft already sold");
        require(msg.value >= listedNft.price, "Insufficient payment");

        listedNft.sold = true;

        uint256 totalPayment = msg.value;
        elysiumNFTInterface nft = elysiumNFTInterface(listedNft.nft);
        address royaltyRecipient = nft.getRoyaltyRecipient();
        uint256 royalty = nft.getRoyalty();

        if (royalty > 0) {
            uint256 royaltyTotal = calculateRoyalty(royalty, listedNft.price);

            // Transfer royalty fee to collection owner
            payable(royaltyRecipient).transfer(royaltyTotal);
            totalPayment -= royaltyTotal;
        }

        // Transfer platform fee
        payable(feeRecipient).transfer(platformFee);
        totalPayment -= platformFee;

        // Transfer to nft owner
        payable(listedNft.seller).transfer(totalPayment);

        // Transfer NFT to buyer
        IERC721(listedNft.nft).safeTransferFrom(
            address(this),
            msg.sender,
            listedNft.tokenId
        );

        emit BoughtNFT(
            listedNft.nft,
            listedNft.tokenId,
            listedNft.price,
            listedNft.seller,
            msg.sender
        );
    }

    function buyBulkNFTs(
        address[] memory _nfts,
        uint256[] memory _tokenIds
    ) external payable {
        uint256 totalPrice = 0;
        ListNFT[] memory listedNfts = new ListNFT[](_nfts.length);
        for (uint256 i = 0; i < _nfts.length; i++) {
            listedNfts[i] = listNfts[_nfts[i]][_tokenIds[i]];
            totalPrice += listedNfts[i].price;
        }
        require(msg.value >= totalPrice, "Insufficient ether provided");
        uint256 totalPayment = msg.value;
        uint256 payment = 0;

        for (uint256 i = 0; i < _nfts.length; i++) {
            require(listedNfts[i].seller != address(0), "not listed");
            require(!listedNfts[i].sold, "nft already sold");
            require(msg.value >= listedNfts[i].price, "Insufficient payment");
            payment = listedNfts[i].price;
            listedNfts[i].sold = true;

            elysiumNFTInterface nft = elysiumNFTInterface(listedNfts[i].nft);
            address royaltyRecipient = nft.getRoyaltyRecipient();
            uint256 royalty = nft.getRoyalty();

            if (royalty > 0) {
                uint256 royaltyTotal = calculateRoyalty(
                    royalty,
                    listedNfts[i].price
                );

                // Transfer royalty fee to collection owner
                payable(royaltyRecipient).transfer(royaltyTotal);
                payment -= royaltyTotal;
            }

            // Transfer platform fee
            payable(feeRecipient).transfer(platformFee);
            payment -= platformFee;

            // Transfer to nft owner
            payable(listedNfts[i].seller).transfer(payment);
            totalPayment -= listedNfts[i].price;

            // Transfer NFT to buyer
            IERC721(listedNfts[i].nft).safeTransferFrom(
                address(this),
                msg.sender,
                listedNfts[i].tokenId
            );

            emit BoughtNFT(
                listedNfts[i].nft,
                listedNfts[i].tokenId,
                listedNfts[i].price,
                listedNfts[i].seller,
                msg.sender
            );
        }
        payable(msg.sender).transfer(totalPayment);
    }

    function getPlatformFee() public view returns (uint256) {
        return platformFee;
    }

    function getFeeRecipient() public view returns (address) {
        return feeRecipient;
    }

    function calculateRoyalty(
        uint256 _royalty,
        uint256 _price
    ) public pure returns (uint256) {
        return (_price * _royalty) / 10000;
    }

    function getListedNFT(
        address _nft,
        uint256 _tokenId
    ) public view returns (ListNFT memory) {
        return listNfts[_nft][_tokenId];
    }

    function updatePlatformFee(uint256 _platformFee) external onlyOwner {
        require(_platformFee >= 0, "Cannot be negative");
        platformFee = _platformFee;
    }

    function changeFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "can't be 0 address");
        feeRecipient = payable(_feeRecipient);
    }
}
