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


export default function Home() {
  // State declarations
  const currentDate = new Date();
  const firstDayOfThisYear = new Date(new Date().getFullYear(), 0, 1);
  const sevenDaysAgo = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000));
  const [startDate, setStartDate] = useState(sevenDaysAgo);
  const [endDate, setEndDate] = useState(currentDate);
  const [isStravaAuthed, setIsStravaAuthed] = useState(false);
  const [isOuraAuthed, setIsOuraAuthed] = useState(false);
  const [stravaData, setStravaData] = useState<StravaActivity[]>([]);
  const { data: stravaActivities, isLoading: isStravaLoading } = useFetchStravaActivities(startDate, endDate);
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  const { processedData, totalDistance, totalElevationGain } = useProcessStravaData(stravaActivities, startDate, endDate);
  const { data: readinessData, loading: readinessLoading, error: readinessError } = useFetchOuraData(startDate, endDate);
  const [stravaAnalysisResult, setStravaAnalysisResult] = useState('');
  const [ouraAnalysisResult, setOuraAnalysisResult] = useState('');
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
    <div>
      <SideMenu />
      <Head>
        <title>My Health Data</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/style.css" />
      </Head>
      <div className="header">
        <h1>
          <FontAwesomeIcon icon={faHeartbeat} width="32" /> My Health Data
        </h1>
      </div>

      <Script src="https://kit.fontawesome.com/0d58ae3c8d.js" strategy="lazyOnload" crossOrigin="anonymous" />

      {(isStravaAuthed) || (isOuraAuthed) && (
      <div id="datePicker">
        <ReactDatePicker selected={startDate} onChange={(date: Date | null) => date && setStartDate(date)} dateFormat="dd MMMM yyyy" className="custom-datepicker" />
        <ReactDatePicker selected={endDate} onChange={(date: Date | null) => date && setEndDate(date)} dateFormat="dd MMMM yyyy" className="custom-datepicker" />
      </div>
      )}

      {/* Empty state message */}
      {!isStravaAuthed && !isOuraAuthed && (
        <div className="empty-state-container">
          <div className="empty-state-message-header">
            <p>My Health Data works when you connect to your exercise and health data.</p>
          </div>
          <div className="empty-state-message">
            <p>It only stores this in your browser, so it remains secure and private.
              Please authenticate with Strava and/or Oura in the menu at the top right to start.</p>
          </div>
        </div>
      )}
      {isStravaAuthed && stravaData && (
        <div>
          <NumberContainers
            totalDistance={totalDistance}
            totalElevationGain={totalElevationGain}
          />
          <div className="strava-analysis-container">
            <div className="strava-chart">
              <StravaChart
                processedData={processedData}
                isLoading={isStravaLoading}
              />
            </div>

            <div className="analysis-section">
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
      {isOuraAuthed && readinessData && (
        <div>
          <div className="strava-analysis-container">
            <div className="strava-chart">
              <ReadinessChart startDate={startDate} endDate={endDate} readinessData={readinessData} />
            </div>
            <div className="analysis-section">
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


          <div className="strava-analysis-container">
            <div className="strava-chart">
              <ActivityChart startDate={startDate} endDate={endDate} />
            </div>
            <div className="strava-chart">
              <SleepChart startDate={startDate} endDate={endDate} />
            </div>
          </div>
        </div>

      )}
      <div id="footer"><Footer /></div>
    </div>
  );

}
