import React, { useState } from "react";
import {
    Center,
    Flex,
    Box,
    Input,
    Button,
    HStack,
    Text,
    Textarea,
    Radio,
    RadioGroup,
    FormControl,
    FormLabel,
    Tooltip,
    useToast
} from "@chakra-ui/react";
import { QuestionOutlineIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { useAccountContext } from "../contexts/Account";


const CreateNFT = () => {
    const toast = useToast();
    const { account } = useAccountContext();
    const [name, setName] = useState('');
    const [nameInvalid, setNameInvalid] = useState(false);
    const [desc, setDesc] = useState('');
    const [descInvalid, setDescInvalid] = useState(false);
    const [inputFile, setInputFile] = useState(null);
    const [fileInvalid, setFileInvalid] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [createMode, setCreateMode] = useState('1');

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
    const normalCreate = async () => {
        console.log('normalCreate');
    };
    const freeCreate = async () => {
        console.log('freeCreate');
    };
    const onChangeName = e => {
        setNameInvalid(false);
        setErrorMessage("");
        setName(e.target.value);
    }
    const onChangeDesc = e => {
        setDescInvalid(false);
        setErrorMessage("");
        setDesc(e.target.value);
    }
    const onChangeFile = e => {
        setFileInvalid(false);
        setErrorMessage("");
        setInputFile(e.target.files[0]);
    }
    const onClickCreate = async e => {
        if (!account) {
            showErrorToast("not login");
            return;
        }
        if (!name) {
            setNameInvalid(true);
            setErrorMessage("name is required");
            return
        }
        if (!desc) {
            setDescInvalid(true);
            setErrorMessage("description is required");
            return
        }
        if (!inputFile) {
            setFileInvalid(true);
            setErrorMessage("image is required");
            return
        }
        // TODO: 访问后端
        if (createMode === '1') {
            await normalCreate();
        } else if (createMode === '2') {
            await freeCreate();
        }
    }

    // const createModeTips = "Sit nulla est ex deserunt exercitation anim occaecat. Nostrud ullamco deserunt aute id consequat veniam incididunt duis in sint irure nisi. Mollit officia cillum Lorem ullamco minim nostrud elit officia tempor esse quis.Sunt ad dolore quis aut"

    const createModeTips = (
        <Box>
            <Text>{"It's a lazy minting which only occurs when necessary:"}</Text>
            <Box pl="10px" pr="10px" pt="5px" pb="5px">
                <Text >{"1. When you transfer an item to another account"}</Text>
                <Text >{"2. When someone buys an item from you"}</Text>
            </Box>
            <Text>
                {"This means that you can create NFT for free"}
            </Text>
        </Box>
    )

    return (
        <Center pt="10px">
            <Box w="400px" minH="200px">
                <Text fontSize="xl" align="center">Create NFT</Text>
                <FormControl isRequired>
                    <FormLabel>NFT Name</FormLabel>
                    <Input value={name} isInvalid={nameInvalid} onChange={onChangeName} />
                    <Box h="5px"></Box>
                    <FormLabel>NFT Description</FormLabel>
                    <Textarea value={desc} isInvalid={descInvalid} onChange={onChangeDesc} />
                    <Box h="5px"></Box>
                    <FormLabel>Upload Image</FormLabel>
                    <Input type="file" onChange={onChangeFile} isInvalid={fileInvalid} accept="image/*" />
                    {
                        errorMessage ? <Text color="red.500" fontSize="lg">{errorMessage}</Text> : null
                    }
                    <Box h="5px"></Box>
                    <Flex>
                        {"create is free"}
                        <Box w="5px"></Box>
                        <Center>
                        <Tooltip hasArrow label={createModeTips} placement="top">
                            <InfoOutlineIcon />
                        </Tooltip>
                        </Center>
                    </Flex>
                    <Box h="10px"></Box>
                    <Center><Button size="lg" colorScheme="purple" onClick={onClickCreate}>Create</Button></Center>
                </FormControl>
            </Box>
        </Center>
    )
};

export default CreateNFT;
