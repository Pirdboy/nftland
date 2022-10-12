const gatewayURL = "https://cloudflare-ipfs.com/ipfs/";
// const gatewayURL = "https://ipfs.io/ipfs/";


/**
 * ipfs链接转http链接
 * @param {string} ipfsURL
 * @returns {string}
 */
function IPFSGatewayURL(ipfsURL) {
    return ipfsURL?.replace("ipfs://", gatewayURL);
}

export {
    IPFSGatewayURL
}