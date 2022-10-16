import React, { useState } from "react";
import { Center, Box, Image, Text, Flex, Skeleton, Button, InputGroup, InputRightAddon } from "@chakra-ui/react";
import { IPFSGatewayURL } from "../utils/IPFS";
import { useAccountContext } from "../contexts/Account";
import { useNFTDetailContext } from "../contexts/NFTDetailContext";
import NotLogin from "../components/NotLogin";
import NumberInput from "../components/NumberInput";
import DecimalNumberInput from "../components/DecimalNumberInput"

const NFTSell = () => {
    const { account, signer } = useAccountContext();
    const { nftContextValue } = useNFTDetailContext();
    const [amount, setAmount] = useState('');
    const [price, setPrice] = useState('');
    const [amountOk, setAmountOk] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    if(!nftContextValue) {
        return null;
    }
    let nftMetadata = nftContextValue?.nftMetadata;
    let owners = nftContextValue?.owners;
    if(!nftMetadata|| !owners) {
        return null;
    }
    if(!account) {
        return <NotLogin />
    }
    let youOwnCount = 5;
    for (let i = 0; i < owners.length; i++) {
        if (owners[i].owner.toLowerCase() === account?.toLowerCase()) {
            youOwnCount = owners[i].balance;
        }
    }
 
    if (youOwnCount === 0) {
        return <Center>not owned by you, you cannot sell</Center>;
    }

    const onImageLoaded = () => {
        setImageLoaded(true);
    }
    const onAmountInputChange = val => {
        setAmount(val);
        let n = Number(val);
        if(isNaN(n) || n===0 || n > youOwnCount) {
            setAmountOk(false);
        } else {
            setAmountOk(true);
        }
        if(n > youOwnCount) {
            setErrorMessage("The amount cannot exceed "+youOwnCount);
        } else {
            setErrorMessage("");
        }
    }
    const onPriceInputChange = val => {
        setPrice(val);
    }
    const onCompleteListingClick = e => {
        
    }

    return (
        <>
            <Center p="20px">
                {/* left panel */}
                <Box w="400px">
                    <Text fontSize="3xl">List item for sale</Text>
                    <Text fontSize="xl">Amount</Text>
                    <NumberInput value={amount} onChange={onAmountInputChange} />
                    <Flex justifyContent="space-between">
                        <Text color="red.600">{errorMessage}</Text>
                        <Text color="gray.200">{`${youOwnCount} available`}</Text>
                    </Flex>
                    <Text fontSize="xl">Price per unit</Text>
                    <InputGroup>
                        <DecimalNumberInput value={price} onChange={onPriceInputChange} />
                        <InputRightAddon children="ether" />
                    </InputGroup>
                    <Box h="15px"></Box>
                    <Button isDisabled={!amountOk} colorScheme="blue" onClick={onCompleteListingClick}>complete listing</Button>
                </Box>
                <Box w="10px" h="100%" />
                {/* right panel */}
                <Box>
                    <Text fontSize="2xl">Preview</Text>
                    <Skeleton isLoaded={imageLoaded} w="380px" h="300px">
                        <Image src={IPFSGatewayURL(nftMetadata?.metadata?.image)} onLoad={onImageLoaded} />
                    </Skeleton>
                </Box>
            </Center>
        </>
    )
};

export default NFTSell;