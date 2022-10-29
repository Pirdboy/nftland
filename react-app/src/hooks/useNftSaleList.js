import { useState, useEffect, useCallback } from "react";
import ServerApi from "../utils/ServerApi";

function useNftSaleList(tokenId, tokenAddress) {
    const [nftSaleList, setNftSaleList] = useState([]);
    const refresh = useCallback(async () => {
        try {
            const r = await ServerApi.GetNftSaleList(tokenId, tokenAddress);
            setNftSaleList(r);
        } catch (error) {
            setNftSaleList([]);
        }
    }, [tokenId, tokenAddress]);
    useEffect(() => {
        refresh();
    }, [refresh]);
    return {nftSaleList, setNftSaleList, refresh};
}

export default useNftSaleList;