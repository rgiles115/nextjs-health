'use client'

import Head from 'next/head';
import ActivityChart from './components/ActivityChart';
import SleepChart from './components/SleepChart'; // Import SleepChart
import ReadinessChart from './components/ReadinessChart'; // Import ReadinessChart
import React, { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function Home() {
  // Calculate the dates
  const currentDate = new Date();
  const thirtyDaysAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));

  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(currentDate);

  return (
    <div>
      <Head>
        <title>Oura Ring Activity Data</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/style.css" />
      </Head>
      <div id="pageTitle">Oura Ring Data</div>
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
    </div>
  );
}
