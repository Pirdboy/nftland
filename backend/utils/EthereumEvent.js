const { ethers } = require("ethers");
const NFTLandCollectionABI = require('./abis/NFTLandCollection.json');
const NFTLandMarketABI = require('./abis/NFTLandMarket.json');
const {
    NFTLandCollectionContractAddress,
    NFTLandMarketContractAddress
} = require('../constants/index');
const { httpApiKey } = require('../configs').alchemy.goerli;
const { GetMongoCollection } = require('./MongoDB');
const {
    ObjectIdToTokenId,
    TokenIdToObjectId
} = require('./NFT');

const ethersProvider = new ethers.providers.StaticJsonRpcProvider(httpApiKey);

const nftlandCollectionContract = new ethers.Contract(
    NFTLandCollectionContractAddress,
    NFTLandCollectionABI,
    ethersProvider
);

const nftMarketContract = new ethers.Contract(
    NFTLandMarketContractAddress,
    NFTLandMarketABI,
    ethersProvider
);

const EthereumEventListenOn = () => {
    console.log('EthereumEventListenOn');
    nftlandCollectionContract.on('Mint', async (creator, tokenId, amount) => {
        try {
            console.log(`event Mint |creator:${creator} |tokenId:${tokenId} |amount:${amount}`);
            const now = Date.now();
            const collection = GetMongoCollection('nft');
            const _id = TokenIdToObjectId(tokenId?.toString());
            await collection.updateOne(
                { _id: _id },
                {
                    $set: { 'minted': true, 'updateAt': now }
                }
            );
            console.log('event Mint listener success');
        } catch (error) {
            console.log('event Mint error',error);
        }
    });
    nftMarketContract.on('SaleExecuted', async (signature, offerer, buyer) => {
        try {
            console.log(`event SaleExecuted |signature:${signature} |offerer:${offerer} |buyer:${buyer}`);
            const now = Data.now();
            const saleCollection = GetMongoCollection('sale_order');
            await saleCollection.updateOne(
                { signature: signature },
                {
                    $set: { 'buyer': buyer, 'status': 2, 'finishedTime': now }
                }
            )
            let results = await saleCollection.find({
                signature: signature
            }).toArray();
            if (!results || results.length === 0) {
                console.log("no results find");
                return;
            }
            let { tokenId, tokenAddress, amount, offerer } = results[0];
            if (tokenAddress === NFTLandCollectionContractAddress) {
                let incAmount = Number(amount);
                let decAmount = -Number(amount);
                const offererKey = `owners.${offerer}`;
                const buyerKey = `owners.${buyer}`;
                const nftCollection = GetMongoCollection('nft');
                let _id = TokenIdToObjectId(tokenId);
                await nftCollection.updateOne(
                    { _id: _id },
                    {
                        $set: { 'updateAt': now },
                        $inc: { [offererKey]: decAmount, [buyerKey]: incAmount }
                    }
                );
            }
            console.log('event SaleExecuted listener success');
        } catch (error) {
            console.log('event SaleExecuted error:', error);
        }
    });
    nftMarketContract.on('SaleCanceled', async (signature) => {
        try {
            console.log(`event SaleCanceled |signature:${signature}`);
            const collection = GetMongoCollection('sale_order');
            await collection.updateOne(
                { signature: signature },
                {
                    $set: { 'status': 2 }
                }
            )
            console.log('event SaleCanceled listener success');
        } catch (error) {
            console.log('event SaleCanceled error', error);
        }

    });
};

const EthereumEventListenOff = () => {
    nftlandCollectionContract.removeAllListeners('Mint');
    nftMarketContract.removeAllListeners('SaleExecuted');
    nftMarketContract.removeAllListeners('SaleCanceled');
};

module.exports = {
    EthereumEventListenOn,
    EthereumEventListenOff
}