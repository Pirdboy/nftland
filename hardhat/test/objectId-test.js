const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ObjectId test", function () {
    it("test convert objectId to tokenId", async function () {
        const _id = "507c7f79bcf86cd7994f6c0e";  // 12字节, 固定24个字符
        const tokenId = ethers.BigNumber.from(`0x${_id}`);
        const tokenIdString = tokenId.toString();
        console.log(tokenIdString); // 24909309573555930026044517390

        const tokenId2 = ethers.BigNumber.from(tokenIdString);
        const tokenIdHexString = tokenId2.toHexString();
        console.log(tokenIdHexString.slice(2));
        expect(tokenIdHexString).to.eq(`0x${_id}`);
    });
});
