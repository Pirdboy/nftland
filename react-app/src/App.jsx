import React, { useState } from "react";
import {
    Box,
    Alert,
    AlertIcon,
    AlertDescription,
    CloseButton
} from "@chakra-ui/react";
import NavBar from "./components/NavBar";
import bg from "./assets/bg.png";
import { useAccountContext } from "./contexts/Account";
import { IsSupportedChain } from "./utils/ChainId";
import { useEffect } from "react";
import { Outlet } from 'react-router-dom';

const Background = ({ children }) => {
    return (
        <Box w="100vw" h="100vh" bgImage={`url(${bg})`} bgSize="200% 180%" bgRepeat="no-repeat">
            {children}
        </Box>
    )
};

const NetworkWarning = ({ close }) => {
    return (
        <Alert status='error'>
            <AlertIcon />
            <AlertDescription flex="0 0 auto">
                You wallet is not connected to the right network, please connect to <b>Goerli</b> Network
            </AlertDescription>
            <Box flex="1 1 auto"></Box>
            {/* <CloseButton flex="0 0 auto" onClick={close} /> */}
        </Alert>
    )
};

function App() {
    const { chainId, connect } = useAccountContext();
    const [showNetworkWarning, setShowNetworkWarning] = useState(false);
    console.log("node env", process.env.NODE_ENV);
    useEffect(() => {
        if (chainId && !IsSupportedChain(chainId)) {
            setShowNetworkWarning(true);
        } else {
            setShowNetworkWarning(false);
        }
    }, [chainId]);

    // check metamask connect
    useEffect(() => {
        const checkMetamaskConnect = async () => {
            const { ethereum } = window;
            if (!ethereum) {
                return;
            }
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts.length !== 0) {
                connect();
            }
        };
        checkMetamaskConnect();
        // eslint-disable-next-line
    }, [])
    return (
        <Background>
            {
                showNetworkWarning ?
                    <NetworkWarning close={() => setShowNetworkWarning(false)} /> :
                    null
            }
            <NavBar />
            <Outlet />
        </Background>
    );
}

export default App;
