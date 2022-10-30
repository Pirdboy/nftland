const { ethers } = require('hardhat');

const BaseURI = "http://static.pirddev.life/nftland/"

// const NFTLandCollectionContractAddress = "0xAD48B195fb85796f8336AD370CE79e4d45655D83";
// const NFTLandMarketContractAddress = "0x144b57935B0c0D785FCEd2C935103af87309A0fA";

const main = async () => {
    // owner2暂时部署不了, 只能用owner1
    let [owner1, owner2] = await ethers.getSigners();
    console.log("owner", owner1.address); // 0x8397CDfDf802791572987329AEf11639B348501A
    
    let nftlandCollectionAddress = '0xAD48B195fb85796f8336AD370CE79e4d45655D83';
    let NFTLandCollection = await ethers.getContractFactory('NFTLandCollection');
    let nftLandCollection = NFTLandCollection.connect(owner1).attach(nftlandCollectionAddress);

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