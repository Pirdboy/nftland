import { useState, useEffect, useCallback } from "react";
import ServerApi from "../utils/ServerApi";
import { IPFSGatewayURL } from "../utils/IPFS";
const axios = require('axios').default;

function useNFTsForOwner(account) {
    const [nftList, setNFTList] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const updater = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            let nfts = await ServerApi.GetNftsForOwner(account);
            let nfts2;
            if (nfts) {
                nfts2 = new Array(nfts.length);
                for (let i = 0; i < nfts.length; i++) {
                    let e = nfts[i];
                    if (!e.metadata?.name) {
                        const metadataGateway = IPFSGatewayURL(e.metadataUrl);
                        const r = await axios.get(metadataGateway);
                        e.metadata = r.data;
                    }
                    nfts2[i] = e;
                }
            } else {
                nfts2 = [];
            }
            setNFTList(nfts2);
            setLoading(false);
        } catch (error) {
            setError(error);
            setLoading(false);
        }
    }, [account]);
    useEffect(() => {
        updater();
    }, [updater]);

    return {
        nftList, isLoading, error, updater
    }
}

export default useNFTsForOwner;