import { ethers } from 'ethers';
import { useMemo } from 'react';
import { useAccountContext } from '../contexts/Account';

function useContractReader(abi, address) {
    const { provider } = useAccountContext();
    const contract = useMemo(() => {
        if(!provider || !abi || !address) {
            return null;
        }
        return new ethers.Contract(address, abi, provider);
    }, [provider, abi, address]);
    return contract;
}

export default useContractReader;