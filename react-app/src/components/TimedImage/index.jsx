import React, { useState, useEffect } from "react";
import { Image } from "@chakra-ui/react";

const TimedImage = ({ images, interval }) => {
    const [index, setIndex] = useState(0);
    const length = images?.length ?? 0;
    useEffect(() => {
        const t = setInterval(() => {
            setIndex(prev => (prev + 1) % length)
        }, interval)
        return () => clearInterval(t);
    })
    return (
        <Image src={images[index]} alt="bird nft" />
    )
};

export default TimedImage;