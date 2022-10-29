import { useState, useEffect, useCallback } from "react";
import ServerApi from "../utils/ServerApi";

function useTopSaleList() {
    const [topSaleList, setTopSaleList] = useState([]);
    const refresh = useCallback(async () => {
        try {
            const r = await ServerApi.GetTopSaleList();
            setTopSaleList(r);
        } catch (error) {
            setTopSaleList([]);
        }
    }, []);
    useEffect(() => {
        refresh();
    }, [refresh]);

    return {topSaleList, refresh};
}

export default useTopSaleList;