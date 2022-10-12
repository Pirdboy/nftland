const config = require('../configs').mongodb;
const { MongoClient } = require('mongodb');

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


function GetMongoCollection(name) {
    return nftlandDB.collection(name);
}

module.exports = {
    GetMongoClient,
    GetMongoCollection
}