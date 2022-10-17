import React, { useState } from "react";
import { Box, Center, Text, Button, Image, Link, Spinner, useToast } from "@chakra-ui/react";
import birdImages from "../assets/bird";
import TimedImage from "../components/TimedImage";
import { BirdNFTAddress } from "../constants/Addresses";
import useContractWriter from "../hooks/useContractWriter";
import BirdNFTABI from "../abis/BirdNFT.json";
import { ethers } from "ethers";
import { IPFSGatewayURL } from "../utils/IPFS";
import { useAccountContext } from "../contexts/Account";
import { Link as RouterLink } from 'react-router-dom';


const MintBirdNFT = () => {
    const { account } = useAccountContext();
    const [isMinting, setMinting] = useState(false);
    const [mintedTokenId, setMintedTokenId] = useState(null);
    const toast = useToast();
    const birdNFTContract = useContractWriter(BirdNFTABI, BirdNFTAddress);

    const MintingSpinner = (
        <Spinner
            thickness='4px'
            speed='0.65s'
            emptyColor='gray.200'
            color='purple.600'
            size='lg'
        />
    )

    const showErrorToast = (title, errorMessage) => {
        toast({
            title: title,
            description: errorMessage,
            duration: 1500,
            status: 'error',
            isClosable: false,
            position: 'top'
        })
    }

    const showSuccessToast = (title, message) => {
        toast({
            title: title,
            description: message,
            duration: 1500,
            status: 'success',
            isClosable: false,
            position: 'top'
        })
    }

    const mintNFT = async () => {
        if (!account) {
            throw new Error('not connected');
        }
        let txResponse = await birdNFTContract.mintNFT({ value: ethers.utils.parseEther("0.01") })
        const receipt = await txResponse.wait();
        console.log(`Transaction was mined in block ${receipt.blockNumber}`);
        let transferEvent = receipt.events[0];
        let tokenIdArg = transferEvent.args[2];
        let tokenId = tokenIdArg.toNumber();
        console.log("mintNFT tokenId", tokenId);
        return tokenId;
    };

    const mintClicked = async () => {
        setMinting(true);
        setMintedTokenId(null);
        try {
            setMintedTokenId(await mintNFT());
            showSuccessToast('mintNFT success', '')
            setMinting(false);
        } catch (error) {
            console.log(error);
            showErrorToast("mintNFT", error.message);
            setMinting(false);
        }
    };

    return (
        <Box>
            <Center>
                <Text fontSize="3xl" color="white">Mint your NFT!</Text>
            </Center>
            <Box h="10px"></Box>
            <Center>
                <Box border="5px solid black" w="200px">
                    <TimedImage images={birdImages} interval={1000} />
                </Box>
            </Center>
            <Box h="16px"></Box>
            <Center>
                <Button isLoading={isMinting} spinner={MintingSpinner} loadingText="Minting" onClick={mintClicked} w="192px" h="42px" fontSize="24px" color="purple.600" colorScheme="yellow">Mint</Button>
            </Center>
            <Box h="16px"></Box>
            {/* Your Bird NFT */}
            {
                !mintedTokenId
                    ? null
                    : (
                        <Center>
                            <Link as={RouterLink} to={`/nftdetail/${BirdNFTAddress}/${mintedTokenId}`} fontSize="20px" color="purple.600">View minted NFT detail</Link>
                        </Center>
                    )
            }
        </Box>
    )
};

export default MintBirdNFT;