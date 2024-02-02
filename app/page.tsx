'use client'

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeartbeat } from '@fortawesome/free-solid-svg-icons';
import useFetchStravaActivities from './components/useFetchStravaActivities';
import { StravaActivity } from '../app/types/StravaInterface';
import ActivityChart from './components/ActivityChart';
import SleepChart from './components/SleepChart';
import ReadinessChart from './components/ReadinessChart';
import HRVChart from './components/HRVChart';
import StravaAnalysis from './components/StravaAnalysis';
import Footer from './components/Footer';
import Script from 'next/script';
import SideMenu from './components/SideMenu';
import axios from 'axios';
import StravaChart from './components/StravaChart'; // Adjust the path as necessary
import useProcessStravaData from './components/useProcessStravaData'; // Adjust the path as necessary
import useFetchOuraData from './components/useFetchOuraData'; // Adjust the path as necessary
import ReadinessAnalysis from './components/ReadinessAnalysis';
import NumberContainers from './components/NumberContainers';
import useFetchHrvData from './components/useFetchHrvData'; // Adjust the path as necessary
import HRVAnalysis from './components/HRVAnalysis';


export default function Home() {
  // State declarations
  const currentDate = new Date();
  const sevenDaysAgo = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000));
  const [startDate, setStartDate] = useState(sevenDaysAgo);
  const [endDate, setEndDate] = useState(currentDate);
  const [isStravaAuthed, setIsStravaAuthed] = useState(false);
  const [isOuraAuthed, setIsOuraAuthed] = useState(false);
  const [stravaData, setStravaData] = useState<StravaActivity[]>([]);
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');

  // Use custom hooks for fetching data, which manage their own loading states
  // Assuming your custom hooks return { data, loading, error }
  const { data: stravaActivities, isLoading: isStravaLoading } = useFetchStravaActivities(startDate, endDate);
  const { data: readinessData, isLoading: isReadinessLoading } = useFetchOuraData(startDate, endDate);
  const { data: hrvData, isLoading: isHrvLoading } = useFetchHrvData(startDate, endDate);



  const { processedData, totalDistance, totalElevationGain } = useProcessStravaData(stravaActivities, startDate, endDate);
  const [stravaAnalysisResult, setStravaAnalysisResult] = useState('');
  const [ouraAnalysisResult, setOuraAnalysisResult] = useState('');
  const [hrvAnalysisResult, setHrvAnalysisResult] = useState('');
  const [isStravaAnalysisLoading, setIsStravaAnalysisLoading] = useState(false);
  const [isOuraAnalysisLoading, setIsOuraAnalysisLoading] = useState(false);
  const [stravaLoadingDots, setStravaLoadingDots] = useState('');
  const [ouraLoadingDots, setOuraLoadingDots] = useState('');




  const getCookie = (name: string): string | undefined => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookiePart = parts.pop();
      return cookiePart ? cookiePart.split(';').shift() : undefined;
    }
    return undefined;
  };

  const stravaAnalysisPrompt = `Analyse the following Strava cycling data for an amatuer
  cyclist, and provide recommendations from the point of view of a cycling coach.
  The data includes a range of metrics for each activity like distance,
  elevation gain, max watts, average watts, and moving time. Keep the response very short.`;

  const ouraAnalysisPrompt = `Analyse the following data from an Oura ring. These are
  Oura scores for HRV, resting heart rate and body temperature. They are not actual HRV,
  heart rate, and body temperature readings. Please use is like a professional exercise
  coach would use this type of information.  Keep the response very short.`;

  const hrvAnalysisPrompt = `Analyse the following HRV data and provide insights. The data includes
  average heart rate variability (HRV) readings over time. Please provide a concise and
  professional analysis.`;



  // Function for Strava Data Analysis
  const getStravaAnalysis = async () => {
    if (!isStravaAuthed) {
      console.error('Not authenticated for Strava.');
      return;
    }

    if (!Array.isArray(stravaActivities) || stravaActivities.length === 0) {
      console.error('Strava activities data is not available.');
      return;
    }

    setIsStravaAnalysisLoading(true);

    // Check if stravaActivities is an array and contains data
    if (!Array.isArray(stravaActivities) || stravaActivities.length === 0) {
      console.error('Strava activities data is null, undefined, or not an array');
      setIsStravaAnalysisLoading(false);
      return;
    }

    // Simplify the stravaActivities data
    const simplifiedStravaActivities = stravaActivities.map(activity => ({
      name: activity.name,
      distance: activity.distance,
      moving_time: activity.moving_time,
      elapsed_time: activity.elapsed_time,
      total_elevation_gain: activity.total_elevation_gain,
      type: activity.type,
      id: activity.id,
      start_date: activity.start_date,
      start_date_local: activity.start_date_local,
      timezone: activity.timezone,
      utc_offset: activity.utc_offset,
      average_speed: activity.average_speed,
      max_speed: activity.max_speed,
      average_cadence: activity.average_cadence,
      average_watts: activity.average_watts,
      max_watts: activity.max_watts,
      weighted_average_watts: activity.weighted_average_watts,
      kilojoules: activity.kilojoules,
      average_heartrate: activity.average_heartrate,
      max_heartrate: activity.max_heartrate
    }));

    try {
      // Make the API call
      const response = await axios.post('/api/chatgpt-analysis', {
        content: stravaAnalysisPrompt,
        data: simplifiedStravaActivities
      });

      // Handle the response
      if (response.data.choices && response.data.choices.length > 0) {
        setStravaAnalysisResult(response.data.choices[0].message.content);
      } else {
        setStravaAnalysisResult('No analysis available.');
      }
    } catch (error) {
      console.error('Error in getStravaAnalysis:', error);
      setStravaAnalysisResult('Error fetching analysis.');
    }

    // Reset loading state
    setIsStravaAnalysisLoading(false);
  };


  // Function for Oura Readiness Data Analysis
  const getOuraAnalysis = async () => {
    if (!isOuraAuthed) {
      console.error('Not authenticated for Oura.');
      return;
    }

    if (!readinessData) {
      console.error('Readiness data is not available.');
      return;
    }

    setIsOuraAnalysisLoading(true);

    // Assuming readinessData is the data used for Oura analysis
    if (!readinessData) {
      console.error('Readiness data is null or undefined');
      setIsOuraAnalysisLoading(false);
      return;
    }
    try {
      const response = await axios.post('/api/chatgpt-analysis', { content: ouraAnalysisPrompt, data: readinessData });
      // Handle the response for Oura
      if (response.data.choices && response.data.choices.length > 0) {
        setOuraAnalysisResult(response.data.choices[0].message.content);
      } else {
        setOuraAnalysisResult('No analysis available.');
      }
    } catch (error) {
      console.error('Error in getOuraAnalysis:', error);
      setOuraAnalysisResult('Error fetching analysis.');
    }
    setIsOuraAnalysisLoading(false);
  };

  const getHrvAnalysis = async () => {
    if (!isOuraAuthed) {
      console.error('Not authenticated for Oura.');
      return;
    }

    if (!hrvData) {
      console.error('HRV data is not available.');
      return;
    }

    setIsOuraAnalysisLoading(true); // Reuse the Oura loading state or create a new one for HRV

    try {
      const response = await axios.post('/api/chatgpt-analysis', {
        content: hrvAnalysisPrompt,
        data: hrvData
      });

      if (response.data.choices && response.data.choices.length > 0) {
        setHrvAnalysisResult(response.data.choices[0].message.content); // You may want to use a separate state for HRV analysis result
      } else {
        setHrvAnalysisResult('No analysis available.');
      }
    } catch (error) {
      console.error('Error in getHrvAnalysis:', error);
      setHrvAnalysisResult('Error fetching analysis.');
    }

    setIsOuraAnalysisLoading(false); // Or set the HRV loading state to false
  };


  useEffect(() => {
    let interval: number | undefined;
    if (isStravaAnalysisLoading) {
      interval = window.setInterval(() => {
        setStravaLoadingDots(dots => dots.length < 3 ? dots + '.' : '');
      }, 500);
    }
    return () => {
      if (interval !== undefined) clearInterval(interval);
    };
  }, [isStravaAnalysisLoading]);


  useEffect(() => {
    let interval: number | undefined;
    if (isOuraAnalysisLoading) {
      interval = window.setInterval(() => {
        setOuraLoadingDots(dots => dots.length < 3 ? dots + '.' : '');
      }, 500);
    }
    return () => {
      if (interval !== undefined) clearInterval(interval);
    };
  }, [isOuraAnalysisLoading]);


  useEffect(() => {
    // Fetch Strava authentication status
    fetch('/api/stravaAuthStatus')
      .then(response => response.json())
      .then(data => {
        setIsStravaAuthed(data.isStravaAuthed);
      })
      .catch(error => {
        console.error('Error fetching Strava auth status:', error);
      });

    // Fetch Oura authentication status
    fetch('/api/ouraAuthStatus')
      .then(response => response.json())
      .then(data => {
        setIsOuraAuthed(data.isOuraAuthed);
      })
      .catch(error => {
        console.error('Error fetching Oura auth status:', error);
      });
  }, []);



  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SideMenu />
      <Head>
        <title>My Health Data</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/style.css" />
      </Head>
      <div className="flex flex-col min-h-screen">
      <div className="bg-white text-center py-5 sticky top-0 z-50 shadow-md">
        <h1>
          <FontAwesomeIcon icon={faHeartbeat} width="32" /> My Health Data
        </h1>
      </div>

      <Script src="https://kit.fontawesome.com/0d58ae3c8d.js" strategy="lazyOnload" crossOrigin="anonymous" />

      {(isStravaAuthed || isOuraAuthed) && (
        <div id="datePicker" className="flex justify-start bg-white border border-gray-300 rounded-xl w-96 ml-5 mt-5">
          <ReactDatePicker selected={startDate} onChange={(date: Date | null) => date && setStartDate(date)} dateFormat="dd MMMM yyyy" className="custom-datepicker" />
          <ReactDatePicker selected={endDate} onChange={(date: Date | null) => date && setEndDate(date)} dateFormat="dd MMMM yyyy" className="custom-datepicker" />
        </div>
      )}

      {/* Empty state message */}
      {!isStravaAuthed && !isOuraAuthed && (
          <main className="flex-1 pt-24 pb-16">
        <div className="mx-auto flex flex-col justify-center items-center h-[20vh] w-[60vw] text-center">
          <div className="empty-state-message-header text-[1.8em] font-light">
            <p>My Health Data works when you connect to your exercise and health data.</p>
          </div>
          <div className="empty-state-message text-[1.4em] font-light">
            <p>It only stores this in your browser, so it remains secure and private.
              To get started, please connect Strava or Oura in the menu at the top right.</p>
          </div>
        </div>
        </main>
      )}
      {isStravaAuthed && stravaData && (
        <div>
          <NumberContainers
            totalDistance={totalDistance}
            totalElevationGain={totalElevationGain}
          />
          <h2 className="text-2xl font-semibold mb-2 px-5">Strava Overview</h2>

          <div className="flex flex-wrap -m-4 px-2.5 py-2.5">
            <div className="flex-1 m-5 border border-gray-200 rounded-lg max-h-[400px] overflow-hidden">
              <StravaChart
                processedData={processedData}
                isLoading={isStravaLoading}
              />
            </div>

            <div className="p-4 w-full md:w-1/2">
              <div className="button-container">
                <a href="#"
                  onClick={(e) => {
                    if (!isStravaAnalysisLoading) {
                      e.preventDefault();
                      getStravaAnalysis();
                    }
                  }}
                  className={`analyze-button ${isStravaAnalysisLoading ? 'disabled' : ''}`}>
                  {isStravaAnalysisLoading ? <>Analysing<span className="loading-dots">{stravaLoadingDots}</span></> : <><img src="/sparkler.png" alt="Sparkles" />Analyse</>}
                </a>
              </div>
              <StravaAnalysis
                stravaData={stravaActivities}
                analysis={stravaAnalysisResult}
                isLoading={isStravaAnalysisLoading}
                loadingDots={loadingDots}
              />
            </div>
          </div>
        </div>
      )}
      {isOuraAuthed && readinessData && hrvData && (
        <div>
          <h2 className="text-2xl font-semibold mb-2 px-5">Oura Readiness</h2>
          <div className="flex flex-wrap -m-4 px-2.5 py-2.5">
            <div className="flex-1 m-5 border border-gray-200 rounded-lg max-h-[400px] overflow-hidden">
              <ReadinessChart readinessData={readinessData} isLoading={isReadinessLoading} startDate={startDate} endDate={endDate} />
            </div>
            <div className="p-4 w-full md:w-1/2">
              <div className="button-container">
                <a href="#" onClick={(e) => { if (!isOuraAnalysisLoading) { e.preventDefault(); getOuraAnalysis(); } }}
                  className={`analyze-button ${isOuraAnalysisLoading ? 'disabled' : ''}`}>
                  {isOuraAnalysisLoading ? <>Analysing<span className="loading-dots">{ouraLoadingDots}</span></> : <><img src="/sparkler.png" alt="Sparkles" />Analyse</>}
                </a>
              </div>
              <ReadinessAnalysis
                readinessData={readinessData}
                analysis={ouraAnalysisResult}
                isLoading={isOuraAnalysisLoading}
                loadingDots={loadingDots}
              />
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-2 px-5">Oura HRV</h2>

          <div className="flex flex-wrap -m-4 px-2.5 py-2.5">
            <div className="flex-1 m-5 border border-gray-200 rounded-lg max-h-[400px] overflow-hidden">
              <HRVChart hrvData={hrvData} isLoading={isHrvLoading} />
            </div>
            <div className="p-4 w-full md:w-1/2">
              <div className="button-container">
                <a href="#" onClick={(e) => { if (!isOuraAnalysisLoading) { e.preventDefault(); getHrvAnalysis(); } }}
                  className={`analyze-button ${isOuraAnalysisLoading ? 'disabled' : ''}`}>
                  {isOuraAnalysisLoading ? <>Analysing<span className="loading-dots">{ouraLoadingDots}</span></> : <><img src="/sparkler.png" alt="Sparkles" />Analyse</>}
                </a>
              </div>
              <div className="analysis-result">
                <HRVAnalysis
                  hrvData={hrvData}
                  analysis={hrvAnalysisResult}
                  isLoading={isOuraAnalysisLoading}
                  loadingDots={loadingDots}
                />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-2 px-5">Oura Activity & Sleep</h2>

          <div className="flex flex-wrap -m-4 px-2.5">
            <div className="w-full md:w-1/2 p-4">
              <div className="m-1 border border-gray-200 rounded-lg max-h-[400px] overflow-hidden">
                <ActivityChart startDate={startDate} endDate={endDate} />
              </div>
            </div>
            <div className="w-full md:w-1/2 p-4">
              <div className="m-1 border border-gray-200 rounded-lg max-h-[400px] overflow-hidden">
                <SleepChart startDate={startDate} endDate={endDate} />
              </div>
            </div>
          </div>

        </div>
      )}
      <div id="footer"><Footer /></div>
    </div>
    </div>
  );

}
