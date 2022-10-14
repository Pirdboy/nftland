const axios = require('axios').default;

const messageToSign = "This request will not trigger a blockchain transaction or cost any gas fees.\n\nWe need the signature to prove you are the creator";


const createNftUrl = {
    development: "http://192.168.25.129/api/createnft",
    production: "",
};

const getNftsForOwnerUrl = {
    development:"http://192.168.25.129/api/getnftsforowner/",
    production:"",
}

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
        const postUrl = createNftUrl[process.env.NODE_ENV];
        let formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("image", imageFile);
        formData.append("creator", account);
        formData.append("totalSupply", totalSupply);
        formData.append("signature", signature);
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
        const url = getNftsForOwnerUrl[process.env.NODE_ENV] + account;
        const response = await axios.get(url);
        console.log("[debug] getnfts url", url);
        console.log("[debug] response data", response.data);
        return response.data;
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