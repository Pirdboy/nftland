const { ethers } = require('hardhat');

const BaseURI = "http://192.168.25.129/nftland/static/"

const main = async () => {
    let [_, owner] = await ethers.getSigners();
    console.log("owner", owner.address);
    let nftlandCollectionAddress;
    let NFTLandCollection = await ethers.getContractFactory('NFTLandCollection');
    let nftLandCollection = await NFTLandCollection.connect(owner).deploy(BaseURI);
    await nftLandCollection.deployed();
    nftlandCollectionAddress = nftLandCollection.address;
    console.log('NFTLandCollection deployed at', nftlandCollectionAddress);
    
    let nftlandMarketAddress;
    let NFTLandMarket = await ethers.getContractFactory('NFTLandMarket');
    let nftLandMarket = await NFTLandMarket.connect(owner).deploy();
    await nftLandMarket.deployed();
    nftlandMarketAddress = nftLandMarket.address;
    console.log('NFTLandMarket deployed at', nftlandMarketAddress);

    let txResponse = await nftLandCollection.setMarket(nftlandMarketAddress);
    await txResponse.wait();

    txResponse = await nftLandMarket.setNFTLandCollection(nftlandCollectionAddress);
    await txResponse.wait();
    
};

main()