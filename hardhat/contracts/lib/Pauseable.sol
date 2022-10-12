// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

abstract contract Pauseable {
    uint private constant NOT_PAUSED = 1;
    uint private constant PAUSED = 2;
    
    uint private status;

    constructor() {
        status = NOT_PAUSED;
    }

    modifier notPaused() {
        require(status != PAUSED, "paused");
        _;
    }

    function pause() public {
        status = NOT_PAUSED;
    }

    function resume() public {
        status = PAUSED;
    }
}