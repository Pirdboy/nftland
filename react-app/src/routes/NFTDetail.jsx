import React, { useState, useEffect } from "react";
import {
    Center,
    Box,
    Image,
    Text,
    Flex,
    Link,
    LinkBox,
    LinkOverlay,
    Skeleton,
    Button,
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
} from "@chakra-ui/react";
import { useParams, Link as RouterLink } from "react-router-dom";
import birdImage from "../assets/1.png";
import { IPFSGatewayURL } from "../utils/IPFS";
import useNFTMetadata from "../hooks/useNFTMetadata";
import useOwnersForNFT from "../hooks/useOwnersForNFT";
import useNftSaleList from "../hooks/useNftSaleList";
import { useAccountContext } from "../contexts/Account";
import { useNFTDetailContext } from "../contexts/NFTDetailContext";
import { ethers } from "ethers";

const EtherscanGoerli = "https://goerli.etherscan.io/address/";

const NFTDetail = (props) => {
    const { contractdAddress, tokenId } = useParams();
    const { account } = useAccountContext();
    const { setNftContextValue } = useNFTDetailContext();
    const owners = useOwnersForNFT(contractdAddress, tokenId);
    const nftMetadata = useNFTMetadata(contractdAddress, tokenId);
    const [imageLoaded, setImageLoaded] = useState(false);
    const nftSaleList = useNftSaleList(nftMetadata?.tokenId, nftMetadata?.contract?.address);

    console.log("owners", owners);
    let youOwnCount = 0;
    for (let i = 0; i < owners?.length; i++) {
        if (owners[i].owner?.toLowerCase() === account?.toLowerCase()) {
            youOwnCount = owners[i].balance;
        }
    }
    let ownerText = `${owners?.length} owners`;
    if (youOwnCount > 0) {
        ownerText += `, you own ${youOwnCount}`;
    }

    const onImageLoaded = () => {
        setImageLoaded(true);
    }

    const onSaleBuyClicked = async (sale) => {
        console.log("buy", sale);
    }
    const onSaleCancelClicked = async (sale) => {
        console.log("cancel", sale);
    };

    let attributesOrProperties = nftMetadata?.metadata?.attributes;
    if (!attributesOrProperties) {
        attributesOrProperties = nftMetadata?.metadata?.properties
    }
    let attributesOrPropertiesDisplay = null;
    if (attributesOrProperties?.length > 0) {
        attributesOrPropertiesDisplay = attributesOrProperties.map((e, i) => {
            return <Flex key={i}>
                <Text>{e.trait_type + ": "}</Text>
                <Box w="20px"></Box>
                <Text>{e.value}</Text>
            </Flex>
        })
    }

    let nftSaleListTable = (
        <TableContainer>
            <Table variant='simple' size="sm">
                <Thead>
                    <Tr><Th>Unit Price</Th><Th>Amount</Th><Th>Offerer</Th><Th>&nbsp;</Th></Tr>
                </Thead>
                <Tbody>
                    {nftSaleList.map((e, i) => {
                        const priceInEth = ethers.utils.formatEther(ethers.BigNumber.from(e.price));
                        let btn;
                        if (!account) {
                            btn = null;
                        } else if (e.offerer.toLowerCase() === account.toLowerCase()) {
                            btn = <Button colorScheme="blue" onClick={() => onSaleCancelClicked(e)}>Cancel</Button>
                        } else {
                            btn = <Button colorScheme="blue" onClick={() => onSaleBuyClicked(e)}>Buy</Button>
                        }
                        return (
                            <Tr key={i}>
                                <Td>{`${priceInEth} ETH`}</Td>
                                <Td>{e.amount}</Td>
                                <Td>{e.offerer}</Td>
                                <Td>{btn}</Td>
                            </Tr>
                        )
                    })}
                </Tbody>
            </Table>
        </TableContainer>
    )

    useEffect(() => {
        setNftContextValue({
            nftMetadata,
            owners
        })
    }, [nftMetadata, owners])

    if (!contractdAddress || !tokenId) {
        return null;
    }

    return (
        <>
            <Flex p="20px" justify="center">
                {/* left panel */}
                <Box w="400px">
                    <Skeleton isLoaded={imageLoaded} w="380px" h="300px">
                        <Image src={IPFSGatewayURL(nftMetadata?.metadata?.image)} onLoad={onImageLoaded} />
                    </Skeleton>
                    <Box h="10px" />
                    <Text fontSize="lg" fontWeight="bold">{nftMetadata?.metadata?.name}</Text>
                    <Text fontSize="md">{nftMetadata?.metadata?.description}</Text>
                    <Text fontSize="md">{ownerText}</Text>
                    <Text fontSize="lg" fontWeight="bold">Properties</Text>
                    {attributesOrPropertiesDisplay}
                    <Text fontSize="lg" fontWeight="bold">Details</Text>
                    <Text>{`Contract Address: ${nftMetadata?.contract?.address}`}</Text>
                    <Text>{`Token ID: ${nftMetadata?.tokenId}`}</Text>
                    <Text>{`Minted: ${nftMetadata?.minted}`}</Text>
                    <Text>{`Token Standard: ${nftMetadata?.tokenType}`}</Text>
                </Box>
                <Box w="5px" h="100%" />
                {/* right panel */}
                <Box>
                    {youOwnCount > 0 ?
                        <LinkBox>
                            <LinkOverlay as={RouterLink} to={`/nftsell/${contractdAddress}/${tokenId}`}>
                                <Button colorScheme="yellow" w="100px" h="40px">Sell</Button>
                            </LinkOverlay>
                        </LinkBox> : null
                    }
                    <Text fontSize="xl">Listings</Text>
                    {/* price, usd price,amount, offerer, button(buy)  */}
                    {nftSaleListTable}
                </Box>
            </Flex>
        </>
    )
};

export default NFTDetail;