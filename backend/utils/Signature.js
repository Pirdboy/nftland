const {ethers} = require('ethers');

class Signature {
    static VerifyEIP191Signature(message, signature, signerAddress) {
        if(!message || !signature || !signerAddress) {
            return false;
        }
        return ethers.utils.verifyMessage(message, signature) === signerAddress;
    }
}

module.exports = {
    Signature
}