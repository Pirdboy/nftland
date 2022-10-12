const { ethers } = require('hardhat');

const main = async () => {
    const BaseURI = "ipfs://QmXmGZ1Bjqa8zry8gHbgGGS85ETMUCcFiGj4GnRo6NtaZh/";
    let [_, owner] = await ethers.getSigners();
    console.log("owner", owner.address);
    const SimpleERC1155 = await ethers.getContractFactory('SimpleERC1155');
    const simpleERC1155 = await SimpleERC1155.connect(owner).deploy(BaseURI);
    await simpleERC1155.deployed();

    // 0xD05768845D6e9d9B5Dc98A1d8C65c690Dce6139d
    console.log("deployed at address", simpleERC1155.address);

    // 第一次mint交易费用 0.000000000103347136 Ether
    let txResponse = await simpleERC1155.mint(5);
    await txResponse.wait();

    // 第二次mint交易费用 0.00000000007822514 Ether 
    txResponse = await simpleERC1155.mint(10);
    await txResponse.wait();
};

main()