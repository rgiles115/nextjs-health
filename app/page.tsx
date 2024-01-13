'use client'

import Head from 'next/head';
import ActivityChart from './components/ActivityChart';
import SleepChart from './components/SleepChart'; // Import SleepChart
import ReadinessChart from './components/ReadinessChart'; // Import ReadinessChart
import ClientStravaActivitiesChart from './components/ClientStravaActivitiesChart';
import React, { useState, useEffect } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Footer from './components/Footer'; // Import Footer component
import Script from 'next/script';
import Link from 'next/link';



const getStravaAuthURL = () => {
  const root = 'http://www.strava.com/oauth/authorize';
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = process.env.STRAVA_REDIRECT_URI ? encodeURIComponent(process.env.STRAVA_REDIRECT_URI) : ''; // Specify the type and provide a default value
  const responseType = 'code';
  const approvalPrompt = 'auto';
  const scope = 'read,activity:read';
  return `${root}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&approval_prompt=${approvalPrompt}&scope=${scope}`;
};

const getOuraAuthURL = () => {
  const root = 'https://cloud.ouraring.com/oauth/authorize';
  const clientId = process.env.OURA_CLIENT_ID;
  const redirectUri = process.env.OURA_REDIRECT_URI ? encodeURIComponent(process.env.OURA_REDIRECT_URI) : ''; // Specify the type and provide a default value
  const responseType = 'code';
  const approvalPrompt = 'auto';
  const scope = 'read,activity:read';
  return `${root}?client_id=${clientId}&response_type=${responseType}&redirect_uri=${redirectUri}`;
};


export default function Home() {
  // Calculate the dates
  const currentDate = new Date();
  const firstDayOfThisYear = new Date(new Date().getFullYear(), 0, 1);
  const thirtyDaysAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));
  const [startDate, setStartDate] = useState(firstDayOfThisYear);
  const [endDate, setEndDate] = useState(currentDate);
  const [isStravaAuthed, setIsStravaAuthed] = useState(false);
  const [isOuraAuthed, setIsOuraAuthed] = useState(false);
  const stravaAuthURL = getStravaAuthURL();

  
//  console.log("Start Date:", startDate);
//  console.log("End Date:", endDate);

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
      console.log('Is Oura Authed:', data.isOuraAuthed);
      setIsOuraAuthed(data.isOuraAuthed);
      console.log('Is Oura Authed:', data.isOuraAuthed);
    })
    .catch(error => {
      console.error('Error fetching Oura auth status:', error);
    });
}, []);



  return (
    <div>
      <Head>
        <title>My Health Data</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/style.css" />
      </Head>
      <div id="pageTitle">My Health Data</div>
      <a href={getStravaAuthURL()}><div id="authStravaButton"></div></a>
      <div id="authButton"><a href={getOuraAuthURL()}>Authenticate with Oura</a></div>
      <Script src="https://kit.fontawesome.com/0d58ae3c8d.js" strategy="lazyOnload" crossOrigin="anonymous" />


      <div id="datePicker">
        <ReactDatePicker selected={startDate} onChange={(date: Date | null) => date && setStartDate(date)} dateFormat="dd MMMM yyyy" className="custom-datepicker"/>
        <ReactDatePicker selected={endDate} onChange={(date: Date | null) => date && setEndDate(date)} dateFormat="dd MMMM yyyy" className="custom-datepicker"/>
      </div>

      {isStravaAuthed &&  (
        <div>
      
        <ClientStravaActivitiesChart startDate={startDate} endDate={endDate} />
      
      </div>
      )}

      {isOuraAuthed && (
        <div>
        <ActivityChart startDate={startDate} endDate={endDate} />
        <SleepChart startDate={startDate} endDate={endDate} />
        <ReadinessChart startDate={startDate} endDate={endDate} />
        </div>
      )}
      <div id="footer"><Footer /></div>
    </div>
  );
}
