import { useState, useEffect, useCallback } from 'react';
import ServerApi from "../utils/ServerApi";

function useOwnersForNFT(contractAddress, tokenId) {
    const [owners, setOwners] = useState([]);
    const refresh = useCallback(async () => {
        const s = await ServerApi.GetOwnersForNft(contractAddress, tokenId)
        if(s && s.length > 0) {
            setOwners(s);
        }
    }, [contractAddress, tokenId]);
    useEffect(() => {
        refresh();
    }, [refresh])
    return {owners, refresh};
}

export default useOwnersForNFT;