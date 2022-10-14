import { useState, useEffect } from "react";
import ServerApi from "../utils/ServerApi";

function useNFTsForOwner(account) {
    const [nftList, setNFTList] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        const f = async () => {
            setError(null);
            setLoading(true);
            try {
                const nfts = ServerApi.GetNftsForOwner(account);
                if(nfts) {
                    setNFTList(nfts);
                }
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };
        f();
    }, [account]);
    
    return {
        nftList, isLoading, error
    }
}

export default useNFTsForOwner;