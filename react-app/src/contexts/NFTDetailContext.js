import React, { createContext, useState, useContext } from 'react';

const NFTDetailContext = createContext();

/**
 * useNFTDetailContext
 * @returns {{nftContextValue, setNftContextValue}}
 */
function useNFTDetailContext() {
    return useContext(NFTDetailContext);
}


function NFTDetailContextProvider({ children }) {
    const [nftContextValue, setNftContextValue] = useState();
    const contextValue = {
        nftContextValue,
        setNftContextValue
    };

    return (
        <NFTDetailContext.Provider value={contextValue}>
            {children}
        </NFTDetailContext.Provider>
    )
}

export {
    NFTDetailContextProvider,
    useNFTDetailContext
}
