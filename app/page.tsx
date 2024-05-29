'use client'

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import axios from 'axios';

import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeartbeat } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import useFetchStravaActivities from './hooks/useFetchStravaActivities';
import useFetchOuraData from './hooks/useFetchOuraData';
import useFetchHrvData from './hooks/useFetchHrvData';
import useFetchReadinessData from './hooks/useFetchReadinessData';
import useProcessStravaData from './hooks/useProcessStravaData';
import useFetchEnhancedTags from './hooks/useFetchEnhancedTags';
import useProcessStravaAndHRVData from './hooks/useProcessStravaAndHRVData';

import SleepDataChartComponent from './components/SleepDataChartComponent';
import ReadinessChart from './components/ReadinessChart';
import StravaAnalysis from './components/StravaAnalysis';
import Footer from './components/Footer';
import SideMenu from './components/SideMenu';
import StravaChart from './components/StravaChart';
import NumberContainers from './components/NumberContainers';
import StravaSkeletonLoader from './components/StravaSkeletonLoader';
import OuraSkeletonLoader from './components/OuraSkeletonLoader';

import { checkAuthStatuses } from '../app/utils/authCheck';
import { StravaActivity, AthleteProfile } from '../app/types/StravaInterface';

type CheckAuthStatusesParams = {
  setIsStravaAuthed: React.Dispatch<React.SetStateAction<boolean>>;
  setIsOuraAuthed: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAuthCheckLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setAthleteProfile: React.Dispatch<React.SetStateAction<AthleteProfile | null>>;
};

