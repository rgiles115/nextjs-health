import React, { useState, useEffect } from 'react';
import Typewriter from 'typewriter-effect';

interface ReadinessAnalysisProps {
    readinessData: readinessData | null;
    analysis: string;
    isLoading: boolean;
    loadingDots: string;
}

interface readinessData {
    dates: string[];
    restingHeartRate: number[];
    hrvBalance: number[];
    bodyTemperature: number[];
}

interface ReadinessEntry {
    day: string;
    contributors: {
        resting_heart_rate: number;
        hrv_balance: number;
        body_temperature: number; // Ensure these match the actual API response fields
    };
}

const ReadinessAnalysis: React.FC<ReadinessAnalysisProps> = ({ readinessData, analysis, isLoading, loadingDots }) => {

    return (
        <div className="ReadinessAnalysis">
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
