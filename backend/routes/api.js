const express = require('express');
const router = express.Router();
const axios = require('axios').default;
const { StatusCodes } = require('http-status-codes');
const { ethers } = require('ethers');
const path = require('path');
const fs = require('node:fs/promises');
const {
    ObjectIdToTokenId,
    TokenIdToObjectId,
    IPFSGatewayURL,
    GetSaleOrderTypedData,
    AlchemyAPI,
} = require('../utils/NFT');
const { GetMongoCollection, GenerateObjectId } = require('../utils/MongoDB');
const {
    NFTLandCollectionContractAddress,
    NFTLandCollectionName,
    NFTLandCollectionSymbol
} = require('../constants');
const { marketContract } = require('../utils/Contract');
const { Signature } = require('../utils/Signature');
const { staticDir, staticUrl, tempDir } = require("../configs");
const fileUpload = require('express-fileupload');
const messageToSign = "This request will not trigger a blockchain transaction or cost any gas fees.\n\nWe need the signature to prove you are the creator";
const numberPattern = /^[0-9]+$/;

const fileUploadMiddleware = () => fileUpload({
    createParentPath: true,
    preserveExtension: true,
    safeFileNames: true,
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: tempDir,
    debug: true,
    uploadTimeout: 45000,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

const nftCreateValidate = (name, description, creator, totalSupply) => {
    if (!name || !description || !creator) {
        return false;
    }
    const t = Number(totalSupply);
    if (isNaN(t) || t <= 0) {
        return false
    }
    return true;
}
const nftQueryValidate = (contractAddress, tokenId) => {
    if (contractAddress?.length !== 42) {
        return false;
    }
    if (!tokenId) {
        return false;
    }
    return true;
};

const saleValidate = (tokenId, tokenAddress, amount, offerer, price) => {
    if (!tokenId) {
        return false;
    }
    if (!tokenAddress) {
        return false;
    }
    const a = Number(amount);
    if (isNaN(a) || a <= 0) {
        return false;
    }
    if (!offerer) {
        return false;
    }
    if (!numberPattern.test(price)) {
        return false;
    }
    return true;
};
/* test connection */
router.get('/ping/:a/:b', function (req, res) {
    let a = req.params.a;
    let b = req.params.b;
    return res.send(`pong a:${a} b:${b}`);
});

/* test query */
router.get('/ping2', function (req, res) {
    let {a, b} = req.query;
    return res.send(`pong a:${a} b:${b}`);
});

// 测试form文件上传接口
router.post('/test/upload', fileUploadMiddleware(), (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).send('no files were uploaded.')
    }
    const name = req.body?.name;
    const symbol = req.body?.symbol;
    console.log("typeof name is", typeof name);
    console.log("typeof symbol is", typeof symbol);
    let imageFile = req.files.image;
    let tempFilePath = imageFile.tempFilePath;
    console.log(`test upload, fileName: ${imageFile.name}, ext:${path.extname(imageFile.name)}, name: ${name}, symbol: ${symbol} tempFilePath: ${tempFilePath}`);
    const _id = GenerateObjectId();
    console.log(`_id.str: ${_id.str} _id.toString(): ${_id.toString()} _id.valueOf(): ${_id.valueOf()} _id.toHexString(): ${_id.toHexString()}`);
    return res.send({
        name: name,
        symbol: symbol
    });
});

