// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract BirdNFT is ERC721URIStorage, ReentrancyGuard {
    using Strings for uint256;
    using Counters for Counters.Counter;

    Counters.Counter private tokenId;
    address payable owner;
    uint256 public mintPrice = 0.01 ether;
    uint256 public maxBalance = 20; // 每个人最多只能mint多少个
    uint256 public constant MAX_SUPPLY = 1000;
    string public baseURI;
    string public baseExtension = ".json";

    constructor(string memory aBaseURI) ERC721("Colorful Bird", "BIRD") {
        owner = payable(msg.sender);
        baseURI = aBaseURI;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "only owner is allowed");
        _;
    }

    modifier canMint() {
        require(balanceOf(msg.sender) < maxBalance, "balance would exceed max balance");
        require(tokenId.current() < MAX_SUPPLY, "minted amount reach max");
        require(mintPrice == msg.value, "must send the correct price");
        _;
    }

    function mintNFT() external payable canMint returns (uint) {
        tokenId.increment();
        uint currentTokenId = tokenId.current();
        _safeMint(msg.sender, currentTokenId);

        string memory uri = string(
            abi.encodePacked(currentTokenId.toString(), baseExtension)
        );
        _setTokenURI(currentTokenId, uri);
        return currentTokenId;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory uri) external onlyOwner {
        baseURI = uri;
    }

    function setMaxBalance(uint b) external onlyOwner {
        maxBalance = b;
    }

    function setMintPrice(uint price) external onlyOwner {
        mintPrice = price;
    }

    function setBaseExtension(string memory ext) external onlyOwner {
        baseExtension = ext;
    }

    function withdraw(address to) external onlyOwner {
        uint balance = address(this).balance;
        payable(to).transfer(balance);
    }
}
