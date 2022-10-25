const config = require('../configs').mongodb;
const { MongoClient, ObjectId, Long } = require('mongodb');

const client = new MongoClient(config.uri);
let nftlandDB;

const connect = async () => {
    try {
        await client.connect();
        nftlandDB = client.db(config.dbname);
        await nftlandDB.command({ ping: 1 });
        console.log('MongoClient connected successfully to server');
    } catch (error) {
        console.log('MongoClient connect error:', error);
        await client.close();
    }
}
connect()

function GetMongoClient() {
    return client;
}

/**
 * 生成ObjectId
 * @returns {ObjectId}
 */
function GenerateObjectId() {
    return ObjectId();
}


function GetMongoCollection(name) {
    return nftlandDB.collection(name);
}

const MongoUInt64 = (num) => {
    return Long.fromNumber(num, true);
}

const MongoInt64 = (num) => {
    return Long.fromNumber(num, false);
}

module.exports = {
    GetMongoClient,
    GetMongoCollection,
    GenerateObjectId,
    MongoUInt64,
    MongoInt64
}