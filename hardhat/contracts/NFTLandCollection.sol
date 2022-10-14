// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTLandCollection is ERC1155, Ownable {
    using Strings for string;

    string public name;
    string public symbol;
    mapping(uint => uint) totalSupply;  // tokenId => amount
    address private market;

    constructor(string memory _baseURI) ERC1155(_baseURI) {
        name = "NFTLandCollection";
        symbol = "NLC";
    }

    modifier onlyMarket() {
        require(msg.sender == market, "only Market");
        _;
    }

    function mint(address _creator, uint _id, uint _amount) onlyMarket external {
        require(!exist(_id), "this token has been minted");
        _mint(_creator, _id, _amount, "");
        totalSupply[_id] = _amount;
    }

    function exist(uint _id) view public returns (bool) {
        return totalSupply[_id] > 0;
    }

    function isApprovedForAll(address _account, address _operator) public view virtual override returns (bool) {
        if(_operator != address(0) && _operator == market) {
            return true;
        }
        return ERC1155.isApprovedForAll(_account, _operator);
    }

    function setMarket(address _market) onlyOwner external {
        market = _market;
    }
}
