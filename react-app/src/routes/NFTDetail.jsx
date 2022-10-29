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
    Spinner,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
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
import {
    NFTLandCollectionContractAddress,
    NFTLandMarketContractAddress
} from "../constants/Addresses";
import NFTLandMarketABI from "../abis/NFTLandMarket.json";
import NFTLandCollectionABI from "../abis/NFTLandCollection.json";

const EtherscanGoerli = "https://goerli.etherscan.io/address/";

const SpinnerModal = ({ children, isOpen }) => {
    return (
        <>
            <Modal isOpen={isOpen} closeOnOverlayClick={false}>
                <ModalOverlay />
                <ModalContent w="100px">
                    <ModalBody>
                        {children}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )
};

function clippedAddress(addr) {
    return addr && addr.slice(0, 6) + '...' + addr.slice(addr.length - 4, addr.length);
}

const NFTDetail = (props) => {
    const { contractdAddress, tokenId } = useParams();
    const { account, signer } = useAccountContext();
    const { setNftContextValue } = useNFTDetailContext();
    const { owners, refresh: ownersRefresh } = useOwnersForNFT(contractdAddress, tokenId);
    const { metadata: nftMetadata, refresh: nftMetadataRefresh } = useNFTMetadata(contractdAddress, tokenId);
    const { nftSaleList, setNftSaleList, refresh: nftSaleListRefresh } = useNftSaleList(nftMetadata?.tokenId, nftMetadata?.contract?.address);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [showSpinner, setShowPinner] = useState(false);

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

    const onSaleBuyClicked = async (saleIndex) => {
        try {
            setShowPinner(true);
            const sale = nftSaleList[saleIndex];
            const marketContract = new ethers.Contract(
                NFTLandMarketContractAddress,
                NFTLandMarketABI,
                signer
            );
            const priceBigNumber = ethers.BigNumber.from(sale.price + '');
            const amountBigNumber = ethers.BigNumber.from(sale.amount + '');
            let SaleParameters = [
                ethers.BigNumber.from(sale.tokenId),
                sale.tokenAddress,
                sale.offerer,
                sale.amount,
                priceBigNumber,
                sale.startTime,
                sale.creator,
                sale.totalSupply,
                sale.tokenType,
                sale.minted
            ];
            let payValue = priceBigNumber.mul(amountBigNumber);
            let txResponse = await marketContract.executeSaleOrder(
                SaleParameters,
                sale.signature,
                {
                    value: payValue
                }
            );
            await txResponse.wait();
            setNftSaleList(nftSaleList.map(e =>
                e.signature === sale.signature
                    ? { ...e, status: 1, buyer: account }
                    : e
            ))
            setShowPinner(false);
            ownersRefresh();
        } catch (error) {
            setShowPinner(false);
        }
    }
    const onSaleCancelClicked = async (saleIndex) => {
        try {
            setShowPinner(true);
            const sale = nftSaleList[saleIndex]
            const marketContract = new ethers.Contract(
                NFTLandMarketContractAddress,
                NFTLandMarketABI,
                signer
            );
            let SaleParameters = [
                ethers.BigNumber.from(sale.tokenId),
                sale.tokenAddress,
                sale.offerer,
                sale.amount,
                ethers.BigNumber.from(sale.price),
                sale.startTime,
                sale.creator,
                sale.totalSupply,
                sale.tokenType,
                sale.minted
            ];
            let txResponse = await marketContract.cancelSale(
                SaleParameters,
                sale.signature
            );
            await txResponse.wait();
            setNftSaleList(nftSaleList.map(e =>
                e.signature === sale.signature
                    ? { ...e, status: 2 }
                    : e
            ))
            setShowPinner(false);
        } catch (error) {
            setShowPinner(false);
        }
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
                    <Tr><Th>Unit Price</Th><Th>Amount</Th><Th>Offerer</Th><Th>Buyer</Th><Th>Status</Th><Th>&nbsp;</Th></Tr>
                </Thead>
                <Tbody>
                    {nftSaleList.map((e, i) => {
                        const priceInEth = ethers.utils.formatEther(ethers.BigNumber.from(e.price));
                        let btn;
                        if (!account || e.status > 0) {
                            btn = null;
                        }
                        else if (e.offerer.toLowerCase() === account.toLowerCase()) {
                            btn = <Button colorScheme="blue" onClick={() => onSaleCancelClicked(i)}>Cancel</Button>
                        } else {
                            btn = <Button colorScheme="blue" onClick={() => onSaleBuyClicked(i)}>Buy</Button>
                        }
                        let statusText = "not sold yet";
                        if (e.status === 1) {
                            statusText = "sold";
                        } else if (e.status === 2) {
                            statusText = "canceled";
                        }
                        return (
                            <Tr key={i}>
                                <Td>{`${priceInEth} ETH`}</Td>
                                <Td>{e.amount}</Td>
                                <Td>{clippedAddress(e.offerer)}</Td>
                                <Td>{clippedAddress(e.buyer) ?? ""}</Td>
                                <Td>{statusText}</Td>
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
    }, [nftMetadata, owners, setNftContextValue])

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
                        <LinkBox w="100px" h="40px">
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
            <SpinnerModal isOpen={showSpinner}>
                <Spinner color="black" size="xl" speed="0.7s" />
            </SpinnerModal>
        </>
    )
};

export default NFTDetail;