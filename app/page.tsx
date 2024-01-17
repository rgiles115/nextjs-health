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
import SideMenu from './components/SideMenu'; // Import SideMenu component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeartbeat } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  // Calculate the dates
  const currentDate = new Date();
  const firstDayOfThisYear = new Date(new Date().getFullYear(), 0, 1);
  const thirtyDaysAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));
  const [startDate, setStartDate] = useState(firstDayOfThisYear);
  const [endDate, setEndDate] = useState(currentDate);
  const [isStravaAuthed, setIsStravaAuthed] = useState(false);
  const [isOuraAuthed, setIsOuraAuthed] = useState(false);

//  console.log("Start Date:", startDate);
//  console.log("End Date:", endDate);

useEffect(() => {
  // Fetch Strava authentication status
  fetch('/api/stravaAuthStatus')
    .then(response => response.json())
    .then(data => {
      console.log('Is Strava Authed:', data.isStravaAuthed);
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
      <h1>
        <FontAwesomeIcon icon={faHeartbeat} /> My Health Data
      </h1>

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
