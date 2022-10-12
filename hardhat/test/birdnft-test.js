const { expect } = require("chai");
const { ethers } = require("hardhat");

const BaseURI = "ipfs://QmXmGZ1Bjqa8zry8gHbgGGS85ETMUCcFiGj4GnRo6NtaZh/";
const NAME = "Colorful Bird";
const SYMBOL = "BIRD";
const mintPrice = ethers.utils.parseEther("0.01");

describe("BirdNFT", function () {
    let birdNFT;
    let owner, signer2;
    beforeEach('Setup Contract', async () => {
        [owner, signer2] = await ethers.getSigners();
        const BirdNFT = await ethers.getContractFactory('BirdNFT');
        birdNFT = await BirdNFT.deploy(BaseURI);
        await birdNFT.deployed();
    });

    it("test state variable", async () => {
        expect(await birdNFT.name()).to.eq(NAME);
        expect(await birdNFT.symbol()).to.eq(SYMBOL);
        expect(await birdNFT.baseURI()).to.eq(BaseURI);
        expect(await birdNFT.baseExtension()).to.eq(".json");
    });

    it("test mintNFT and tokenURI", async () => {
        await expect(birdNFT.mintNFT()).to.be.revertedWith("must send the correct price");
        let tokenId = 1;
        let tokenURI = BaseURI + tokenId + ".json";
        await expect(birdNFT.mintNFT({ value: mintPrice })).not.to.be.reverted;
        expect(await birdNFT.ownerOf(tokenId)).to.eq(owner.address);
        expect(await birdNFT.tokenURI(tokenId)).to.eq(tokenURI);
        expect(await birdNFT.balanceOf(owner.address)).to.eq(1);

        tokenId++;
        tokenURI = BaseURI + tokenId + ".json";
        await expect(birdNFT.connect(signer2).mintNFT({ value: mintPrice })).not.to.be.reverted;
        expect(await birdNFT.ownerOf(tokenId)).to.eq(signer2.address);
        expect(await birdNFT.tokenURI(tokenId)).to.eq(tokenURI);
        expect(await birdNFT.balanceOf(signer2.address)).to.eq(1);
    });

    it("test max balance", async () => {
        expect(birdNFT.setMaxBalance(2)).not.to.be.reverted;
        await expect(birdNFT.connect(signer2).mintNFT({ value: mintPrice })).not.to.be.reverted;
        await expect(birdNFT.connect(signer2).mintNFT({ value: mintPrice })).not.to.be.reverted;
        await expect(birdNFT.connect(signer2).mintNFT({ value: mintPrice })).to.be.revertedWith("balance would exceed max balance");
    });

    it("test setter", async () => {
        await expect(birdNFT.connect(signer2).setBaseURI("")).to.be.revertedWith("only owner is allowed");
        await expect(birdNFT.connect(signer2).setMaxBalance(100)).to.be.revertedWith("only owner is allowed");
        await expect(birdNFT.setBaseExtension(".png")).not.to.be.reverted;
    });
});
