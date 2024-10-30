// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface elysiumTokenFactoryInterface {
    function createCollection(
        string memory name,
        string memory symbol,
        uint256 royalty,
        address payable royaltyRecipient
    ) external;
}

interface elysiumTokenInterface {
    function getRoyalty() external view returns (uint256);

    function getRoyaltyRecipient() external view returns (address);
}

/* Token Marketplace
    List Token, 
    Buy Token, 
    & support Royalty
*/
/// @custom:security-contact davidbong05@gmail.com
contract ElysiumTokenMarketplace is Ownable{

    elysiumTokenFactoryInterface private immutable _elysiumTokenFactory;
    uint256 private _platformFee = 0.001 ether;
    address payable private _feeRecipient;

    struct ListToken {
        address token;
        uint256 tokenId;
        address payable seller;
        uint256 price;
        bool sold;
        //TODO add expired date
    }

    // token => tokenId => list struct
    mapping(address => mapping(uint256 => ListToken)) private _listedTokens;

    // events
    event ListedToken(
        address indexed token,
        uint256 indexed tokenId,
        uint256 price,
        address indexed seller
    );
    event BoughtToken(
        address indexed token,
        uint256 indexed tokenId,
        uint256 price,
        address seller,
        address indexed buyer
    );

    constructor(
        uint256 platformFee,
        elysiumTokenFactoryInterface elysiumTokenFactory
    )Ownable(msg.sender) {
        _platformFee = platformFee;
        _feeRecipient = payable(msg.sender);
        _elysiumTokenFactory = elysiumTokenFactory;
    }

    modifier isListedToken(address token, uint256 tokenId) {
        ListToken memory listedToken = _listedTokens[token][tokenId];
        require(
            listedToken.seller != address(0) && !listedToken.sold,
            "not listed"
        );
        _;
    }

    modifier isNotListedToken(address token, uint256 tokenId) {
        ListToken memory listedToken = _listedTokens[token][tokenId];
        require(
            listedToken.seller == address(0) || listedToken.sold,
            "already listed"
        );
        _;
    }

    // @notice List Token on Marketplace
    function listToken(
        address collectionAddress,
        uint256 tokenId,
        uint256 price
    ) external {
        IERC721 token = IERC721(collectionAddress);
        require(token.ownerOf(tokenId) == msg.sender, "not token owner");
        require(
            price > _platformFee,
            "price must be greater than platform fee"
        );
        token.transferFrom(msg.sender, address(this), tokenId);

        _listedTokens[collectionAddress][tokenId] = ListToken({
            token: collectionAddress,
            tokenId: tokenId,
            seller: payable(msg.sender),
            price: price,
            sold: false
        });

        emit ListedToken(collectionAddress, tokenId, price, msg.sender);
    }

    // @notice Cancel listed Token
    function unlistToken(
        address collectionAddress,
        uint256 tokenId
    ) external isListedToken(collectionAddress, tokenId) {
        ListToken memory listedToken = _listedTokens[collectionAddress][tokenId];
        require(
            listedToken.seller == msg.sender,
            "not token owner"
        );
        IERC721(collectionAddress).transferFrom(address(this), msg.sender, tokenId);
        delete _listedTokens[collectionAddress][tokenId];
    }

    // @notice Buy listed Token
    function buyToken(
        address collectionAddress,
        uint256 tokenId
    ) public payable isListedToken(collectionAddress, tokenId) {
        // Retrieve the Token listing
        ListToken storage listedToken = _listedTokens[collectionAddress][tokenId];

        // Ensure sufficient payment is provided
        require(msg.value >= listedToken.price, "insufficient payment");

        // Mark the Token as sold
        listedToken.sold = true;

        uint256 totalPayment = msg.value;
        elysiumTokenInterface token = elysiumTokenInterface(listedToken.token);
        address royaltyRecipient = token.getRoyaltyRecipient();
        uint256 royalty = token.getRoyalty();

        // Handle royalty payment
        if (royalty > 0) {
            uint256 royaltyTotal = getCalculatedRoyalty(royalty, listedToken.price);

            // Transfer royalty fee to collection owner
            payable(royaltyRecipient).transfer(royaltyTotal);
            totalPayment -= royaltyTotal;
        }

        // Transfer platform fee
        if(_platformFee>0)
        {
            payable(_feeRecipient).transfer(_platformFee);
            totalPayment -= _platformFee;
        }

        // Transfer remaining payment to Token owner
        payable(listedToken.seller).transfer(totalPayment);

        // Transfer the Token to the buyer
        IERC721(listedToken.token).safeTransferFrom(
            address(this),
            msg.sender,
            listedToken.tokenId
        );

        // Emit the purchase event
        emit BoughtToken(
            listedToken.token,
            listedToken.tokenId,
            listedToken.price,
            listedToken.seller,
            msg.sender
        );
    }

    function buyTokens(
        address[] memory collectionAddresses,
        uint256[] memory tokenIds
    ) external payable {
        uint256 totalPayment = msg.value;

        for (uint256 i = 0; i < collectionAddresses.length; i++) {
            ListToken storage listedToken = _listedTokens[collectionAddresses[i]][tokenIds[i]];
            
            // Check token state
            require(!listedToken.sold && listedToken.seller != address(0), "Token not available");
            require(totalPayment >= listedToken.price, "Insufficient payment");

            uint256 payment = listedToken.price;
            listedToken.sold = true;

            // Royalty processing
            elysiumTokenInterface token = elysiumTokenInterface(listedToken.token);
            uint256 royaltyTotal = getCalculatedRoyalty(token.getRoyalty(), listedToken.price);
            
            if (royaltyTotal > 0) {
                payable(token.getRoyaltyRecipient()).transfer(royaltyTotal);
                payment -= royaltyTotal;
            }

            // Platform fee and seller payment
            if(_platformFee>0)
            {
                _feeRecipient.transfer(_platformFee);
                payment -= _platformFee;
            }
            listedToken.seller.transfer(payment);

            // Transfer token to buyer
            IERC721(listedToken.token).safeTransferFrom(address(this), msg.sender, listedToken.tokenId);

            // Emit event
            emit BoughtToken(
                listedToken.token,
                listedToken.tokenId,
                listedToken.price,
                listedToken.seller,
                msg.sender
            );

            // Deduct payment from total
            totalPayment -= listedToken.price;
        }

        // Refund excess payment
        if (totalPayment > 0) {
            payable(msg.sender).transfer(totalPayment);
        }
    }

    function getPlatformFee() public view returns (uint256) {
        return _platformFee;
    }

    function getFeeRecipient() public view returns (address) {
        return _feeRecipient;
    }

    function getCalculatedRoyalty(
        uint256 _royalty,
        uint256 price
    ) public pure returns (uint256) {
        return (price * _royalty) / 10000;
    }

    function getListedToken(
        address token,
        uint256 tokenId
    ) public view returns (ListToken memory) {
        return _listedTokens[token][tokenId];
    }

    function updatePlatformFee(uint256 platformFee) external onlyOwner {
        require(platformFee >= 0, "cannot be negative");
        _platformFee = platformFee;
    }

    function updateFeeRecipient(address feeRecipient) external onlyOwner {
        require(feeRecipient != address(0), "can't be 0 address");
        _feeRecipient = payable(feeRecipient);
    }
}