// 创建 nft
router.post('/createnft', fileUploadMiddleware(), async (req, res) => {
    if (!req.files?.image) {
        return res.status(StatusCodes.BAD_REQUEST).send('no files were uploaded.')
    }
    const name = req.body?.name;
    const description = req.body?.description;
    const creator = req.body?.creator;
    const totalSupply = Number(req.body?.totalSupply);
    const signature = req.body?.signature;
    console.log(`request params |name:${name} |description:${description} |creator:${creator} |totalSupply:${totalSupply} |signature:${signature}`);
    if (!nftCreateValidate(name, description, creator, totalSupply)) {
        return res.status(StatusCodes.BAD_REQUEST).send('bad request body.');
    }
    if (!Signature.VerifyEIP191Signature(messageToSign, signature, creator)) {
        return res.status(StatusCodes.BAD_REQUEST).send('signature incorrect');
    }
    try {
        const imageFile = req.files.image;
        const imageFileName = `${imageFile.md5}${path.extname(imageFile.name)}`;
        const uploadPath = staticDir + imageFileName;
        const mvFile = new Promise((resolve, _) => {
            imageFile.mv(uploadPath, err => {
                if (err) {
                    throw err;
                }
                resolve();
            });
        });
        await mvFile;
        const imageUrl = staticUrl + imageFileName;
        const now = Date.now();
        const metadata = {
            date: now,
            image: imageUrl,
            name,
            description,
            properties: {}
        };
        const metadataStr = JSON.stringify(metadata);
        const _id = GenerateObjectId();
        console.log("generate new _id", _id.toHexString());
        const tokenId = ObjectIdToTokenId(_id);
        const metadataFileName = tokenId + ".json";
        const metadataPath = staticDir + metadataFileName;
        await fs.writeFile(metadataPath, metadataStr);
        const metadataUrl = staticUrl + metadataFileName;
        const collection = GetMongoCollection('nft');
        const result = await collection.insertOne({
            _id: _id,
            contractAddress: NFTLandCollectionContractAddress,
            name,
            description,
            metadata: metadataStr,
            metadataUrl,
            totalSupply: totalSupply,
            creator: creator,
            minted: false,
            owners: {
                [creator]: totalSupply
            },
            createAt: now,
            updateAt: now
        });
        console.log("inserted _id", result.insertedId.toString());
        return res.send({
            tokenId,
            contractAddress: NFTLandCollectionContractAddress
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
})

// 获取一个账户的nft列表, 先不考虑分页
router.get("/getnftsforowner/:account", async (req, res) => {
    let account = req.params.account;
    if (!account) {
        return res.status(StatusCodes.BAD_REQUEST).send('bad request params.');
    }
    try {
        let collection = GetMongoCollection('nft');
        let ownerKey = "owners." + account;
        let allNftsMap = {};  // 去重用, 如果链上有数据, 都以链上为准
        let nftsInDB = await collection.find({
            $and: [
                { [ownerKey]: { $gt: 0 } },
                { 'minted': false },
            ]
        }).toArray();
        for (let i = 0; i < nftsInDB.length; i++) {
            let e = nftsInDB[i];
            let tokenId = ObjectIdToTokenId(e._id);
            let k = `${e.contractAddress}_${tokenId}`;
            allNftsMap[k] = {
                "contract": {
                    "address": e.contractAddress,
                    "name": NFTLandCollectionName,
                    "symbol": NFTLandCollectionSymbol
                },
                "tokenType": "ERC1155",
                "tokenId": tokenId,
                //"balance": `${e.owners[account]}`,
                "metadata": JSON.parse(e.metadata),
                "metadataUrl": e.metadataUrl,
                "timeLastUpdated": e.updateAt
            };
        }
        let nftsOnChain = await AlchemyAPI.GetNFTsForOwner(account);
        for (let i = 0; i < nftsOnChain.length; i++) {
            let e = nftsOnChain[i];
            let tokenId = ethers.BigNumber.from(e.id.tokenId).toString();
            let k = `${e.contract.address}_${tokenId}`;
            allNftsMap[k] = {
                "contract": {
                    "address": e.contract.address,
                    "name": e.contractMetadata.name,
                    "symbol": e.contractMetadata.symbol
                },
                "tokenType": e.id.tokenMetadata.tokenType,
                "tokenId": tokenId,
                //"balance": `${e.balance}`,
                "metadata": e.metadata,
                "metadataUrl": e.tokenUri?.raw,
                "timeLastUpdated": (new Date(e.timeLastUpdated)).getTime(),
            }
        }
        let allNftsArray = Object.values(allNftsMap);
        allNftsArray.sort((a, b) => {
            return b.timeLastUpdated - a.timeLastUpdated;
        })
        return res.send(allNftsArray);
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
});

// 获取nft的metadata
router.get("/getnftmetadata/:contractAddress/:tokenId", async (req, res) => {
    let { contractAddress, tokenId } = req.params;
    if (!nftQueryValidate(contractAddress, tokenId)) {
        return res.status(StatusCodes.BAD_REQUEST).send('bad request params.');
    }
    try {
        let nft;
        if (contractAddress === NFTLandCollectionContractAddress) {
            const collection = GetMongoCollection('nft');
            const _id = TokenIdToObjectId(tokenId);
            const queryResults = await collection.find({
                $and: [
                    { _id: _id },
                    // { 'minted': false },
                ]
            }).toArray();
            if (queryResults?.length <= 0) {
                throw new Error("nft does not exist offchain");
            }
            const e = queryResults[0];
            nft = {
                "contract": {
                    "address": e.contractAddress,
                    "name": NFTLandCollectionName,
                    "symbol": NFTLandCollectionSymbol
                },
                "tokenType": "ERC1155",
                "tokenId": tokenId,
                "metadata": JSON.parse(e.metadata),
                "metadataUrl": e.metaDataUrl,
                "minted": e.minted,
                "timeLastUpdated": e.updateAt
            };
        }
        if(!nft) {
            const e = await AlchemyAPI.GetNFTMetadata(contractAddress, tokenId);
            if(!e) {
                throw new Error("nft does not exist onchain");
            }
            nft = {
                "contract": {
                    "address": e.contract.address,
                    "name": e.contractMetadata.name,
                    "symbol": e.contractMetadata.symbol
                },
                "tokenType": e.id.tokenMetadata.tokenType,
                "tokenId": tokenId,
                "metadata": e.metadata,
                "metadataUrl": e.tokenUri?.raw,
                "minted": true,
                "timeLastUpdated": (new Date(e.timeLastUpdated)).getTime(),
            }
        }
        return res.send(nft);
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
});

// 获取nft的owners以及余额
router.get("/getownersfornft/:contractAddress/:tokenId", async (req, res) => {
    let { contractAddress, tokenId } = req.params;
    if(!nftQueryValidate(contractAddress, tokenId)){
        return res.status(StatusCodes.BAD_REQUEST).send('bad request params.');
    }
    try {
        let owners;
        if(contractAddress === NFTLandCollectionContractAddress) {
            const collection = GetMongoCollection('nft');
            const _id = TokenIdToObjectId(tokenId);
            const queryResults = await collection.find({
                $and: [
                    { _id: _id },
                    { 'minted': false },
                ]
            }).toArray();
            // 如果nft没上链
            if(queryResults?.length > 0) {
                const e = queryResults[0];
                const ownerAddresses = Object.keys(e.owners);
                owners = ownerAddresses.map((addr) => {
                    return {
                        "owner": addr,
                        "tokenId": tokenId,
                        "balance": e.owners[addr],
                    }
                })
            }
        }
        if(!owners) {
            owners = await AlchemyAPI.GetOwnersForNFT(contractAddress, tokenId);
        }
        return res.send(owners);
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
});

// 生成订单数据
router.get('/generatenftsale', async (req, res) => {
    const {
        tokenId,
        tokenAddress,
        amount,
        offerer,
        price
    } = req.query;
    if (!saleValidate(tokenId, tokenAddress, amount, offerer, price)) {
        return res.status(StatusCodes.BAD_REQUEST).send('bad request params.');
    }
    try {
        const startTime = Date.now();
        let creator;
        let tokenType;
        let minted;
        if(tokenAddress === NFTLandCollectionContractAddress) {
            const collection = GetMongoCollection('nft');
            const _id = TokenIdToObjectId(tokenId);
            const r = await collection.find({
                _id: _id
            }).toArray();
            if(!r || r.length === 0) {
                throw new Error('nft not exist');
            }
            tokenType = 2;
            creator = r[0].creator;
            minted = r[0].minted;
        } else {
            const e = await AlchemyAPI.GetNFTMetadata(tokenAddress, tokenId);
            if(!e) {
                throw new Error("nft does not exist onchain");
            }
            // "tokenType": e.id.tokenMetadata.tokenType,
            const t = e.id.tokenMetadata.tokenType;
            if(t === 'ERC1155') {
                tokenType = 2;
            } else {
                tokenType = 1;  // 如果tokenType为空,也认为是ERC721
            }
            creator = ethers.constants.AddressZero;
            minted = true;
        }
        const data = GetSaleOrderTypedData(
            tokenId,
            tokenAddress,
            amount,
            offerer,
            price,
            startTime,
            creator,
            tokenType,
            minted
        );
        return res.send(data);
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
});

// 用户上传订单签名
router.post("/storenftsale", async (req, res) => {
    const {
        sale,
        signature,
        signerAddress
    } = req.body;
    if(!sale || !signature || !signerAddress) {
        return res.status(StatusCodes.BAD_REQUEST).send('bad request body.');
    }
    let {domain, types, values: order} = sale;
    if(!domain || !types || !order) {
        return res.status(StatusCodes.BAD_REQUEST).send('bad request body.');
    }
    if(order.offerer !== signerAddress) {
        return res.status(StatusCodes.BAD_REQUEST).send('bad request, signerAddress incorrect');
    }
    const now = Math.floor(Date.now() / 1000);
    const timeout = 1200;  // 20 minutes
    const startTimeInSec = Math.floor(order.startTime / 1000);
    if(!startTimeInSec || now - startTimeInSec > timeout) {
        return res.status(StatusCodes.BAD_REQUEST).send('bad request, sale timeout');
    }
    try {
        const verifyOk = Signature.VerifyEIP712Signature(domain, types, order, signature, signerAddress);
        if(!verifyOk) {
            return res.status(StatusCodes.BAD_REQUEST).send('signature incorrect');
        }
        const collection = GetMongoCollection('sale_order');
        await collection.insertOne({
            ...order,
            signature,
            status: 1
        });
        return res.send('success');
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
})

router.get("/getnftsalelist", async (req, res) => {
    let { tokenAddress, tokenId } = req.query;
    if(!nftQueryValidate(contractAddress, tokenId)) {
        return res.status(StatusCodes.BAD_REQUEST).send('bad request params.');
    }
    try {
        const collection = GetMongoCollection('sale_order');
        const r = await collection.find({
            tokenId,
            tokenAddress
        }).toArray();
        return res.send(r ?? []);
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
});

// ----------------- 旧代码 -----------------------

// 查看某个NFT metadata

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
