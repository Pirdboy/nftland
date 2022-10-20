// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

library TransferHelper {
    function erc721SafeTransferFrom(
        address _token,
        address _from,
        address _to,
        uint256 _tokenId
    ) internal returns (bool success){
        (success,) = _token.call(
            // bytess4(keccak256(bytes('safeTransferFrom(address,address,uint256)')))
            abi.encodeWithSelector(0x42842e0e, _from, _to, _tokenId)
        );
    }

    function erc1155SafeTransferfrom(
        address _token,
        address _from,
        address _to,
        uint256 _tokenId,
        uint256 _amount
    ) internal returns (bool success) {
        (success,) = _token.call(
            // bytess4(keccak256(bytes('safeTransferFrom(address,address,uint256,uint256,bytes)')))
            abi.encodeWithSelector(0xf242432a, _from, _to, _tokenId, _amount, "")
        );
    }
}
