import { ethers } from 'ethers';

const axios = require('axios').default;

// const FormData = require('form-data');
// const fs = require('node:fs');
// const path = require('node:path');
// const { ethers } = require('ethers');
// const { ObjectId } = require('mongodb');
// const { url: NFTStorageHTTPAPI, apiKey: NFTStorageAPIKey } = require("../configs").nftstorage;
// const alchemyConfig = require('../configs').alchemy.goerli;
// const { Alchemy } = require("alchemy-sdk");
// const alchemy = new Alchemy(alchemyConfig);
// const gatewayURL = "https://cloudflare-ipfs.com/ipfs/";

const createNftUrl = {
    "development": "http://192.168.25.129/nftland/api/createnft",
    "production": "",
};

const CreateNft = async (name, description, imageFile, creator, totalSupply) => {

}

const TestUpload = async (imageFile) => {
    const url = "http://192.168.25.129/nftland/api/test/upload";
    let name = "uploadName";
    let symbol = "UP";
    let formData = new FormData();
    formData.append('name', name);
    formData.append('symbol', symbol);
    formData.append('image', imageFile);
    const response = await axios.post(url, formData);
    const resBody = response.data;
    console.log(resBody);
};

export {
    CreateNft,
    TestUpload
}