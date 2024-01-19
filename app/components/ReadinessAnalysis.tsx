// Import necessary libraries and components
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Typewriter from 'typewriter-effect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

// Define the props structure for the ReadinessAnalysis component
interface ReadinessAnalysisProps {
    readinessData: any; // Replace 'any' with the specific type of your readiness data
}

// Define the ReadinessAnalysis functional component
const ReadinessAnalysis: React.FC<ReadinessAnalysisProps> = ({ readinessData }) => {
    // State variables
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingDots, setLoadingDots] = useState('');

    // Define the analysis prompt specific to readiness data
    const analysisPrompt = `Analyse the following data that comes from Oura. It includes Oura scores for HRV, resting heart rate and body temperature, which are not the actual readings. Please use is like a professional exercise coach would use this type of information.  Keep the response very short.`;

    // Function to get analysis from the API
    const getAnalysis = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post('/api/chatgpt-analysis', { content: analysisPrompt, data: readinessData });
            if (response.data.choices && response.data.choices.length > 0) {
                setAnalysis(response.data.choices[0].message.content);
            } else {
                setAnalysis('No analysis available.');
            }
        } catch (error) {
            console.error('Error in getAnalysis:', error);
            setAnalysis('Error fetching analysis.');
        }
        setIsLoading(false);
    };

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        if (isLoading) {
            interval = setInterval(() => {
                setLoadingDots(dots => dots.length < 3 ? dots + '.' : '');
            }, 500);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isLoading]);

    return (
        // Similar JSX as ChatGPTAnalysis, with buttons and typewriter effect
        <div>
            <div className="button-container">
                <a href="#" 
                   onClick={(e) => {
                       if (!isLoading) {
                           e.preventDefault(); 
                           getAnalysis();
                       }
                   }} 
                   className={`analyze-button ${isLoading ? 'disabled' : ''}`}>
                    {isLoading ? <>Analysing<span className="loading-dots">{loadingDots}</span></> : <><img src="/sparkler.png" alt="Sparkles" />Analyise</>}
                </a>
            </div>
            {analysis && (
                <div className="analysis-container">
                    <Typewriter
                        options={{
                            strings: analysis,
                            autoStart: true,
                            loop: false,
                            delay: 50
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ReadinessAnalysis;
