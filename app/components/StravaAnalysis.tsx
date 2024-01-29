import React, { useState, useEffect } from 'react';
import Typewriter from 'typewriter-effect';
import { StravaActivity } from '../types/StravaInterface';

interface StravaAnalysisProps {
    stravaData: StravaActivity[] | null;
    analysis: string;
    isLoading: boolean;
    loadingDots: string;
}

const StravaAnalysis: React.FC<StravaAnalysisProps> = ({ stravaData, analysis, isLoading, loadingDots }) => {

    return (
        <div className="StravaAnalysis">
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

export default StravaAnalysis;
