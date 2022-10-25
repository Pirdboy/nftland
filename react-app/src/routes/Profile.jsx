import React, { useState } from "react";
import { Box, Center, Flex, Text, Image, LinkBox, LinkOverlay, Skeleton, SkeletonText, Spinner } from "@chakra-ui/react";
import { useAccountContext } from "../contexts/Account";
import { Link as RouterLink } from 'react-router-dom';
import useNFTsForOwner from "../hooks/useNFTsForOwner";
import { IPFSGatewayURL } from "../utils/IPFS";

const NFTCard = ({ nft }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const imageURL = IPFSGatewayURL(nft?.metadata?.image ?? nft?.metadata?.image_url);
    return (
        <LinkBox
            w="200px"
            h="200px"
            bg="whiteAlpha.900"
            boxShadow="dark-lg"
            rounded="md"
        >
            <LinkOverlay as={RouterLink} to={`/nftdetail/${nft.contract.address}/${nft.tokenId}`}>
                <Box h="10px"></Box>
                <Skeleton isLoaded={imageLoaded} w="200px" maxH="150px" overflow="hidden">
                    <Image src={imageURL} onLoad={() => setImageLoaded(true)} />
                </Skeleton>
                <Center position="absolute" w="100%" bottom="5px">
                    <SkeletonText isLoaded={true} noOfLines={1} spacing='4'>
                        <Text color="black"><b>{nft.metadata.name}</b></Text>
                    </SkeletonText>
                </Center>
            </LinkOverlay>
        </LinkBox>
    )
};

const Profile = () => {
    const { account } = useAccountContext();
    const { nftList, isLoading } = useNFTsForOwner(account);
    const nftCards = nftList?.map((e, i) =>
        <NFTCard key={i} nft={e} />
    )
    return (
        <Box>
            {
                isLoading ? (
                    <Center>
                        <Spinner
                            thickness="6px"
                            speed="0.75s"
                            emptyColor="gray.200"
                            color="blue.500"
                            size="xl"
                            w="64px"
                            h="64px" />
                    </Center>
                ) : (
                    <>
                        <Center>
                            <Text fontSize="xl">My NFTs</Text>
                        </Center>
                        <Flex flexWrap="wrap" gap="16px" p="20px">
                            {nftCards}
                        </Flex>
                    </>
                )
            }
        </Box>
    )
}

export default Profile;