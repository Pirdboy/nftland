import React from "react";
import { GiIceland } from 'react-icons/gi';
import { Icon, Flex, Center, Button, Link, LinkBox, LinkOverlay } from '@chakra-ui/react';
import { useAccountContext } from "../../contexts/Account";
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

const LoginAccessURLs = [
    '/profile'
];

function clippedAddress(addr) {
    return addr && addr.slice(0, 6) + '...' + addr.slice(addr.length - 4, addr.length);
}

const NavBar = () => {
    let location = useLocation();
    let navigate = useNavigate();
    const spacing = "16px";
    const { account, connect, disconnect } = useAccountContext();
    const bgProp = {}; //{bg:"gray"};

    const onDisconnect = () => {
        if (LoginAccessURLs.indexOf(location.pathname) >= 0) {
            navigate("/", { replace: true });
        }
    };
    return (
        <Flex {...bgProp} pl="15px" pt="6px" pr="10px" pb="6px" justify="space-between">
            <LinkBox>
                <LinkOverlay as={RouterLink} to="/">
                    <Center color="white">
                        <Icon as={GiIceland} boxSize="2em" />
                        <Flex pl="5px" fontSize="1.25em">NFT Land</Flex>
                    </Center>
                </LinkOverlay>
            </LinkBox>

            <Center>
                <Center color="white" fontWeight="normal">
                    <Link as={RouterLink} to="/marketplace">Marketplace</Link>
                    <Flex w={spacing}></Flex>
                    <Link as={RouterLink} to="/create">Create</Link>
                    <Flex w={spacing}></Flex>
                    <Link as={RouterLink} to="/mintbird">Try our Bird NFT</Link>
                    <Flex w={spacing}></Flex>
                </Center>
                <Center>
                    {
                        !account ? (
                            <Button size="sm" colorScheme="green" onClick={connect}>connect</Button>
                        ) : (
                            <>
                                <LinkBox>
                                    <LinkOverlay as={RouterLink} to="/profile">
                                        <Button size="sm" colorScheme="blue">{clippedAddress(account)}</Button>
                                    </LinkOverlay>
                                </LinkBox>
                                <Flex w={spacing}></Flex>
                                <Button size="sm" colorScheme="yellow" onClick={() => disconnect(onDisconnect)}>disconnect</Button>
                            </>
                        )
                    }
                </Center>
            </Center>
        </Flex>
    )
};

export default NavBar;