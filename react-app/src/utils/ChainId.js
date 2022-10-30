const c = {
    '1': 'Ethereum',
    '3': 'Ropsten',
    '4': 'Rinkeby',
    '5': 'Goerli',
    '31337': 'Hardhat',
}

/**
 * chain名称
 * @param {number} chainId
 * @returns {string}
 */
export function GetChainName(chainId) {
    return c[chainId];
}


/**
 * 是否支持chainId对应的网络(只支持Goerli)
 * @param {number} chainId
 * @returns {boolean}
 */
export function IsSupportedChain(chainId) {
    return (
        // chainId === 4 || 
        chainId === 5
    );
}