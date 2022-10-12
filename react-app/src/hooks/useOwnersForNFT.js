import { useState, useEffect } from 'react';
// import { GetOwnersForNFT } from "../utils/AlchemySDK";

function useOwnersForNFT(contractAddress, tokenId) {
    const [owners, setOwners] = useState([]);
    // useEffect(() => {
    //     const f = async () => {
    //         const s = await GetOwnersForNFT(contractAddress, tokenId);
    //         if(s && s.length > 0) {
    //             setOwners(s);
    //         }
    //     };
    //     f()
    // }, [contractAddress, tokenId])
    return owners;
}

export default useOwnersForNFT;