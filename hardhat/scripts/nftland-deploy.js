const { ethers } = require('hardhat');

const BaseURI = "http://192.168.25.129/nftland/static/"

const main = async () => {
    // owner2暂时部署不了, 只能用owner1
    let [owner1, owner2] = await ethers.getSigners();
    console.log("owner", owner1.address); // 0x8397CDfDf802791572987329AEf11639B348501A
    let nftlandCollectionAddress;
    let NFTLandCollection = await ethers.getContractFactory('NFTLandCollection');
    let nftLandCollection = await NFTLandCollection.connect(owner1).deploy(BaseURI);
    await nftLandCollection.deployed();
    nftlandCollectionAddress = nftLandCollection.address;
    console.log('NFTLandCollection deployed at', nftlandCollectionAddress);
    
    let nftlandMarketAddress;
    let NFTLandMarket = await ethers.getContractFactory('NFTLandMarket');
    let nftLandMarket = await NFTLandMarket.connect(owner1).deploy();
    await nftLandMarket.deployed();
    nftlandMarketAddress = nftLandMarket.address;
    console.log('NFTLandMarket deployed at', nftlandMarketAddress);

    let txResponse = await nftLandCollection.setMarket(nftlandMarketAddress);
    await txResponse.wait();

    txResponse = await nftLandMarket.setNFTLandCollection(nftlandCollectionAddress);
    await txResponse.wait();
    
};

main()