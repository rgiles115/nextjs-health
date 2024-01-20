import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Typewriter from 'typewriter-effect';
import { Activity } from '../types/activityTypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

interface ChatGPTAnalysisProps {
    cyclingData: Activity[];
}

const ChatGPTAnalysis: React.FC<ChatGPTAnalysisProps> = ({ cyclingData }) => {
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingDots, setLoadingDots] = useState('');

    // Define the analysis prompt
    const analysisPrompt = `Analyse the following Strava cycling data from a professional cycling coach's perspective. Do not summarize. Provide detailed and informed recommendations for improving performance, focusing on aspects such as training intensity, volume, rest, and potential areas of improvement. The data includes daily metrics like distance covered, total elevation gain, average watts, and moving time. Keep the response very short.`;

    const getAnalysis = async () => {
        setIsLoading(true);
        try {
            // Update the API call to include the content and data
            const response = await axios.post('/api/chatgpt-analysis', { content: analysisPrompt, data: cyclingData });
            
            // Handle the response
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
                    {isLoading ? <>Analysing<span className="loading-dots">{loadingDots}</span></> : <><img src="/sparkler.png" alt="Sparkles" />Analyse</>}
                </a>
            </div>
            {analysis && (
                <div>
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

export default ChatGPTAnalysis;
