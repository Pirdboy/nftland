import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useMemo
} from 'react'

import { ethers } from 'ethers';

const AccountContext = createContext();

/**
 * @returns {{account, chainId, connect, disconnect, provider, signer}}
 */
function useAccountContext() {
    return useContext(AccountContext);
}

const metaMaskProvider = window.ethereum !== undefined
    ? new ethers.providers.Web3Provider(window.ethereum, 'any')
    : null;

function AccountContextProvider({ children }) {
    const [account, setAccount] = useState('');
    const [chainId, setChainId] = useState(0);
    const [signer, setSigner] = useState(null);

    const connect = useCallback(async () => {
        if (!metaMaskProvider) {
            throw new Error("metamask is not installed");
        }
        const accounts = await metaMaskProvider.send("eth_requestAccounts", []);
        const chainId = (await metaMaskProvider.getNetwork()).chainId;
        setAccount(accounts[0]);
        setChainId(chainId);
        setSigner(metaMaskProvider.getSigner());
    }, []);

    const disconnect = useCallback(() => {
        setAccount('');
        setChainId(0);
        setSigner(null);
    }, []);

    const onChainChanged = useCallback((c) => {
        const b = ethers.BigNumber.from(c);
        setChainId(b.toNumber());
    }, []);

    const onAccountsChanged = useCallback(async (accounts) => {
        if (!accounts || accounts.length === 0) {
            setAccount('');
            setChainId(0);
            setSigner(null);
        } else {
            const chainId = (await metaMaskProvider.getNetwork()).chainId;
            setAccount(accounts[0]);
            setChainId(chainId);
            setSigner(metaMaskProvider.getSigner());
        }
        console.log('accountsChanged', accounts);
    }, []);

    const onDisconnect = useCallback((code, reason) => {
        console.log('onDisconnect', code, reason);
        setAccount('');
        setChainId(0);
        setSigner(null);
    }, []);

    useEffect(() => {
        const checkMetamaskConnect = async () => {
            if (!metaMaskProvider) {
                throw new Error("metamask is not installed");
            }
            const accounts = await metaMaskProvider.send('eth_accounts', []);
            if (accounts.length === 0) {
                return;
            }
            const chainId = (await metaMaskProvider.getNetwork()).chainId;
            setAccount(accounts[0]);
            setChainId(chainId);
            setSigner(metaMaskProvider.getSigner());
        };
        checkMetamaskConnect();
    }, []);

    useEffect(() => {
        if (metaMaskProvider) {
            metaMaskProvider.provider.on('accountsChanged', onAccountsChanged);
            metaMaskProvider.provider.on('chainChanged', onChainChanged);
            metaMaskProvider.provider.on('disconnect', onDisconnect);
            return () => {
                metaMaskProvider.provider.removeListener('accountsChanged', onAccountsChanged);
                metaMaskProvider.provider.removeListener('chainChanged', onChainChanged);
                metaMaskProvider.provider.removeListener('disconnect', onDisconnect);
            }
        }
    }, [onAccountsChanged, onChainChanged, onDisconnect]);

    const contextValue = useMemo(() => ({
        account,
        chainId,
        connect,
        disconnect,
        provider: metaMaskProvider,
        signer
    }), [account, chainId, connect, disconnect, signer]);

    return (
        <AccountContext.Provider value={contextValue}>
            {children}
        </AccountContext.Provider>
    )
}

export {
    AccountContextProvider,
    useAccountContext
}
