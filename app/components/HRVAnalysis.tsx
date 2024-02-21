import React from 'react';
import Typewriter from 'typewriter-effect';
import { HRVData } from '../../app/types/OuraInterfaces';

interface HRVAnalysisProps {
    hrvData: HRVData | null;
    analysis: string;
    isLoading: boolean;
    loadingDots: string;
}


const HRVAnalysis: React.FC<HRVAnalysisProps> = ({ hrvData, analysis, isLoading, loadingDots }) => {
    return (
        <div className="flex-grow flex flex-col items-stretch border border-gray-200 mb-5 rounded-lg bg-white overflow-auto py-5 px-5 h-[240px]">
            {isLoading ? <div>Loading{loadingDots}</div> : analysis && (
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

export default HRVAnalysis;
