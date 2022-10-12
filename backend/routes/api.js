const express = require('express');
const router = express.Router();
const axios = require('axios').default;
const { StatusCodes } = require('http-status-codes');
const path = require('path');
const { UploadNFT, ObjectIdToTokenId, TokenIdToObjectId, GetNFTMetadata, GetOwnersForNFT, IPFSGatewayURL, GetSaleOrderTypedData } = require('../utils/NFT');
const { GetMongoCollection } = require('../utils/MongoDB');
const { NFTLandCollectionContractAddress } = require('../constants');
const { marketContract } = require('../utils/Contract');
const { staticDir: UPLOAD_DIR, staticUrl, tempDir: TEMP_DIR } = require("../configs");
const fileUpload = require('express-fileupload');
// const IMAGE_UPLOAD_DIR = path.join(__dirname, "temp", "data");

const fileUploadMiddleware = () => fileUpload({
    createParentPath: true,
    preserveExtension: true,
    safeFileNames: true,
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: TEMP_DIR,
    debug: true,
    uploadTimeout: 45000,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

const nftCreateValidate = (name, description, creator, totalSupply) => {
    if (typeof name !== 'string' || !name) {
        return false;
    }
    if (typeof description !== 'string' || !description) {
        return false;
    }
    if (typeof creator !== 'string' || !creator) {
        return false;
    }
    if (typeof totalSupply !== 'number' || totalSupply <= 0) {
        return false
    }
    return true;
}
const nftQueryValidate = (tokenAddress, tokenId) => {
    if (typeof tokenAddress !== 'string' || tokenAddress.length !== 42) {
        return false;
    }
    if (typeof tokenId !== 'string' || !tokenId) {
        return false;
    }
    return true;
};

const saleValidate = (tokenId, tokenAddress, amount, offerer, price) => {
    if (typeof tokenId !== 'string' || !tokenId) {
        return false;
    }
    if (typeof tokenAddress !== 'string' || !tokenAddress) {
        return false;
    }
    if (typeof amount !== 'number' || amount <= 0) {
        return false;
    }
    if (typeof offerer !== 'string' || !offerer) {
        return false;
    }
    if (typeof price !== 'string' || !price) {
        return false;
    }
    return true;
};
/* test connection */
router.get('/ping/:a/:b', function (req, res, next) {
    let a = req.params.a;
    let b = req.params.b;
    return res.send(`pong a:${a} b:${b}`);
});

// 测试form文件上传接口
router.post('/test/upload', fileUploadMiddleware(), (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).send('no files were uploaded.')
    }
    const name = req.body?.name;
    const symbol = req.body?.symbol;
    let imageFile = req.files.image;
    let tempFilePath = imageFile.tempFilePath;
    console.log(`test upload name: ${name}, symbol: ${symbol} tempFilePath: ${tempFilePath}`);
    return res.send({
        name: name,
        symbol: symbol
    });
});

