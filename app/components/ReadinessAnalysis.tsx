import React, { useState, useEffect } from 'react';
import Typewriter from 'typewriter-effect';
import { ReadinessData } from '../../app/types/OuraInterfaces';

interface ReadinessAnalysisProps {
    readinessData: ReadinessData | null;
    analysis: string;
    isLoading: boolean;
    loadingDots: string;
}

const ReadinessAnalysis: React.FC<ReadinessAnalysisProps> = ({ readinessData, analysis, isLoading, loadingDots }) => {

    return (
        <div className="flex-grow flex flex-col items-stretch border border-gray-200 mb-5 rounded-lg bg-white overflow-auto py-5 px-5 h-[240px]">
            {analysis && (
                <Typewriter
                    options={{
                        strings: analysis,
                        autoStart: true,
                        loop: false,
                        delay: 1
                    }}
                />
            )}
        </div>
    );
};

export default ReadinessAnalysis;
