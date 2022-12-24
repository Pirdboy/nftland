const { ethers, upgrades } = require("hardhat");

// 部署NFTLandMarket可升级合约

const BaseURI = "http://static.pirddev.life/nftland/";

const main = async () => {
    const [owner] = await ethers.getSigners();
    console.log("owner address", owner.address);

    // 1. 部署NFTLandMarket的可升级合约
    const NFTLandMarket = await ethers.getContractFactory('NFTLandMarketV1');
    const nftlandMarket = await upgrades.deployProxy(NFTLandMarket);
    console.log('nftlandMarket(proxy) address', nftlandMarket.address);
    console.log('nftlandMarket(implementation) address', upgrades.erc1967.getImplementationAddress(nftlandMarket.address));
    console.log('nftlandMarket(proxyAdmin) address', upgrades.erc1967.getAdminAddress(nftlandMarket.address));

    // 2. 部署NFTLandCollection
    const NFTLandCollection = await ethers.getContractFactory('NFTLandCollectionV1');
    const nftlandCollection = await upgrades.deployProxy(NFTLandCollection,[BaseURI], {initializer:'initialize'});
    console.log('nftlandCollection(proxy) address', nftlandCollection.address);
    console.log('nftlandCollection(implementation) address', upgrades.erc1967.getImplementationAddress(nftlandCollection.address));
    console.log('nftlandCollection(proxyAdmin) address', upgrades.erc1967.getAdminAddress(nftlandCollection.address));

    // 3. 设置地址
    let txResponse = await nftlandMarket.setNFTLandCollection(nftlandCollection.address);
    await txResponse.wait();
    txResponse = await nftlandCollection.setMarket(nftlandMarket.address);
    await txResponse.wait();
    console.log('address setting ok');

    // 4. 测试
    let isApproved = await nftlandCollection.isApprovedForAll(owner.address, nftlandMarket.address);
    console.log('isApproved for market', isApproved);

};

main();