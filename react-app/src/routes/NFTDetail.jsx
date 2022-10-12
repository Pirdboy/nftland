import React, { useState } from "react";
import { Center, Box, Image, Text, Flex, Link, Skeleton } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import birdImage from "../assets/1.png";
import { IPFSGatewayURL } from "../utils/IPFS";
import useNFTMetadata from "../hooks/useNFTMetadata";
import useOwnersForNFT from "../hooks/useOwnersForNFT";
import { useAccountContext } from "../contexts/Account";

const EtherscanGoerli = "https://goerli.etherscan.io/address/";

const NFTDetail = () => {
    let { contractdAddr, tokenId } = useParams();
    const { account } = useAccountContext();
    const owners = useOwnersForNFT(contractdAddr, tokenId);
    const ownerText = !account || owners[0]?.toLowerCase() !== account?.toLowerCase() ? owners[0] : "you";
    const nftMetadata = useNFTMetadata(contractdAddr, tokenId);

    const [imageLoaded, setImageLoaded] = useState(false);
    if (!contractdAddr || !tokenId) {
        return null;
    }

    const onImageLoaded = () => {
        setImageLoaded(true);
    }

    const AttributesDisplay = (
        <>
            {nftMetadata?.rawMetadata?.attributes?.map((e, i) =>
                <Flex key={i}>
                    <Text>{e.trait_type + ": "}</Text>
                    <Box w="20px"></Box>
                    <Text>{e.value}</Text>
                </Flex>
            )}
        </>
    );

    return (
        <Flex p="20px" justify="center">
            {/* left panel */}
            <Box w="400px">
                <Skeleton isLoaded={imageLoaded} w="300px" h="250px">
                    <Image src={IPFSGatewayURL(nftMetadata?.rawMetadata?.image)} onLoad={onImageLoaded} />
                </Skeleton>
                <Box h="10px" />
                <Text fontSize="xl" fontWeight="bold">{nftMetadata?.rawMetadata?.name}</Text>
                <Text fontSize="lg">{nftMetadata?.rawMetadata?.description}</Text>
                <Text fontSize="lg">{"owned by "}<Link to={`${EtherscanGoerli + owners[0]}`} color="blue.600">{ownerText}</Link></Text>
                <Text fontSize='xl' fontWeight="bold">Attributes</Text>
                {AttributesDisplay}
            </Box>
            <Box w="5px" h="100%" />
            {/* right panel */}
            <Box>
                <Text>{"Right Panel(price, marketplace)"}</Text>
            </Box>
        </Flex>
    )
};

export default NFTDetail;