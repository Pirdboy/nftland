// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTLandCollectionV1 is ERC1155, Ownable {
    using Strings for string;

    uint private once;
    string public name;
    string public symbol;
    string public baseURI;
    mapping(uint => uint) totalSupply; // tokenId => amount
    address private market;

    event Mint(address creator, uint256 tokenId, uint256 amount);

    constructor() ERC1155("") {
    }
    
    function initialize(string calldata _baseURI) public {
        require(once < 1, "initialize twice");
        name = "NFTLandCollection";
        symbol = "NLC";
        _setURI(_baseURI);
        once = 1;
    }

    modifier onlyMarket() {
        require(msg.sender == market, "only Market");
        _;
    }

    function mint(
        address _creator,
        uint _id,
        uint _amount
    ) external onlyMarket {
        require(!exist(_id), "this token has been minted");
        _mint(_creator, _id, _amount, "");
        totalSupply[_id] = _amount;
        emit Mint(_creator, _id, _amount);
    }

    function uri(uint256 _tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(baseURI, Strings.toString(_tokenId), ".json"));
    }

    function exist(uint _id) public view returns (bool) {
        return totalSupply[_id] > 0;
    }

    function isApprovedForAll(address _account, address _operator)
        public
        view
        virtual
        override
        returns (bool)
    {
        if (_operator != address(0) && _operator == market) {
            return true;
        }
        return ERC1155.isApprovedForAll(_account, _operator);
    }

    function setMarket(address _market) external onlyOwner {
        market = _market;
    }
}
