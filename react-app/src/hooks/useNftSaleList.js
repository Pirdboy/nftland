import { useState, useEffect, useCallback } from "react";
import ServerApi from "../utils/ServerApi";

function useNftSaleList(tokenId, tokenAddress) {
    const [nftSaleList, setNftSaleList] = useState([]);
    const refresh = useCallback(async () => {
        try {
            const r = await ServerApi.GetNftSaleList(tokenId, tokenAddress);
            console.log("getNftSaleList", r);
            setNftSaleList(r);
        } catch (error) {
            console.log("useNftSaleList error",error);
            setNftSaleList([]);
        }
    }, [tokenId, tokenAddress]);
    useEffect(() => {
        refresh();
    }, [refresh]);
    return {nftSaleList, setNftSaleList, refresh};
}

export default useNftSaleList;