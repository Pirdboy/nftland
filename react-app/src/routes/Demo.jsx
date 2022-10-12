import React from "react";
import { Center, Button } from "@chakra-ui/react";
import { useAccountContext } from "../contexts/Account";
import {ethers} from "ethers";

// signer._signTypedData
// signer.signMessage

const Demo = () => {
    
    const { account, provider, signer } = useAccountContext();
    const signTypedData = async () => {
        const domain = {
            name: 'Ether Mail',
            version: '1',
            chainId: 5,
            verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
        };

        // The named list of all type definitions
        const types = {
            Person: [
                { name: 'name', type: 'string' },
                { name: 'wallet', type: 'address' }
            ],
            Mail: [
                { name: 'from', type: 'Person' },
                { name: 'to', type: 'Person' },
                { name: 'contents', type: 'string' }
            ]
        };

        // The data to sign
        const value = {
            from: {
                name: 'Cow',
                wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
            },
            to: {
                name: 'Bob',
                wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
            },
            contents: 'Hello, Bob!'
        };

        let signature = await signer._signTypedData(domain, types, value);
        console.log("signature", signature);

        let signature2 = ethers.utils._TypedDataEncoder.hash(domain, types, value);
        console.log("signature2", signature2);
    };
    const signPersonal = async () => {
        await signer.signMessage("welcome to NFTLand! Click Sign to sign in.");
    }
    return (
        <>
            <Center>Demo</Center>
            <Button onClick={signTypedData}>signTypedData</Button>
            <Button onClick={signPersonal}>signPersonal</Button>
        </>
    )
};

export default Demo;