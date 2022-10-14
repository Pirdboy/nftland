import React, { useState } from "react";
import { Box, Center, Flex, Image, LinkBox, LinkOverlay, Skeleton, SkeletonText, Spinner } from "@chakra-ui/react";
import { useAccountContext } from "../contexts/Account";
import { Link as RouterLink } from 'react-router-dom';
import useNFTsForOwner from "../hooks/useNFTsForOwner";
import { IPFSGatewayURL } from "../utils/IPFS";

const NFTCard = ({ nft }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const imageURL = IPFSGatewayURL(nft.metadata.image);
    return (
        <LinkBox
            maxW="300px"
            minW="200px"
            bg="whiteAlpha.900"
            boxShadow="dark-lg"
            rounded="md"
        >
            <LinkOverlay as={RouterLink} to={`/nftdetail/${nft.contract.address}/${nft.tokenId}`}>
                <Box h="10px"></Box>
                <Skeleton isLoaded={imageLoaded} minW="200px" minH="150px">
                    <Image src={imageURL} onLoad={() => setImageLoaded(true)} />
                </Skeleton>
                <SkeletonText mt="5px" h="48px" isLoaded={true} noOfLines={1} spacing='4'>
                    <Box color="black" pl="5px"><b>{nft.metadata.name}</b></Box>
                </SkeletonText>
            </LinkOverlay>
        </LinkBox>
    )
};

const Profile = () => {
    const { account } = useAccountContext();
    const [nftList, isLoading] = useNFTsForOwner(account);
    console.log('[debug] nftList', nftList);
    const nftCards = nftList?.map((e, i) =>
        <NFTCard key={i} nft={e} />
    )
    return (
        <>
            {
                isLoading ? (
                    <Center>
                        <Spinner
                            thickness="8px"
                            speed="0.85s"
                            emptyColor="gray.200"
                            color="blue.500"
                            size="xl"
                            w="100px"
                            h="100px" />
                    </Center>
                ) : (
                    <Flex flexWrap="wrap" gap="16px" p="20px">
                        {nftCards}
                    </Flex>
                )
            }
        </>
    )
}

export default Profile;