// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./lib/SignatureVerification.sol";
import "./lib/Pauseable.sol";
import "./interface/INFTLandCollection.sol";

struct SaleOrder {
    uint256 tokenId;
    address tokenAddress;
    address offerer;
    uint256 amount;
    uint256 price;
    uint256 startTime;
}

struct EIP712Domain {
    string name;
    string version;
    uint256 chainId;
    address verifyingContract;
    bytes32 salt;
}

enum SaleOrderState {
    Created,
    Executed,
    Canceled
}

contract NFTLandMarket is SignatureVerification, Ownable, ReentrancyGuard, Pauseable {
    bytes32 constant salt = 0xcab6554389422575ff776cbe4c196fff08454285c466423b2f91b6ebfa166ca5;
    uint private constant chainId = 5;
    bytes32 private constant SALEORDER_TYPEHASH =
        keccak256(
            "SaleOrder(uint256 tokenId,address tokenAddress,address offerer,uint256 amount,uint256 price,uint256 startTime)"
        );
    bytes32 private constant EIP712_DOMAIN_TYPEHASH =
        keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)"
        );
    bytes32 private immutable DOMAIN_SEPARATOR;

    address private nftlandCollection;
    mapping(bytes => SaleOrderState) private saleOrderState;

    event SaleOrderExecuted(
        uint256 indexed tokenId,
        address indexed tokenAddress,
        address indexed offerer,
        uint256 amount,
        uint256 price,
        uint256 startTime,
        address buyer
    );

    event SaleOrderCanceled(
        uint256 indexed tokenId,
        address indexed tokenAddress,
        address indexed offerer,
        uint256 amount,
        uint256 price,
        uint256 startTime
    );

    constructor() {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256("nftland"),
                keccak256("1.0"),
                chainId,
                address(this),
                salt
            )
        );
    }

    modifier notResolvedSaleOrder(bytes memory _signature) {
        require(
            saleOrderState[_signature] < SaleOrderState.Executed,
            "saleorder already executed or canceled"
        );
        _;
    }

    function executeSaleOrder(SaleOrder memory _saleOrder, bytes memory _signature)
        external
        payable
        notPaused
        nonReentrant
        notResolvedSaleOrder(_signature)
    {
        bool verifyOk = _verify(
            _saleOrder.offerer,
            getSaleOrderTypedDataHash(_saleOrder),
            _signature
        );
        require(verifyOk, "saleorder signature incorrect");
        require(msg.value == _saleOrder.price * _saleOrder.amount, "please pay the correct price");
        saleOrderState[_signature] = SaleOrderState.Executed;

        address tokenAddress = _saleOrder.tokenAddress;
        uint tokenId = _saleOrder.tokenId;
        // 1. 如果地址是内部NFT,mint代币
        if(tokenAddress == nftlandCollection) {
            bool exist = INFTLandCollection(tokenAddress).exist(tokenId);
            // TODO: order里需要带上totalSupply
            if(!exist) {
                // INFTLandCollection(tokenAddress).mint(_saleOrder.offerer, tokenId,);
            }
        }
        // 2. 进行转账

        // 如何区分ERC721和ERC1155
        // TODO:执行转账
        // ERC721
        // function transferFrom(address from, address to, uint256 tokenId) external;
        // function safeTransferFrom(address from, address to, uint256 tokenId) external;
        // function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
        // ERC1155
        // function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external;
    }

    function cancelSaleOrder(SaleOrder memory _saleOrder, bytes memory _signature)
        external
        notPaused
        notResolvedSaleOrder(_signature)
    {
        bool verifyOk = _verify(msg.sender, getSaleOrderTypedDataHash(_saleOrder), _signature);
        require(verifyOk, "saleorder signature incorrect");

        saleOrderState[_signature] = SaleOrderState.Canceled;
    }

    function getSaleOrderTypedDataHash(SaleOrder memory _saleOrder) private view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, getSaleOrderStructHash(_saleOrder))
            );
    }

    function getSaleOrderStructHash(SaleOrder memory _saleOrder) private pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    SALEORDER_TYPEHASH,
                    _saleOrder.tokenId,
                    _saleOrder.tokenAddress,
                    _saleOrder.offerer,
                    _saleOrder.amount,
                    _saleOrder.price,
                    _saleOrder.startTime
                )
            );
    }

    function getSaleOrderState(bytes memory _signature) public view returns (SaleOrderState) {
        return saleOrderState[_signature];
    }

    function setNFTLandCollection(address _addr) onlyOwner external {
        nftlandCollection = _addr;
    }

    function withdraw(address _to) external onlyOwner nonReentrant {
        require(_to != address(0), "withdraw to zero address is not allowed");
        payable(_to).transfer(address(this).balance);
    }
}
