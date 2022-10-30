const { ethers } = require('ethers');

class Signature {
    static VerifyEIP191Signature(message, signature, signerAddress) {
        if (!message || !signature || !signerAddress) {
            return false;
        }
        let address = ethers.utils.verifyMessage(message, signature);
        return address.toLowerCase() === signerAddress.toLowerCase();
    }

    static VerifyEIP712Signature(domain, types, values, signature, signerAddress) {
        if (!domain || !types || !values || !signature || !signerAddress) {
            return false;
        }
        let address = ethers.utils.verifyTypedData(domain, types, values, signature);
        return address.toLowerCase() === signerAddress.toLowerCase();
    }
}

module.exports = {
    Signature
}