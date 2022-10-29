import { ethers } from 'ethers';
import { useMemo } from 'react';
import { useAccountContext } from '../contexts/Account';

function useContractWriter(abi, address) {
    const { signer } = useAccountContext();
    const contract = useMemo(() => {
        if (!signer || !abi || !address) {
            return null;
        }
        return new ethers.Contract(address, abi, signer);
    }, [signer, abi, address])
    return contract;
}

export default useContractWriter;