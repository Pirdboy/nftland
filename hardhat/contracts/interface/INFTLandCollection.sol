// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface INFTLandCollection {
    function mint(address _account, uint _id, uint _amount) external;
    function exist(uint _id) view external returns (bool);
}