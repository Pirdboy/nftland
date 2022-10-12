const { ethers } = require('hardhat');

const main = async () => {
    const BaseURI = "ipfs://QmXmGZ1Bjqa8zry8gHbgGGS85ETMUCcFiGj4GnRo6NtaZh/";
    let [_, owner] = await ethers.getSigners();
    console.log("owner", owner.address);
    const BirdNFT = await ethers.getContractFactory('BirdNFT');
    const birdNFT = await BirdNFT.connect(owner).deploy(BaseURI);
    await birdNFT.deployed();
    console.log("deployed at address", birdNFT.address);
};

main()