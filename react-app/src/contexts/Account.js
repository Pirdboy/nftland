import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { useEthersAppContext, EthersModalConnector } from 'eth-hooks/context';
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from 'ethers';

const AccountContext = createContext();


/**
 * useAccountContext
 * @returns {{account,chainId,connect,disconnect,provider,signer:ethers.Signer}}
 */
function useAccountContext() {
    return useContext(AccountContext);
}

const web3Config = {
    cacheProvider: true,
    providerOptions: {
        walletconnect: {
            package: WalletConnectProvider, // required
            options: {
                rpc: {
                    // 1: "https://eth-mainnet.g.alchemy.com/v2/3Fwz5Vj7T37o7cHOowrarmQHRwrn3uwR",
                    4: "https://eth-rinkeby.alchemyapi.io/v2/R66GEbPxA6Ag0sLT1bpOaOTRxKu4yWZp",
                    5: "https://eth-goerli.g.alchemy.com/v2/8nBorYC3l1xHmEqeCyY4ewavD0PIkkKF",
                    // 31337: "http://127.0.0.1:8545",
                }
            },
        },
    },
}

function Provider({ children }) {
    const { account, chainId, openModal, disconnectModal, provider, signer } = useEthersAppContext();
    const createLoginConnector = useCallback(
        (id) => {
            if (web3Config) {
                const connector = new EthersModalConnector({ ...web3Config, theme: 'light' }, id);
                return connector;
            }
        },
        []
    );
    const connect = useCallback(() => {
        if (openModal) {
            openModal(createLoginConnector());
        }
    }, [createLoginConnector, openModal])
    const disconnect = useCallback((onDisconnect) => {
        if (disconnectModal) {
            disconnectModal(onDisconnect);
        }
    }, [disconnectModal]);

    const contextValue = useMemo(() => ({
        account,
        chainId,
        connect,
        disconnect,
        provider,
        signer,
    }), [connect, disconnect, account, chainId, provider, signer]);

    return (
        <AccountContext.Provider value={contextValue}>
            {children}
        </AccountContext.Provider>
    )
}

export default Provider;
export {
    useAccountContext
}
