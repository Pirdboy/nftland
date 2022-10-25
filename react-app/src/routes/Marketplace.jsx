import React, {useState} from "react";
import {
    Center,
    Box,
    Text,
    Flex,
    LinkBox,
    LinkOverlay,
    Skeleton,
    SkeletonText,
    Image
} from "@chakra-ui/react";
import useNFTMetadata from "../hooks/useNFTMetadata";
import useTopSaleList from "../hooks/useTopSaleList";
import { IPFSGatewayURL } from "../utils/IPFS";
import { Link as RouterLink } from 'react-router-dom';

// const NFTCard = ({ nft }) => {
//     const [imageLoaded, setImageLoaded] = useState(false);
//     const imageURL = IPFSGatewayURL(nft?.metadata?.image ?? nft?.metadata?.image_url);
//     return (
//         <LinkBox
//             maxW="300px"
//             minW="200px"
//             bg="whiteAlpha.900"
//             boxShadow="dark-lg"
//             rounded="md"
//         >
//             <LinkOverlay as={RouterLink} to={`/nftdetail/${nft.contract.address}/${nft.tokenId}`}>
//                 <Box h="10px"></Box>
//                 <Skeleton isLoaded={imageLoaded} minW="200px" minH="150px">
//                     <Image src={imageURL} onLoad={() => setImageLoaded(true)} />
//                 </Skeleton>
//                 <SkeletonText mt="5px" h="48px" isLoaded={true} noOfLines={1} spacing='4'>
//                     <Box color="black" pl="5px"><b>{nft.metadata.name}</b></Box>
//                 </SkeletonText>
//             </LinkOverlay>
//         </LinkBox>
//     )
// };

const NFTCard = ({ tokenAddress, tokenId }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const {metadata: nft} = useNFTMetadata(tokenAddress, tokenId);
    const imageURL = IPFSGatewayURL(nft?.metadata?.image ?? nft?.metadata?.image_url);
    return (
        <LinkBox
            w="200px"
            h="200px"
            bg="whiteAlpha.900"
            boxShadow="dark-lg"
            rounded="md"
        >
            <LinkOverlay as={RouterLink} to={`/nftdetail/${nft?.contract.address}/${nft?.tokenId}`}>
                <Box h="8px"></Box>
                <Skeleton isLoaded={imageLoaded} w="200px" maxH="150px" overflow="hidden">
                    <Image src={imageURL} onLoad={() => setImageLoaded(true)} />
                </Skeleton>
                <Center position="absolute" w="100%" bottom="5px" color="black"><b>{nft?.metadata.name}</b></Center>
            </LinkOverlay>
        </LinkBox>
    )
}

const MarketPlace = () => {
    const { topSaleList } = useTopSaleList();
    const nfts = topSaleList?.map((e, i) => {
        return <NFTCard
            key={i}
            tokenAddress={e.tokenAddress}
            tokenId={e.tokenId} />
    })
    return (
        <Box>
            <Center>
                <Text fontSize="3xl">Top NFTs</Text>
            </Center>
            <Flex flexWrap="wrap" gap="16px" p="20px">
                {nfts}
            </Flex>
        </Box>
    )
};

export default MarketPlace;