// 创建NFT
router.post('/createnft', fileUploadMiddleware(), async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).send('no files were uploaded.')
    }
    const name = req.body?.name;
    const description = req.body?.description;
    const creator = req.body?.creator;
    const totalSupply = req.body?.totalSupply;
    if (!nftCreateValidate(name, description, creator, totalSupply)) {
        return res.status(StatusCodes.BAD_REQUEST).send('bad request body.');
    }
    try {
        let imageFile = req.files.image;
        let tempFilePath = imageFile.tempFilePath;
        const { url: metadataUrl } = await UploadNFT(name, description, tempFilePath);
        const collection = GetMongoCollection("nft");
        const result = await collection.insertOne({
            tokenAddress: NFTLandCollectionContractAddress,
            name: name,
            description: description,
            metaDataUrl: metadataUrl,
            totalSupply: totalSupply,
            creator: creator,
            minted: false,
            owners: [{
                [creator]: totalSupply
            }],
            createAt: Math.floor(Date.now() / 1000),
        });
        const insertedId = result.insertedId;
        console.log("insertedId", insertedId.toString());
        return res.send({
            ok: true,
            tokenId: ObjectIdToTokenId(insertedId),
            tokenAddress: NFTLandCollectionContractAddress
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
});

// 查看某个NFT metadata
// TODO: 不再存储到IPFS上
router.get('/nft/getNFTMetadata/:tokenAddress/:tokenId', async (req, res) => {
    let tokenAddress = req.params.tokenAddress;
    let tokenId = req.params.tokenId;
    if (!nftQueryValidate(tokenAddress, tokenId)) {
        return res.status(StatusCodes.BAD_REQUEST).send('bad request params.');
    }
    try {
        let result;
        if (tokenAddress === NFTLandCollectionContractAddress) {
            let metadataUrl;
            try {
                // metadataUri = await contract.uri(tokenId);  // TODO: 等合约写完再来写这部分
            } catch (error) {
                console.log("contract.uri fail", error);
                metadataUrl = null;
            }
            if (!metadataUrl) {
                const collection = GetMongoCollection('nft');
                const objectId = TokenIdToObjectId(tokenId);
                const nfts = await collection.find({ _id: objectId }).toArray();
                if (!nfts || !Array.isArray(nfts) || nfts.length === 0) {
                    throw new Error('nonexistent nft');
                }
                metadataUrl = nfts[0].metaDataUrl;
            }
            metadataUrl = IPFSGatewayURL(metadataUrl);
            result = await axios.get(metadataUrl);
            console.log("metadata from url", metadataUrl, result);
        } else {
            result = await GetNFTMetadata(tokenAddress, tokenId);
            console.log("metadata from sdk", result);
        }
        return res.send(result);
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
});

// 查看某个NFT owner
router.get('/nft/getOwnersForNFT/:tokenAddress/:tokenId', async (req, res) => {
    let tokenAddress = req.params.tokenAddress;
    let tokenId = req.params.tokenId;
    if (!nftQueryValidate(tokenAddress, tokenId)) {
        return res.status(StatusCodes.BAD_REQUEST).send('bad request params.');
    }
    let result;
    try {
        if (tokenAddress === NFTLandCollectionContractAddress) {
            try {
                // result = await contract.owners(tokenId); // TODO: 等合约写完再来写这部分
            } catch (error) {
                console.log("contract.owners fail", error);
                result = null;
            }
            if (!result) {
                const collection = GetMongoCollection('nft');
                const objectId = TokenIdToObjectId(tokenId);
                const nfts = await collection.find({ _id: objectId }).toArray();
                if (!nfts || !Array.isArray(nfts) || nfts.length === 0) {
                    throw new Error('nonexistent nft');
                }
                result = [nfts[0].creator];
            }
        } else {
            result = await GetOwnersForNFT(tokenAddress, tokenId);
        }
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
})

// 生成订单数据
router.get('/nft/sale/generate', (req, res) => {
    const {
        tokenId,
        tokenAddress,
        amount,
        offerer,
        price
    } = req.body;
    if (!saleValidate(tokenId, tokenAddress, amount, offerer, price)) {
        return res.status(StatusCodes.BAD_REQUEST).send('bad request params.');
    }
    const data = GetSaleOrderTypedData(tokenId, tokenAddress, amount, offerer, price);
    return res.send(data);
});

// 将订单数据存入mongodb
router.post('/nft/sale/store', async (req, res) => {
    const {
        tokenId,
        tokenAddress,
        amount,
        offerer,
        price,
        startTime,
        signature
    } = req.body;
    if (!saleValidate(tokenId, tokenAddress, amount, offerer, price)) {
        return res.status(StatusCodes.BAD_REQUEST).send('bad request params.');
    }
    if (signature?.length !== 132) {
        return res.status(StatusCodes.BAD_REQUEST).send('bad request params.');
    }
    const now = Math.floor(Date.now() / 1000);
    const timeout = 1200;  // 20 minutes
    if (!startTime || now - startTime > timeout) {
        return res.status(StatusCodes.BAD_REQUEST).send('bad request, sale timeout');
    }
    try {
        const collection = GetMongoCollection('sale_order');
        await collection.insertOne({
            tokenId,
            tokenAddress,
            amount,
            offerer,
            price,
            startTime,
            signature
        })
        return res.send('success');
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
});

// 查询nft关联的订单信息
router.get('/nft/sale/list/:tokenAddress/:tokenId', async (req, res) => {
    let tokenAddress = req.params.tokenAddress;
    let tokenId = req.params.tokenId;
    if (!nftQueryValidate(tokenAddress, tokenId)) {
        return res.status(StatusCodes.BAD_REQUEST).send('bad request params.');
    }
    try {
        const collection = GetMongoCollection('sale_order');
        let saleOrders = await collection.find({
            tokenId,
            tokenAddress
        }).toArray();
        if (!saleOrders || !Array.isArray(saleOrders) || saleOrders.length === 0) {
            saleOrders = [];
        }
        // 要借助multicall来优化
        let result = new Array(saleOrders.length);
        for (let i = 0; i < saleOrders.length; i++) {
            let s = saleOrders[i];
            let { _id, ...fields } = s;
            let executed = await marketContract.isSaleOrderExecuted(s.signature);
            result[i] = {
                _id: s._id.toString(),
                ...fields,
                executed
            }
        }
        return res.send(result);
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
});

module.exports = router;
