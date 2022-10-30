const {ethers} = require('ethers');

class Signature {
    static VerifyEIP191Signature(message, signature, signerAddress) {
        if(!message || !signature || !signerAddress) {
            return false;
        }
        let address = ethers.utils.verifyMessage(message, signature);
        console.log('VerifyEIP191Signature address', address);
        return address === signerAddress;
    }

    static VerifyEIP712Signature(domain, types, values, signature, signerAddress) {
        if(!domain || !types || !values || !signature || !signerAddress) {
            return false;
        }
        let address = ethers.utils.verifyTypedData(domain, types, values, signature);
        console.log('VerifyEIP712Signature address',address);
        return address === signerAddress;
    }
}

module.exports = {
    Signature
}