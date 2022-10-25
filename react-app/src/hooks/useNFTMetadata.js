import { useState, useEffect, useCallback } from "react";
import ServerApi from "../utils/ServerApi";

function useNFTMetadata(contractAddress, tokenId) {
    const [metadata, setMetadata] = useState(null);
    const refresh = useCallback(async () => {
        const m = await ServerApi.GetNftMetadata(contractAddress, tokenId);
        if (m) {
            setMetadata(m);
        }
    },[contractAddress, tokenId])
    useEffect(() => {
        refresh();
    }, [refresh]);
    return {metadata, refresh};
}

export default useNFTMetadata;