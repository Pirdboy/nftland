import React, { useState } from "react";
import {
    Center,
    Box,
    Image,
    Text,
    Flex,
    Skeleton,
    Button,
    InputGroup,
    InputRightAddon,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    LinkBox,
    LinkOverlay
} from "@chakra-ui/react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { IPFSGatewayURL } from "../utils/IPFS";
import { useAccountContext } from "../contexts/Account";
import { useNFTDetailContext } from "../contexts/NFTDetailContext";
import NotLogin from "../components/NotLogin";
import NumberInput from "../components/NumberInput";
import DecimalNumberInput from "../components/DecimalNumberInput";
import { ethers } from 'ethers';
import { NFTLandCollectionContractAddress, NFTLandMarketContractAddress } from "../constants/Addresses";
import ServerApi from "../utils/ServerApi";

const NFTSell = () => {
    const { account, signer } = useAccountContext();
    const { nftContextValue } = useNFTDetailContext();
    const [amount, setAmount] = useState('');
    const [price, setPrice] = useState('');
    const [amountOk, setAmountOk] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isListing, setListing] = useState(false);
    const nftMetadata = nftContextValue?.nftMetadata;
    const owners = nftContextValue?.owners;
    const navigate = useNavigate();
    const toast = useToast();
    const showErrorToast = (title, errorMessage) => {
        toast({
            title: title,
            description: errorMessage,
            duration: 2000,
            status: 'error',
            isClosable: false,
            position: 'top'
        })
    }
    const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
    const NFTSaleCreateSuccessModal = (
        <>
            <Modal isOpen={isSuccessModalOpen}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader><Center>{`Your NFT has been listed!`}</Center></ModalHeader>
                    <ModalBody>
                        <Center>
                            <Image w="300px" h="auto" src={IPFSGatewayURL(nftMetadata?.metadata?.image)} />
                        </Center>
                    </ModalBody>
                    <ModalFooter>
                        <Center>
                            <Button colorScheme="blue" w="100px" h="40px" onClick={() => { navigate(`/nftdetail/${nftMetadata?.contract?.address}/${nftMetadata?.tokenId}`) }}>View listing</Button>
                        </Center>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )

    if (!nftContextValue) {
        return null;
    }

    if (!nftMetadata || !owners) {
        return null;
    }
    if (!account) {
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
        if (isNaN(n) || n === 0 || n > youOwnCount) {
            setAmountOk(false);
        } else {
            setAmountOk(true);
        }
        if (n > youOwnCount) {
            setErrorMessage("The amount cannot exceed " + youOwnCount);
        } else {
            setErrorMessage("");
        }
    }
    const onPriceInputChange = val => {
        setPrice(val);
    }
    const onCompleteListingClick = async e => {
        try {
            setListing(true);
            // 1. 如果是外部NFT则需要setApprovalForAll
            // 先查询approval情况, 如果已经approval了则不需要
            if (nftMetadata.contract.address !== NFTLandCollectionContractAddress) {
                const contract = new ethers.Contract(nftMetadata.contract.address, [
                    'function setApprovalForAll(address operator, bool _approved) external',
                    'function isApprovedForAll(address owner, address operator) external view returns (bool)'
                ], signer);
                const isApprovedForAll = await contract.isApprovedForAll(account, NFTLandMarketContractAddress);
                if (!isApprovedForAll) {
                    const tx = await contract.setApprovalForAll(NFTLandMarketContractAddress, true);
                    await tx.wait();
                }
            }
            // 2. 获取订单数据
            console.log("step 2");
            const priceInWei = ethers.utils.parseEther(price).toString();
            console.log('price', price);
            console.log('priceInWei', priceInWei);
            const sale = await ServerApi.GenerateNftSale(
                nftMetadata.tokenId,
                nftMetadata.contract.address,
                amount,
                account,
                priceInWei
            );
            // 3. EIP712签名
            let signature = await signer._signTypedData(sale.domain, sale.types, sale.values);
            // 4. 提交订单
            let response = await ServerApi.StoreNftSale(sale, signature, account);
            console.log("StoreNftSale response:", response);
            setSuccessModalOpen(true);
            setListing(false);
        } catch (error) {
            setSuccessModalOpen(false);
            setListing(false);
            console.log(error);
            showErrorToast("list nft", error);
        }
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
                    <Button isLoading={isListing} loadingText="submitting" spinnerPlacement="start" isDisabled={!amountOk} colorScheme="blue" onClick={onCompleteListingClick}>complete listing</Button>
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
            {NFTSaleCreateSuccessModal}
        </>
    )
};

export default NFTSell;