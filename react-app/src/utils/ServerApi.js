const axios = require('axios').default;

const messageToSign = "This request will not trigger a blockchain transaction or cost any gas fees.\n\nWe need the signature to prove you are the creator";


const createNftUrl = {
    "development": "http://192.168.25.129/api/createnft",
    "production": "",
};

class ServerApi {
    static async CreateNft(name, description, imageFile, totalSupply, signer, account) {
        let signature = await signer.signMessage(messageToSign);
        const postUrl = createNftUrl[process.env.NODE_ENV];
        let formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("image", imageFile);
        formData.append("creator", account);
        formData.append("totalSupply", totalSupply);
        formData.append("signautre", signature);
        const response = await axios.post(postUrl, formData);
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
};



export default ServerApi;