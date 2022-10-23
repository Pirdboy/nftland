const axios = require('axios').default;
const {ethers} = require('ethers');

const messageToSign = "This request will not trigger a blockchain transaction or cost any gas fees.\n\nWe need the signature to prove you are the creator";

const baseApiUrl = {
    development: "http://192.168.25.129/api",
    production: "",
}
const createNftUrl = `${baseApiUrl[process.env.NODE_ENV]}/createnft/`;
const getNftsForOwnerUrl = `${baseApiUrl[process.env.NODE_ENV]}/getnftsforowner/`;
const getNftMetadataUrl = `${baseApiUrl[process.env.NODE_ENV]}/getnftmetadata/`;
const getOwnersForNftUrl = `${baseApiUrl[process.env.NODE_ENV]}/getownersfornft/`;
const generateNftSaleUrl = `${baseApiUrl[process.env.NODE_ENV]}/generatenftsale`;
const storeNftSaleUrl = `${baseApiUrl[process.env.NODE_ENV]}/storenftsale`;
const getNftSaleListUrl = `${baseApiUrl[process.env.NODE_ENV]}/getnftsalelist`;

class ServerApi {
    /**
     * 创建NFT
     * @param {string} name
     * @param {string} description
     * @param {any} imageFile
     * @param {string} totalSupply
     * @param {any} signer
     * @param {string} account
     * @returns {Promise<{tokenId:string, contractAddress:string}>}
     */
    static async CreateNft(name, description, imageFile, totalSupply, signer, account) {
        let signature = await signer.signMessage(messageToSign);
        console.log("createnft signature", signature);
        let e = process.env.NODE_ENV;
        console.log('e',e);
        const postUrl = createNftUrl;
        let formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("image", imageFile);
        formData.append("creator", account);
        formData.append("totalSupply", totalSupply);
        formData.append("signature", signature);
        console.log('postUrl', postUrl);
        const response = await axios.post(postUrl, formData);
        return response.data;
    }

    /**
     * 获取一个账户的nft列表
     * @param {string} account
     * @returns {Promise<Array>}
     */
    static async GetNftsForOwner(account) {
        console.log('account',account);
        if(!account) {
            return [];
        }
        const url = getNftsForOwnerUrl+ account;
        const response = await axios.get(url,{
            headers:{
                'Cache-Control': 'no-cache'
            }
        });
        console.log("[debug] getnfts url", url);
        console.log("[debug] GetNftsForOwner data", response.data);
        return response.data;
    }

    /**
     * 获得nft metadata
     * @param {string} contractAddress
     * @param {string} tokenId
     * @returns {any}
     */
    static async GetNftMetadata(contractAddress, tokenId) {
        if(!contractAddress || !tokenId) {
            return;
        }
        const url = getNftMetadataUrl + contractAddress + "/" + tokenId;
        const response = await axios.get(url);
        console.log("[debug] GetNftMetadata data", response.data);
        return response.data;
    }

    /**
     * 获得nft的owner列表
     * @param {string} contractAddress
     * @param {string} tokenId
     * @returns {Promise<[{owner:string,tokenId:string,balance:number}]>}
     */
    static async GetOwnersForNft(contractAddress, tokenId) {
        if(!contractAddress || !tokenId) {
            return [];
        }
        const url = getOwnersForNftUrl + contractAddress + "/" + tokenId;
        const response = await axios.get(url,{
            headers:{
                'Cache-Control': 'no-cache'
            }
        });
        console.log("[debug] GetOwnersForNft data", response.data);
        return response.data;
    }

    /**
     * 获取订单数据
     * @param {string} tokenId
     * @param {string} tokenAddress
     * @param {string} amount
     * @param {string} offerer
     * @param {string} priceInWei
     * @return {Promise<{domain, types, values}>}
     */
    static async GenerateNftSale(tokenId, tokenAddress, amount, offerer, priceInWei) {
        if(!tokenId || !tokenAddress) {
            return;
        }
        const url = `${generateNftSaleUrl}?tokenId=${tokenId}&tokenAddress=${tokenAddress}&amount=${amount}&offerer=${offerer}&price=${priceInWei}`;
        const response = await axios.get(url,{
            headers:{
                'Cache-Control': 'no-cache'
            }
        });
        console.log("[debug] GenerateSale data", response.data);
        return response.data;
    }

    /**
     * 存储订单信息到后端
     * @param {any} sale
     * @param {string} signature
     * @param {string} signerAddress
     * @returns {Promise<string>}
     */
    static async StoreNftSale(sale, signature, signerAddress) {
        if(!sale || !signature || !signerAddress) {
            return;
        }
        const response = await axios.post(storeNftSaleUrl, {
            sale,
            signature,
            signerAddress
        });
        return response.data;
    }

    /**
     * 获取该nft出售列表
     * @param {string} tokenId
     * @param {string} tokenAddress
     * @returns {Promise<[]>}
     */
    static async GetNftSaleList(tokenId, tokenAddress) {
        if(!tokenId || !tokenAddress) {
            return [];
        }
        const url = `${getNftSaleListUrl}?tokenId=${tokenId}&tokenAddress=${tokenAddress}`;
        console.log('GetNftSaleList url', url);
        const resp = await axios.get(url, {
            headers:{
                'Cache-Control': 'no-cache'
            }
        });
        console.log('GetNftSaleList data', resp.data);
        return resp.data;
    }

    static async TestUpload(imageFile) {
        const url = "http://192.168.25.129/api/test/upload";
        let name = "uploadName";
        let symbol = "100";
        let formData = new FormData();
        formData.append('name', name);
        formData.append('symbol', symbol);
        formData.append('image', imageFile);
        const response = await axios.post(url, formData);
        const resBody = response.data;
        console.log(resBody);
    }

    static async TestSignMessage(signer) {
        let signature = await signer.signMessage(messageToSign);
        console.log("signature", signature);
    }
};



export default ServerApi;