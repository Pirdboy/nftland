import { useState, useEffect } from "react";
import ServerApi from "../utils/ServerApi";
// import { GetNFTMetadata } from "../utils/AlchemySDK";

function useNFTMetadata(contractAddress, tokenId) {
    const [metadata, setMetadata] = useState(null);
    useEffect(() => {
        const f = async () => {
            const m = await ServerApi.GetNftMetadata(contractAddress, tokenId);
            if (m) {
                setMetadata(m);
            }
        };
        f();
    }, [contractAddress, tokenId]);
    return metadata;
}

export default useNFTMetadata;