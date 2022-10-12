const { ethers } = require('ethers');
const { httpApiKey } = require("../configs").alchemy.goerli;
const { MarketContractAddress, NFTLandCollectionContractAddress } = require('../constants');

const ethersProvider = new ethers.providers.StaticJsonRpcProvider(httpApiKey);


// TODO: 等合约编译后直接把abi文件拷贝过来就行了
const marketABI = [
    "function isSaleOrderExecuted(bytes memory _signature) external view returns (bool)"
]
const marketContract = new ethers.Contract(MarketContractAddress, marketABI, ethersProvider);

const nftlandCollectionABI = [
    "function mint(address _account, uint _id, uint _amount) external",
    "function isApprovedForAll(address _account, address _operator) public view returns (bool)"
];
const nftlandCollectionContract = new ethers.Contract(NFTLandCollectionContractAddress, nftlandCollectionABI, ethersProvider);

module.exports = {
    marketContract,
    nftlandCollectionContract
}