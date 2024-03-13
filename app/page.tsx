// Directive to optimize for client-side rendering only in Next.js
'use client'

// Importing necessary React and Next.js functionalities
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import axios from 'axios';

// Importing third-party components and styles
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeartbeat } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom hooks for data fetching
import useFetchStravaActivities from './hooks/useFetchStravaActivities';
import useFetchOuraData from './hooks/useFetchOuraData';
import useFetchHrvData from './hooks/useFetchHrvData';
import useProcessStravaData from './hooks/useProcessStravaData';
import useFetchEnhancedTags from './hooks/useFetchEnhancedTags';
import useProcessStravaAndHRVData from './hooks/useProcessStravaAndHRVData';

// Importing custom components
import ActivityChart from './components/ActivityChart';
import SleepChart from './components/SleepChart';
import ReadinessChart from './components/ReadinessChart';
import StravaAnalysis from './components/StravaAnalysis';
import Footer from './components/Footer';
import SideMenu from './components/SideMenu';
import StravaChart from './components/StravaChart';
import ReadinessAnalysis from './components/ReadinessAnalysis';
import NumberContainers from './components/NumberContainers';
import StravaSkeletonLoader from './components/StravaSkeletonLoader';
import OuraSkeletonLoader from './components/OuraSkeletonLoader';

// Type definitions for the data used in the component
import { StravaActivity, AthleteProfile } from '../app/types/StravaInterface';

