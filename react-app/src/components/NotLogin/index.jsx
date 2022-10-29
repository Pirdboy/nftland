import React from "react";
import { Center, Alert, AlertIcon, AlertDescription } from "@chakra-ui/react";
const NotLogin = () => {
    return (
        <Center>
            <Alert status='error' w="140px" h="40px">
                <AlertIcon />
                <AlertDescription flex="0 0 auto">
                    Not Login
                </AlertDescription>
            </Alert>
        </Center>
    )
};

export default NotLogin;