export default function Home() {
  const currentDate = new Date();
  const sevenDaysAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [startDate, setStartDate] = useState<Date>(sevenDaysAgo);
  const [endDate, setEndDate] = useState<Date>(currentDate);
  const [isStravaAuthed, setIsStravaAuthed] = useState<boolean>(false);
  const [isOuraAuthed, setIsOuraAuthed] = useState<boolean>(false);
  const [isAuthCheckLoading, setIsAuthCheckLoading] = useState<boolean>(true);

  const [stravaData, setStravaData] = useState<StravaActivity[] | null>(null);
  const [stravaAnalysisError, setStravaAnalysisError] = useState<string | null>(null);
  const [athleteProfile, setAthleteProfile] = useState<AthleteProfile | null>(null);

  const [loadingDots, setLoadingDots] = useState<string>('');

  const { activities: stravaActivities, ytdRideTotals, isLoading: isStravaLoading, error: stravaError } = useFetchStravaActivities(startDate, endDate, isStravaAuthed);
  const { data: readinessData, isLoading: isReadinessLoading, error: ouraError } = useFetchOuraData(startDate, endDate, isOuraAuthed);
  const { data: transformedHrvData, isLoading: isHrvLoading, error: hrvError } = useFetchHrvData(startDate, endDate, isOuraAuthed);
  const { data: detailedReadinessData, isLoading: isDetailedReadinessLoading, error: readinessError } = useFetchReadinessData(startDate, endDate, isOuraAuthed);
  const { tagsData, isLoading: isLoadingTags, error: errorTags } = useFetchEnhancedTags(startDate, endDate, isOuraAuthed);
  const { processedData, totalDistance, totalElevationGain, averageWatts } = useProcessStravaData(stravaActivities || [], startDate, endDate);
  const processedResults = useProcessStravaAndHRVData(processedData, transformedHrvData || [], tagsData || []);

  const [stravaAnalysisResult, setStravaAnalysisResult] = useState<string>('');

  const [isStravaAnalysisLoading, setIsStravaAnalysisLoading] = useState<boolean>(false);
  const [isOuraAnalysisLoading, setIsOuraAnalysisLoading] = useState<boolean>(false);

  const [stravaLoadingDots, setStravaLoadingDots] = useState<string>('');
  const [ouraLoadingDots, setOuraLoadingDots] = useState<string>('');

  const errors = [stravaError, ouraError, hrvError].filter(Boolean);

  const getCookie = (name: string): string | undefined => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookiePart = parts.pop();
      return cookiePart ? cookiePart.split(';').shift() : undefined;
    }
    return undefined;
  };

  const stravaAnalysisPrompt = `Analyze the following Strava cycling data for an amateur cyclist, and provide recommendations from the point of view of a cycling coach. The data includes a range of metrics for each activity like distance, elevation gain, max watts, average watts, and moving time. Keep the response very short.`;

  const stravaAndOuraAnalysisPrompt = `Analyze the combined dataset from Strava and Oura for an amateur athlete, and provide integrated insights and recommendations from the perspective of a professional coach. Consider metrics from cycling activities, sleep, HRV, and readiness. Keep the response very short.`;

  useEffect(() => {
    const params: CheckAuthStatusesParams = {
      setIsStravaAuthed,
      setIsOuraAuthed,
      setIsAuthCheckLoading,
      setAthleteProfile,
    };
    checkAuthStatuses(params);
  }, []);

  useEffect(() => {
    const stravaCookie = getCookie('strava');
    if (stravaCookie) {
      try {
        const athleteData = JSON.parse(decodeURIComponent(stravaCookie));
        setAthleteProfile(athleteData);
      } catch (error) {
        console.error('Error parsing strava cookie:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (errors.length > 0) {
      errors.forEach(error => {
        toast.error(`Failed to load data: ${error}`);
      });
    }
  }, [errors]);

  useEffect(() => {
    console.log('isStravaAuthed:', isStravaAuthed);
    console.log('isStravaLoading:', isStravaLoading);
    console.log('stravaActivities:', stravaActivities);
    console.log('athleteProfile:', athleteProfile);
    console.log('ytdRideTotals:', ytdRideTotals);
  }, [isStravaAuthed, isStravaLoading, stravaActivities, athleteProfile, ytdRideTotals]);

  const getCombinedDataAnalyse = async () => {
    console.log('getCombinedDataAnalyse called');
    console.log('Before Analysis - isStravaAuthed:', isStravaAuthed);
    console.log('Before Analysis - isStravaLoading:', isStravaLoading);
    console.log('Before Analysis - stravaActivities:', stravaActivities);
    console.log('Before Analysis - athleteProfile:', athleteProfile);
    console.log('Before Analysis - ytdRideTotals:', ytdRideTotals);

    const hasOuraData = processedResults.some(entry =>
      (entry.averageSleepHRV !== undefined && entry.averageSleepHRV > 0) ||
      (entry.averageSleepBreath !== undefined && entry.averageSleepBreath > 0) ||
      (entry.averageSleepHeartRate !== undefined && entry.averageSleepHeartRate > 0) ||
      (entry.lowestSleepHeartRate !== undefined && entry.lowestSleepHeartRate > 0) ||
      (entry.totalSleepDuration !== undefined && entry.totalSleepDuration > 0)
    );

    const prompt = hasOuraData ? stravaAndOuraAnalysisPrompt : stravaAnalysisPrompt;

    setIsStravaAnalysisLoading(true);
    setStravaAnalysisError(null);
    try {
      const response = await axios.post('/api/chatgpt-analysis', {
        content: prompt,
        data: processedResults
      });
      if (response.data.choices && response.data.choices.length > 0) {
        setStravaAnalysisResult(response.data.choices[0].message.content);
      } else {
        setStravaAnalysisResult('No analysis available.');
        setStravaAnalysisError('No analysis could be generated from the data.');
      }
    } catch (error) {
      console.error('Error in analyzeCombinedData:', error);
      setStravaAnalysisError('Error fetching analysis.');
    } finally {
      console.log('After Analysis - isStravaAuthed:', isStravaAuthed);
      console.log('After Analysis - isStravaLoading:', isStravaLoading);
      console.log('After Analysis - stravaActivities:', stravaActivities);
      console.log('After Analysis - athleteProfile:', athleteProfile);
      console.log('After Analysis - ytdRideTotals:', ytdRideTotals);
      setIsStravaAnalysisLoading(false);
    }
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
    <div className="bg-blue-gradient min-h-screen flex flex-col">
      <SideMenu />
      <Head>
        <title>My Health Data</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/style.css" />
        <meta name="theme-color" content="#f0faff" />
      </Head>

      <div className="flex flex-col min-h-screen">
        <div className="bg-blue-gradient text-black text-center py-5 sticky top-0 z-50 border-b border-gray-300">
          <h1>
            <FontAwesomeIcon icon={faHeartbeat} width="32" /> My Health Data
          </h1>
        </div>

        <Script src="https://kit.fontawesome.com/0d58ae3c8d.js" strategy="lazyOnload" crossOrigin="anonymous" />

        {isAuthCheckLoading && (
          <div className="flex justify-center items-center min-h-screen">
            <div>Loading...</div>
          </div>
        )}

        {!isAuthCheckLoading && !isStravaAuthed && !isOuraAuthed && (
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

        {isStravaAuthed && isStravaLoading && <StravaSkeletonLoader />}

        {isStravaAuthed && !isStravaLoading && stravaActivities && athleteProfile && ytdRideTotals && (
          <div>
            <div className="m-5 p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex justify-start items-center mt-0">
                <img src={athleteProfile.profile} alt="Profile" className="h-32 w-32 rounded-full border-2 border-gray-300" />
                <div className="ml-4">
                  <h2 className="text-xl font-semibold">{athleteProfile.firstname} {athleteProfile.lastname}</h2>
                  <div>
                    <p><span className="font-light">Distance:</span> {((ytdRideTotals.distance / 1000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))} km</p>
                    <p><span className="font-light">Elevation Gain:</span> {ytdRideTotals.elevation_gain.toLocaleString()} meters</p>
                    {(() => {
                      const currentDate = new Date();
                      const currentYear = currentDate.getFullYear();
                      const startOfYear = new Date(currentYear, 0, 1);
                      const endOfYear = new Date(currentYear, 11, 31);
                      const daysElapsed = (currentDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
                      const totalDaysInYear = (endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24) + 1;

                      const dailyDistanceAvg = ytdRideTotals.distance / daysElapsed;
                      const dailyElevationAvg = ytdRideTotals.elevation_gain / daysElapsed;

                      const estimatedDistanceEndOfYear = Math.round((dailyDistanceAvg * totalDaysInYear) / 1000);
                      const estimatedElevationEndOfYear = Math.round(dailyElevationAvg * totalDaysInYear);

                      return (
                        <>
                          <p>
                            <span className="font-light">Distance by {currentYear}:</span>
                            {estimatedDistanceEndOfYear.toLocaleString()} km
                          </p>
                          <p>
                            <span className="font-light">Elevation by {currentYear}:</span>
                            {estimatedElevationEndOfYear.toLocaleString()} meters
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <NumberContainers
              totalDistance={totalDistance}
              totalElevationGain={totalElevationGain}
            />
            <div className="flex flex-wrap -m-4 px-2.5">
              <div className="w-full md:w-1/2 p-4">
                <div className="flex-1 m-2 border border-gray-200 rounded-lg bg-white overflow-hidden pb-8">
                  <h2 className="text-2xl font-semibold mt-4 mb-2 px-12">Strava Overview</h2>
                  <StravaChart
                    processedData={processedResults}
                    isLoading={isStravaLoading}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
              </div>

              <div className="p-10 w-full md:w-1/2">
                <div className="button-container">
                  <a href="#"
                    onClick={(e) => {
                      if (!isStravaAnalysisLoading) {
                        e.preventDefault();
                        getCombinedDataAnalyse();
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
        {isOuraAuthed && isReadinessLoading && <OuraSkeletonLoader />}
        {isOuraAuthed && !isReadinessLoading && readinessData && (
          <div>
            <div className="flex flex-wrap -m-4 px-2.5">
              <div className="w-full md:w-1/2 p-4">
                <div className="flex-1 m-2 border border-gray-200 rounded-lg bg-white overflow-hidden pb-8">
                  <h2 className="text-2xl font-semibold mt-4 mb-2 px-12">Oura Sleep</h2>
                  <SleepDataChartComponent
                    sleepData={processedResults}
                    isLoading={isStravaLoading}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap -m-4 px-2.5">
              <div className="w-full md:w-1/2 p-4">
                <div className="flex-1 m-2 border border-gray-200 rounded-lg bg-white overflow-hidden pb-8">
                  <h2 className="text-2xl font-semibold mt-4 mb-2 px-12">Oura Readiness</h2>
                  <ReadinessChart readinessData={readinessData} isLoading={isReadinessLoading} startDate={startDate} endDate={endDate} />
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
