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
import ClientStravaActivitiesChart from './components/ClientStravaActivitiesChart';
import Footer from './components/Footer';
import Script from 'next/script';
import SideMenu from './components/SideMenu';

export default function Home() {
  // State declarations
  const currentDate = new Date();
  const firstDayOfThisYear = new Date(new Date().getFullYear(), 0, 1);
  const sevenDaysAgo = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000));
  const [startDate, setStartDate] = useState(sevenDaysAgo);
  const [endDate, setEndDate] = useState(currentDate);
  const [isStravaAuthed, setIsStravaAuthed] = useState(false);
  const [isOuraAuthed, setIsOuraAuthed] = useState(false);
  const [stravaData, setStravaData] = useState<StravaActivity[] | null>(null);
  const { data: stravaActivities, isLoading: isStravaLoading } = useFetchStravaActivities(startDate, endDate);

  const getCookie = (name: string): string | undefined => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookiePart = parts.pop();
      return cookiePart ? cookiePart.split(';').shift() : undefined;
    }
    return undefined;
  };
  

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

      <div id="datePicker">
        <ReactDatePicker selected={startDate} onChange={(date: Date | null) => date && setStartDate(date)} dateFormat="dd MMMM yyyy" className="custom-datepicker"/>
        <ReactDatePicker selected={endDate} onChange={(date: Date | null) => date && setEndDate(date)} dateFormat="dd MMMM yyyy" className="custom-datepicker"/>
      </div>

      {isStravaAuthed && (
        <div>
            <ClientStravaActivitiesChart 
            startDate={startDate} 
            endDate={endDate} 
            stravaData={stravaActivities} 
            isLoading={isStravaLoading} 
          />
        </div>
      )}

      {isOuraAuthed && (
        <div>
          <ReadinessChart startDate={startDate} endDate={endDate} />
          <div className="content-container">
            <div className="graph-container">
              <ActivityChart startDate={startDate} endDate={endDate} />
            </div>
            <div className="graph-container">
              <SleepChart startDate={startDate} endDate={endDate} />
            </div>
          </div>
        </div>
      )}
      <div id="footer"><Footer /></div>
    </div>
  );
}
