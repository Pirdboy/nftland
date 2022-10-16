import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { EthersAppContext } from 'eth-hooks/context';
import { AccountContextProvider } from './contexts/Account';
import { NFTDetailContextProvider } from './contexts/NFTDetailContext';
import theme from './theme';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MarketPlace from './routes/Marketplace';
import CreateNFT from './routes/CreateNFT';
import MintBirdNFT from './routes/MintBirdNFT';
import Profile from './routes/Profile';
import NFTDetail from './routes/NFTDetail';
import Demo from './routes/Demo';
import NFTSell from './routes/NFTSell';


function ContextProvider({ children }) {
    return (
        <EthersAppContext>
            <AccountContextProvider>
                <NFTDetailContextProvider>
                    <ChakraProvider>
                        {children}
                    </ChakraProvider>
                </NFTDetailContextProvider>
            </AccountContextProvider>
        </EthersAppContext>
    )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <BrowserRouter>
            <ContextProvider>
                <Routes>
                    <Route path="/" element={<App />}>
                        <Route index element={<MarketPlace />} />
                        <Route path="marketplace" element={<MarketPlace />} />
                        <Route path="create" element={<CreateNFT />} />
                        <Route path="mintbird" element={<MintBirdNFT />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="nftdetail/:contractdAddress/:tokenId" element={<NFTDetail />}>
                        </Route>
                        <Route path="nftsell/:contractAddress/:tokenId" element={<NFTSell />} />
                        <Route path="demo" element={<Demo />} />
                    </Route>
                </Routes>
            </ContextProvider>
        </BrowserRouter>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
