'use client'

import React, { useEffect } from 'react';
import { ring } from 'ldrs';

const Loading = () => {
    useEffect(() => {
        ring.register();
    }, []);

    return (
        <div className="loader">
            <l-ring
                size="40"
                stroke="5"
                bg-opacity="0"
                speed="2" 
                color="black" 
            ></l-ring>
        </div>
    );
};

export default Loading;
