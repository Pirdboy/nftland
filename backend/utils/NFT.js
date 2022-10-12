const axios = require('axios').default;
const FormData = require('form-data');
const fs = require('node:fs');
const path = require('node:path');
const { ethers } = require('ethers');
const { ObjectId } = require('mongodb');
const { url: NFTStorageHTTPAPI, apiKey: NFTStorageAPIKey } = require("../configs").nftstorage;
const alchemyConfig = require('../configs').alchemy.goerli;
const { Alchemy } = require("alchemy-sdk");
const alchemy = new Alchemy(alchemyConfig);
const gatewayURL = "https://cloudflare-ipfs.com/ipfs/";

/**
 * 上传IPFS生成MetadataUri
 * @date 2022-09-30
 * @param {string} name
 * @param {string} description
 * @param {string} imagePath
 * @returns {Promise<{ipnft, url, data}>}
 */
const UploadNFT = async (name, description, imagePath) => {
    const imageFileName = path.basename(imagePath);
    const formData = new FormData();
    const meta = {
        name,
        image: null,
        description,
        properties: {}
    }
    formData.append('meta', JSON.stringify(meta));
    formData.append('image', fs.createReadStream(imagePath), imageFileName);
    const res = await axios.post(NFTStorageHTTPAPI, formData, {
        headers: {
            "Authorization": "Bearer " + NFTStorageAPIKey,
            ...formData.getHeaders()
        }
    });
    const resBody = res.data;
    if (!resBody.ok) {
        throw new Error("ipfs error: " + resBody.error.message);
    }
    return resBody.value;
}

/**
 * 将mongo的ObjectId转成tokenId
 * @date 2022-10-01
 * @param {any} objectId
 * @returns {string}
 */
const ObjectIdToTokenId = (objectId) => {
    const tokenId = ethers.BigNumber.from(`0x${objectId.toHexString()}`);
    return tokenId.toString();
}

/**
 * 将tokenId转成mongo的ObjectId
 * @date 2022-10-01
 * @param {string} tokenId
 * @returns {ObjectId}
 */
const TokenIdToObjectId = (tokenId) => {
    const ethersTokenId = ethers.BigNumber.from(tokenId);
    return ObjectId(ethersTokenId.toHexString().slice(2));
};

/**
 * 获取一个账户的所有NFT
 * @param {string} account
 */
const GetNFTsForOwner = async (account) => {
    if (!account) {
        return;
    }
    const nfts = await alchemy.nft.getNftsForOwner(account, {
        omitMetadata: false
    });
    return nfts;
};

/**
 * 获取NFT合约的meta信息(name, symbol等)
 * @param {string} tokenAddress
 * @returns 
 */
const GetNFTContractMetadata = async (tokenAddress) => {
    if (!tokenAddress) {
        return;
    }
    const t = await alchemy.nft.getContractMetadata(tokenAddress);
    return t;
}

/**
 * 获取某个NFT的metadata
 * @param {string} tokenAddress
 * @param {number} tokenId
 * @param {string} tokenType
 */
const GetNFTMetadata = async (tokenAddress, tokenId, tokenType) => {
    if (!tokenAddress) {
        return;
    }
    const t = await alchemy.nft.getNftMetadata(tokenAddress, tokenId, tokenType);
    return t.rawMetadata;
};


/**
 * 获取某个NFT的owner
 * @param {string} tokenAddress
 * @param {number} tokenId
 * @returns {Promise<string[]>}
 */
const GetOwnersForNFT = async (tokenAddress, tokenId) => {
    if (!tokenAddress) {
        return;
    }
    // ERC-721 NFT的owner只有一个, 但是ERC-1155 NFT的owner可以有多个
    const t = await alchemy.nft.getOwnersForNft(tokenAddress, tokenId);
    return t.owners;
}


/**
 * ipfs链接转http链接
 * @param {string} ipfsURL
 * @returns {string}
 */
function IPFSGatewayURL(ipfsURL) {
    return ipfsURL?.replace("ipfs://", gatewayURL);
}


const saleDomain = {
    name: "nftland",
    version: '1.0',
    chainId: 5,
    verifyingContract: "0x00000000006c3852cbEf3e08E8dF289169EdE581", // 记得替换为market
    salt: "0xcab6554389422575ff776cbe4c196fff08454285c466423b2f91b6ebfa166ca5", // 一个自己定义的值
};

const saleTypes = {
    SaleOrder: [
        { name: 'tokenId', type: 'uint256' },
        { name: 'tokenAddress', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'offerer', type: 'address' },
        { name: 'price', type: 'uint256' },
        { name: "startTime", type: 'uint256' }
    ]
}

/**
 * 获得Sale订单TypedData
 * @param {string} tokenId
 * @param {string} tokenAddress
 * @param {number} amount
 * @param {string} offerer
 * @param {string} price
 */
const GetSaleOrderTypedData = (tokenId, tokenAddress, amount, offerer, price) => {
    return {
        domain: saleDomain,
        type: saleTypes,
        values: {
            tokenId,
            tokenAddress,
            amount,
            offerer,
            price,
            startTime: Math.floor(Date.now() / 1000)
        }
    }
}

module.exports = {
    UploadNFT,
    ObjectIdToTokenId,
    TokenIdToObjectId,
    GetNFTsForOwner,
    GetNFTContractMetadata,
    GetNFTMetadata,
    GetOwnersForNFT,
    IPFSGatewayURL,
    GetSaleOrderTypedData
}