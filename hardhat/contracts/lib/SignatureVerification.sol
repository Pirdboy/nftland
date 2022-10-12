// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract SignatureVerification {
    function _verify(
        address _signer,
        bytes32 _hashedMessage,
        bytes memory _signature
    ) internal pure returns (bool) {
        (bytes32 r, bytes32 s, uint8 v) = _splitSignature(_signature);
        address signerDerived = ecrecover(_hashedMessage, v, r, s);
        return signerDerived == _signer;
    }

    function _splitSignature(bytes memory _signature)
        internal
        pure
        returns (
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        require(_signature.length == 65, "invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(_signature, 32))
            // second 32 bytes
            s := mload(add(_signature, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(_signature, 96)))
        }
    }
}
