import { useState, useEffect } from "react";
import ServerApi from "../utils/ServerApi";

function useNftSaleList(tokenId, tokenAddress) {
    const [saleList, setSaleList] = useState([]);
    useEffect(() => {
        const f = async () => {
            try {
                const r = await ServerApi.GetNftSaleList(tokenId, tokenAddress);
                console.log("getNftSaleList", r);
                setSaleList(r);
            } catch (error) {
                console.log("useNftSaleList error",error);
                setSaleList([]);
            }
        };
        f();
    }, [tokenId, tokenAddress]);
    return saleList;
}

export default useNftSaleList;