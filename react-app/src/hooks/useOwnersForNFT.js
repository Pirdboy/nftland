import { useState, useEffect } from 'react';
import ServerApi from "../utils/ServerApi";

function useOwnersForNFT(contractAddress, tokenId) {
    const [owners, setOwners] = useState([]);
    useEffect(() => {
        const f = async () => {
            const s = await ServerApi.GetOwnersForNft(contractAddress, tokenId)
            if(s && s.length > 0) {
                setOwners(s);
            }
        };
        f();
    }, [contractAddress, tokenId])
    return owners;
}

export default useOwnersForNFT;