export default function Home() {
  // State variables for managing date range, authentication status, and data
  const currentDate = new Date();
  const sevenDaysAgo = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000));
  const [startDate, setStartDate] = useState(sevenDaysAgo);
  const [endDate, setEndDate] = useState(currentDate);
  const [isStravaAuthed, setIsStravaAuthed] = useState<boolean | undefined>(undefined);
  const [isOuraAuthed, setIsOuraAuthed] = useState<boolean | undefined>(undefined);
  const [isAuthCheckLoading, setIsAuthCheckLoading] = useState(true);

  // State for managing fetched and processed data
  const [stravaData, setStravaData] = useState<StravaActivity[]>([]);
  const [analysis, setAnalysis] = useState('');
  const [stravaAnalysisError, setStravaAnalysisError] = useState<string | null>(null);
  const [ouraAnalysisError, setOuraAnalysisError] = useState<string | null>(null);
  const [athleteProfile, setAthleteProfile] = useState<AthleteProfile | null>(null);

  // Loading states for different asynchronous operations
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');

  // Using custom hooks for fetching data from APIs
  const { activities: stravaActivities, ytdRideTotals, isLoading: isStravaLoading, error: stravaError } = useFetchStravaActivities(startDate, endDate, isStravaAuthed);
  const { data: readinessData, isLoading: isReadinessLoading, error: ouraError } = useFetchOuraData(startDate, endDate, isOuraAuthed || false);
  const { data: transformedHrvData, isLoading: isHrvLoading, error: hrvError } = useFetchHrvData(startDate, endDate, isOuraAuthed || false);
  const { tagsData: tagsData, isLoading: isLoadingTags, error: errorTags } = useFetchEnhancedTags(startDate, endDate, isOuraAuthed || false);

  // Processing Strava data with a custom hook
  const { processedData, totalDistance, totalElevationGain, averageWatts } = useProcessStravaData(stravaActivities, startDate, endDate);

  // States for analysis results
  const [stravaAnalysisResult, setStravaAnalysisResult] = useState('');
  const [ouraAnalysisResult, setOuraAnalysisResult] = useState('');
  const [hrvAnalysisResult, setHrvAnalysisResult] = useState(''); // Not used at the moment

  // Loading states for analysis operations
  const [isStravaAnalysisLoading, setIsStravaAnalysisLoading] = useState(false);
  const [isOuraAnalysisLoading, setIsOuraAnalysisLoading] = useState(false);

  // Animation states for loading indicators
  const [stravaLoadingDots, setStravaLoadingDots] = useState('');
  const [ouraLoadingDots, setOuraLoadingDots] = useState('');

  const processedResults = useProcessStravaAndHRVData(processedData, transformedHrvData, tagsData);
  const errors = [stravaError, ouraError, hrvError].filter(Boolean); // Filter out null values


  // Function to get a cookie value by name
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

  // Effect hook to check authentication status on component mount
  useEffect(() => {
    // Define asynchronous function to perform auth checks
    const checkAuthStatuses = async () => {
      try {
        // Fetch Strava authentication status
        const stravaResponse = await fetch('/api/stravaAuthStatus');
        const stravaData = await stravaResponse.json();
        setIsStravaAuthed(stravaData.isStravaAuthed);
        if (stravaData.isStravaAuthed && stravaData.athlete) {
          setAthleteProfile(stravaData.athlete);
        }

        // Fetch Oura authentication status
        const ouraResponse = await fetch('/api/ouraAuthStatus');
        const ouraData = await ouraResponse.json();
        setIsOuraAuthed(ouraData.isOuraAuthed);
        console.log("Oura Auth Status:", ouraData.isOuraAuthed);
      } catch (error) {
        console.error('Error fetching authentication statuses:', error);
        // Consider setting auth statuses to false or handling the error appropriately
      } finally {
        setIsAuthCheckLoading(false); // Indicate that auth checks are completed
      }
    };

    checkAuthStatuses();
  }, []);

  useEffect(() => {
    // Display each error in a separate toast message
    errors.forEach(error => {
      toast.error(`Failed to load data: ${error}`);
    });
  }, [errors]); // Depend on errors to re-trigger when they change


  // Function for Strava Data Analysis
  const getStravaAnalysis = async () => {
    // Clear any previous error right at the start
    setStravaAnalysisError(null);

    if (!isStravaAuthed) {
      // console.error('Not authenticated for Strava!');
      // Optionally, update error state here too
      // setStravaAnalysisError('Not authenticated for Strava!');
      return;
    }

    if (!Array.isArray(stravaActivities) || stravaActivities.length === 0) {
      console.error('Strava activities data is not available.');
      setStravaAnalysisError('Strava activities data is not available.');
      return;
    }

    setIsStravaAnalysisLoading(true);

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
    // console.log('Strava:', JSON.stringify(simplifiedStravaActivities));
    try {
      const response = await axios.post('/api/chatgpt-analysis', {
        content: stravaAnalysisPrompt,
        data: simplifiedStravaActivities
      });

      if (response.data.choices && response.data.choices.length > 0) {
        setStravaAnalysisResult(response.data.choices[0].message.content);
      } else {
        setStravaAnalysisResult('No analysis available.');
        // Optionally, set a more specific message if no data is returned
        setStravaAnalysisError('No analysis could be generated from the data.');
      }
    } catch (error: unknown) {
      let errorMessage = 'Error fetching analysis.';
      if (axios.isAxiosError(error)) {
        // This is an Axios Error, check for response and then for the specific error message
        if (error.response && error.response.data && 'message' in error.response.data) {
          errorMessage = error.response.data.message;
        } else if (error.response && error.response.statusText) {
          errorMessage = error.response.statusText;
        }
      } else if (error instanceof Error) {
        // This is a generic JavaScript Error
        console.error('Error in getStravaAnalysis:', error.message);
        errorMessage = error.message;
      }
      setStravaAnalysisError(errorMessage);
    }


    setIsStravaAnalysisLoading(false);
  };

  // Function for Oura Readiness Data Analysis
  const getOuraAnalysis = async () => {
    // Clear any previous error at the start
    setOuraAnalysisError(null);

    if (!isOuraAuthed) {
      console.error('Not authenticated for Oura.');
      setOuraAnalysisError('Not authenticated for Oura.');
      return;
    }

    if (!readinessData) {
      console.error('Readiness data is not available.');
      setOuraAnalysisError('Readiness data is not available.');
      return;
    }

    setIsOuraAnalysisLoading(true);

    try {
      const response = await axios.post('/api/chatgpt-analysis', {
        content: hrvAnalysisPrompt,
        data: transformedHrvData
      });

      if (response.data.choices && response.data.choices.length > 0) {
        setOuraAnalysisResult(response.data.choices[0].message.content);
      } else {
        setOuraAnalysisResult('No analysis available.');
        // Optionally, if no data is returned, you might consider setting a specific error message
        setOuraAnalysisError('No analysis could be generated from the data.');
      }
    } catch (error) {
      console.error('Error in getOuraAnalysis:', error);
      let errorMessage = 'Error fetching analysis.';
      // Handle the case if error is an AxiosError for more specific error messaging
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || 'Error fetching analysis.';
      }
      setOuraAnalysisError(errorMessage);
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

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <SideMenu />
      <Head>
        <title>My Health Data</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/style.css" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <div className="bg-white text-black text-center py-5 sticky top-0 z-50 shadow-md">
          <h1>
            <FontAwesomeIcon icon={faHeartbeat} width="32" /> My Health Data
          </h1>
        </div>

        < Script src="https://kit.fontawesome.com/0d58ae3c8d.js" strategy="lazyOnload" crossOrigin="anonymous" />

        {(isAuthCheckLoading) && (

          <div className="flex justify-center items-center min-h-screen">
            <div>Loading...</div>
          </div>
        )}

        {/* Empty state message */}
        {!isStravaAuthed && !isOuraAuthed && (
          <main className="flex-1 pt-48 pb-16 md:pt-28">
            <div className="mx-auto flex flex-col justify-center items-center h-[20vh] w-[60vw] text-center">
              <div className="empty-state-message-header text-[1.8em] font-light">
                <p>My Health Data works when you connect to your exercise and health data.</p>
              </div>
              <div className="empty-state-message text-[1.4em] font-light">
                <p>It only stores this in your browser, so it remains secure and private. To get started, please connect Strava or Oura in the menu at the top right.</p>
              </div>
            </div>
          </main>
        )}

        {(isStravaAuthed || isOuraAuthed) && (
          <div id="datePicker" className="flex justify-start bg-white border border-gray-300 bg-white rounded-xl w-80 ml-5 mt-5 mb-5">
            <ReactDatePicker selected={startDate} onChange={(date: Date | null) => date && setStartDate(date)} dateFormat="dd MMM yyyy" className="custom-datepicker" />
            <ReactDatePicker selected={endDate} onChange={(date: Date | null) => date && setEndDate(date)} dateFormat="dd MMM yyyy" className="custom-datepicker" />
          </div>
        )}

        {isStravaAuthed && isStravaLoading && (
          <StravaSkeletonLoader />
        )}

        {isStravaAuthed && !isStravaLoading && stravaData && (
          <div>
            {athleteProfile && ytdRideTotals && (
              <div className="m-5 p-4 border border-gray-200 rounded-lg bg-white">
                <div className="flex justify-start items-center mt-0">
                  <img src={athleteProfile.profile_medium} alt="Profile" className="h-16 w-16 rounded-full border-2 border-gray-300" />
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold">{athleteProfile.firstname} {athleteProfile.lastname}</h2>
                    <div>
                      {/* Displaying YTD Totals */}
                      <p><span className="text-gray-600">Distance:</span> {((ytdRideTotals.distance / 1000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))} km</p>
                      <p><span className="text-gray-600">Elevation Gain:</span> {ytdRideTotals.elevation_gain.toLocaleString()} meters</p>
                      {/* Displaying Year-End Estimations */}
                      {(() => {
                        const currentDate = new Date();
                        const currentYear = currentDate.getFullYear(); // Get the current year
                        const startOfYear = new Date(currentYear, 0, 1);
                        const endOfYear = new Date(currentYear, 11, 31);
                        const daysElapsed = (currentDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
                        const totalDaysInYear = (endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24) + 1; // +1 to include the last day

                        const dailyDistanceAvg = ytdRideTotals.distance / daysElapsed;
                        const dailyElevationAvg = ytdRideTotals.elevation_gain / daysElapsed;

                        const estimatedDistanceEndOfYear = Math.round((dailyDistanceAvg * totalDaysInYear) / 1000); // Convert to km and round
                        const estimatedElevationEndOfYear = Math.round(dailyElevationAvg * totalDaysInYear); // Round to nearest whole number

                        return (
                          <>
                            <p><span className="text-gray-600">Estimated Distance by {currentYear}:</span> {estimatedDistanceEndOfYear.toLocaleString()} km</p>
                            <p><span className="text-gray-600">Estimated Elevation Gain by {currentYear}:</span> {estimatedElevationEndOfYear.toLocaleString()} meters</p>
                          </>
                        );
                      })()}

                    </div>
                  </div>
                </div>
              </div>
            )}
            <NumberContainers
              totalDistance={totalDistance}
              totalElevationGain={totalElevationGain}
            />
            <h2 className="text-2xl font-semibold mb-2 px-5">Strava Overview</h2>

            <div className="flex flex-wrap -m-4 px-2.5 py-2.5">
              <div className="flex-1 m-5 border border-gray-200 rounded-lg bg-white max-h-[400px] overflow-hidden">
                <StravaChart
                  processedData={processedResults}
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
                {stravaAnalysisError && <div className="text-red-500">{stravaAnalysisError}</div>}
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
        {isOuraAuthed && isReadinessLoading && (
          <OuraSkeletonLoader />
        )}
        {isOuraAuthed && !isReadinessLoading && readinessData && (
          <div>
            <h2 className="text-2xl font-semibold mb-2 px-5">Oura Readiness</h2>
            <div className="flex flex-wrap -m-4 px-2.5 py-2.5">
              <div className="flex-1 m-5 border border-gray-200 rounded-lg bg-white max-h-[400px] overflow-hidden">
                <ReadinessChart readinessData={readinessData} isLoading={isReadinessLoading} startDate={startDate} endDate={endDate} />
              </div>
              <div className="p-4 w-full md:w-1/2">
                <div className="button-container">
                  <a href="#" onClick={(e) => { if (!isOuraAnalysisLoading) { e.preventDefault(); getOuraAnalysis(); } }}
                    className={`analyze-button ${isOuraAnalysisLoading ? 'disabled' : ''}`}>
                    {isOuraAnalysisLoading ? <>Analysing<span className="loading-dots">{ouraLoadingDots}</span></> : <><img src="/sparkler.png" alt="Sparkles" />Analyse</>}
                  </a>
                </div>
                {ouraAnalysisError && <div className="text-red-500">{ouraAnalysisError}</div>}
                <ReadinessAnalysis
                  readinessData={readinessData}
                  analysis={ouraAnalysisResult}
                  isLoading={isOuraAnalysisLoading}
                  loadingDots={loadingDots}
                />
              </div>
            </div>


            <h2 className="text-2xl font-semibold mb-2 px-5">Oura Activity & Sleep</h2>

            <div className="flex flex-wrap -m-4 px-2.5">
              <div className="w-full md:w-1/2 p-4">
                <div className="m-1 border border-gray-200 rounded-lg bg-white max-h-[400px] overflow-hidden">
                  <ActivityChart startDate={startDate} endDate={endDate} />
                </div>
              </div>
              <div className="w-full md:w-1/2 p-4">
                <div className="m-1 border border-gray-200 rounded-lg bg-white max-h-[400px] overflow-hidden">
                  <SleepChart startDate={startDate} endDate={endDate} />
                </div>
              </div>
            </div>

          </div>
        )}
        <ToastContainer
          position="bottom-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <div id="footer"><Footer /></div>
      </div>

    </div>
  );

}
