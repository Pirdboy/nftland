const {ethers} = require('ethers');

class Signature {
    static VerifyEIP191Signature(message, signature, signerAddress) {
        if(!message || !signature || !signerAddress) {
            return false;
        }
        return ethers.utils.verifyMessage(message, signature) === signerAddress;
    }

    static VerifyEIP712Signature(domain, types, values, signature, signerAddress) {
        if(!domain || !types || !values || !signature || !signerAddress) {
            return false;
        }
        return ethers.utils.verifyTypedData(domain, types, values, signature) === signerAddress;
    }
}

module.exports = {
    Signature
}