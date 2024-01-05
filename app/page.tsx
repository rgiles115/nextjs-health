'use client'

import Head from 'next/head';
import ActivityChart from './components/ActivityChart';
import SleepChart from './components/SleepChart'; // Import SleepChart
import ReadinessChart from './components/ReadinessChart'; // Import ReadinessChart
import ClientStravaActivitiesChart from './components/ClientStravaActivitiesChart';
import React, { useState, useEffect } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { parse } from 'cookie';



const getStravaAuthURL = () => {
  const root = 'http://www.strava.com/oauth/authorize';
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.STRAVA_REDIRECT_URI);
  
  const responseType = 'code';
  const approvalPrompt = 'auto';
  const scope = 'read,activity:read';

  return `${root}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&approval_prompt=${approvalPrompt}&scope=${scope}`;
};


export default function Home() {
  // Calculate the dates
  const currentDate = new Date();
  const thirtyDaysAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(currentDate);
  const [decodedStravaCookie, setDecodedStravaCookie] = useState('');

  useEffect(() => {
    // Check the cookie on the client side
    const cookies = document.cookie;
    const parsedCookies = parse(cookies);
    
    if (parsedCookies.stravaData) {
      // Cookie exists, you can access it as parsedCookies.stravaData
      console.log('Strava Data:', JSON.parse(parsedCookies.stravaData));
    } else {
      // Cookie doesn't exist
      console.log('Strava Data cookie not found');
    }
  }, []); 

  return (
    <div>
      <Head>
        <title>Oura Ring Activity Data</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/style.css" />
      </Head>
      <div id="pageTitle">Oura Ring Data</div>
      <a href={getStravaAuthURL()}>Authenticate with Strava</a>

      <div id="datePicker">
        <ReactDatePicker selected={startDate} onChange={(date: Date | null) => date && setStartDate(date)} dateFormat="dd MMMM yyyy" className="custom-datepicker"/>
        <ReactDatePicker selected={endDate} onChange={(date: Date | null) => date && setEndDate(date)} dateFormat="dd MMMM yyyy" className="custom-datepicker"/>
      </div>
      <div className="graph-container">
        <ActivityChart startDate={startDate} endDate={endDate} />
      </div>
      <div className="graph-container">
        <SleepChart startDate={startDate} endDate={endDate} />
      </div>
      <div className="graph-container">
        <ReadinessChart startDate={startDate} endDate={endDate} />
      </div>

        <div className="graph-container">
        <ClientStravaActivitiesChart startDate={startDate} endDate={endDate} />
        </div>
      
    </div>
  );
}
