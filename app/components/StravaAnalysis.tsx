import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Typewriter from 'typewriter-effect';
import { Activity } from '../types/activityTypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

interface StravaAnalysisProps {
    stravaData: Activity[];
}

const ChatGPTAnalysis: React.FC<StravaAnalysisProps> = ({ stravaData }) => {
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingDots, setLoadingDots] = useState('');

    // Define the analysis prompt
    const analysisPrompt = `Analyse the following Strava cycling data for an amatuer
    cyclist, and provide recommendations from the point of view of a cycling coach.
    Do not summarize the data itself, but provide informed recommendations for
    improving performance. Focus on aspects such as training intensity, volume, rest,
    and potential areas of improvement.
    The data includes a range of metrics for each activity like distance,
    elevation gain, max watts, average watts, and moving time. Keep the response very short.`;

    const getAnalysis = async () => {
        setIsLoading(true);
        try {
            // Update the API call to include the content and data
            const response = await axios.post('/api/chatgpt-analysis', { content: analysisPrompt, data: stravaData });
            
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
