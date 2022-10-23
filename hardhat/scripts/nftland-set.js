const { ethers } = require('hardhat');
const {ethers: ethers2} = require('ethers');

const BaseURI = "http://192.168.25.129/nftland/static/"

const main = async () => {
    let [owner1, owner2] = await ethers.getSigners();
    console.log("owner", owner1.address); // 0x8397CDfDf802791572987329AEf11639B348501A
    let nftlandCollectionAddress = "0x94e462Bf36335c192919b1f10742A6B8EAd20F12";
    let nftlandMarketAddress = "0xe4dcd09593a95F980638F1d2c3842E59E953d9bc";

    let NFTLandCollection = await ethers.getContractFactory('NFTLandCollection');
    NFTLandCollection = NFTLandCollection.connect(owner1);
    let contract1 = NFTLandCollection.attach(nftlandCollectionAddress);
    let txResponse = await contract1.setMarket(nftlandMarketAddress);
    await txResponse.wait();
    console.log('setMarket success');

    let NFTLandMarket = await ethers.getContractFactory('NFTLandMarket');
    NFTLandMarket = NFTLandMarket.connect(owner1);
    let contract2 = NFTLandMarket.attach(nftlandMarketAddress);
    txResponse = await contract2.setNFTLandCollection(nftlandCollectionAddress);
    await txResponse.wait();
    console.log('setNFTLandCollection success');
};

main()