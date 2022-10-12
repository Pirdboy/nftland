import { useState, useEffect } from "react";
// import { GetNFTContractMetadata } from "../utils/AlchemySDK";

function useNFTContractMetadata(contractAddress) {
    const [metadata, setMetadata] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // useEffect(() => {
    //     const f = async () => {
    //         setLoading(true);
    //         setError(null);
    //         try {
    //             const m = await GetNFTContractMetadata(contractAddress);
    //             if (m) {
    //                 setMetadata(m);
    //             }
    //             setLoading(false);
    //         } catch (error) {
    //             setLoading(false);
    //             setError(error);
    //         }
    //     };
    //     f();
    // }, [contractAddress]);
    return {metadata, isLoading, error};
}

export default useNFTContractMetadata;