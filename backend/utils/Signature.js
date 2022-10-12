const {ethers} = require('ethers');

class Signature {
    static VerifyEIP191Signature(message, signature, signerAddress) {
        return ethers.utils.verifyMessage(message, signature) === signerAddress;
    }
}

module.exports = {
    Signature
}