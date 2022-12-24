// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./lib/SignatureVerification.sol";
import "./lib/Pauseable.sol";
import "./lib/TransferHelper.sol";
import "./interface/INFTLandCollection.sol";

struct SaleParameters {
    uint256 tokenId;
    address tokenAddress;
    address offerer;
    uint256 amount;
    uint256 price;
    uint256 startTime; // 毫秒时间戳
    address creator; // 如果是外部NFT则为address(0)
    uint256 totalSupply; // 如果是外部NFT则为0
    uint8 tokenType;
    bool minted;
}

struct EIP712Domain {
    string name;
    string version;
    uint256 chainId;
    address verifyingContract;
    bytes32 salt;
}

enum SaleState {
    Created,
    Executed,
    Canceled
}

contract NFTLandMarketV1 is SignatureVerification, Ownable, ReentrancyGuard, Pauseable {
    bytes32 constant salt = 0xcab6554389422575ff776cbe4c196fff08454285c466423b2f91b6ebfa166ca5;
    uint256 private constant CHAINID = 5;
    bytes32 private constant SALE_PARAMETERS_TYPEHASH =
        keccak256(
            "SaleParameters(uint256 tokenId,address tokenAddress,address offerer,uint256 amount,uint256 price,uint256 startTime,address creator,uint256 totalSupply,uint8 tokenType,bool minted)"
        );
    bytes32 private constant EIP712_DOMAIN_TYPEHASH =
        keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)"
        );
    bytes32 private immutable DOMAIN_SEPARATOR;
    uint256 private constant TOKEN_TYPE_ERC721 = 1;
    uint256 private constant TOKEN_TYPE_ERC1155 = 2;

    // 98%的费用归offerer所有
    uint256 private constant offererFeeNumerator = 98;
    uint256 private constant offererFeeDenominator = 100;

    address private nftlandCollection;
    mapping(bytes => SaleState) private saleStateMap;

    event SaleExecuted(bytes signature, address offerer, address buyer);

    event SaleCanceled(bytes signature);

    constructor() {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256("nftland"),
                keccak256("1.0"),
                CHAINID,
                address(this),
                salt
            )
        );
    }

    modifier notResolvedSaleOrder(bytes memory _signature) {
        require(
            saleStateMap[_signature] < SaleState.Executed,
            "saleorder already executed or canceled"
        );
        _;
    }

    function cancelSale(SaleParameters memory _sale, bytes memory _signature)
        external
        notPaused
        notResolvedSaleOrder(_signature)
    {
        bool verifyOk = _verify(msg.sender, getSaleTypedDataHash(_sale), _signature);
        require(verifyOk, "sale signature incorrect");

        saleStateMap[_signature] = SaleState.Canceled;
        emit SaleCanceled(_signature);
    }

    function executeSaleOrder(SaleParameters memory _sale, bytes memory _signature)
        external
        payable
        notPaused
        nonReentrant
        notResolvedSaleOrder(_signature)
    {
        bool verifyOk = _verify(_sale.offerer, getSaleTypedDataHash(_sale), _signature);
        require(verifyOk, "sale signature incorrect");
        require(msg.value == _sale.price * _sale.amount, "please pay the correct price");
        saleStateMap[_signature] = SaleState.Executed;

        address offerer = _sale.offerer;
        address tokenAddress = _sale.tokenAddress;
        uint tokenId = _sale.tokenId;
        uint amount = _sale.amount;
        uint totalSupply = _sale.totalSupply;
        // 1. 如果地址是内部NFT,mint代币
        if (tokenAddress == nftlandCollection) {
            bool exist = INFTLandCollection(tokenAddress).exist(tokenId);
            if (!exist) {
                INFTLandCollection(tokenAddress).mint(offerer, tokenId, totalSupply);
            }
        }

        // 2. 进行转账
        // 如何区分ERC721和ERC1155
        // ERC721
        // function transferFrom(address from, address to, uint256 tokenId) external;
        // function safeTransferFrom(address from, address to, uint256 tokenId) external;
        // function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
        // ERC1155
        // function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external;
        bool success;
        if (_sale.tokenType == TOKEN_TYPE_ERC1155) {
           success = TransferHelper.erc1155SafeTransferfrom(
                tokenAddress,
                offerer,
                msg.sender,
                tokenId,
                amount
            );
        } else {
            success = TransferHelper.erc721SafeTransferFrom(tokenAddress, offerer, msg.sender, tokenId);
        }

        // 3. 给offerer转账
        payable(offerer).transfer(msg.value * offererFeeNumerator / offererFeeDenominator);

        // 4. 记录sale状态, 触发事件
        saleStateMap[_signature] = SaleState.Executed;
        emit SaleExecuted(_signature, offerer, msg.sender);
    }

    function getSaleTypedDataHash(SaleParameters memory _sale) private view returns (bytes32) {
        return keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, getSaleStructHash(_sale)));
    }

    function getSaleStructHash(SaleParameters memory _sale) private pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    SALE_PARAMETERS_TYPEHASH,
                    _sale.tokenId,
                    _sale.tokenAddress,
                    _sale.offerer,
                    _sale.amount,
                    _sale.price,
                    _sale.startTime,
                    _sale.creator,
                    _sale.totalSupply,
                    _sale.tokenType,
                    _sale.minted
                )
            );
    }

    function getSaleState(bytes memory _signature) public view returns (SaleState) {
        return saleStateMap[_signature];
    }

    function setNFTLandCollection(address _addr) external onlyOwner {
        nftlandCollection = _addr;
    }

    function withdraw(address _to) external onlyOwner nonReentrant {
        require(_to != address(0), "withdraw to zero address is not allowed");
        payable(_to).transfer(address(this).balance);
    }
}
