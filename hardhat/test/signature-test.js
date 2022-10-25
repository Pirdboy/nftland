const { expect } = require("chai");
const { ethers } = require("hardhat");

const SaleDomain = {
    name: "nftland",
    version: '1.0',
    chainId: 5,
    verifyingContract: "0xe4dcd09593a95F980638F1d2c3842E59E953d9bc", // 记得替换为market
    salt: "0xcab6554389422575ff776cbe4c196fff08454285c466423b2f91b6ebfa166ca5", // 固定值
};

const SaleTypes = {
    SaleParameters: [
        { name: 'tokenId', type: 'uint256' },
        { name: 'tokenAddress', type: 'address' },
        { name: 'offerer', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'price', type: 'uint256' },
        { name: "startTime", type: 'uint256' },
        { name: "creator", type: 'address' },
        { name: "totalSupply", type: 'uint256' },
        { name: 'tokenType', type: 'uint8' },
        { name: 'minted', type: 'bool' }
    ]
}

const order = {
    offerer: '0xC1af4aB1EceDEDa57cb28c401094c155B47ba6b8',
    itemType: 1,
    tokenId: 2
}

describe("Signature test", function () {
    it("test js verify", async () => {
        let values = {

        }
        let [_,signer] = await ethers.getSigners();
        let signature = await signer._signTypedData(domain, types, order);
        console.log('signature', signature);
        expect(ethers.utils.verifyTypedData(domain, types, order, signature)).to.eq(signer.address);
    });
});
