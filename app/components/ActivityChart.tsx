'use client'
import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface ActivityEntry {
    day: string;           // Assuming 'day' is a string
    active_calories: number; // Assuming 'active_calories' is a number
  }

  const ActivityChart = () => {
    const [activityData, setActivityData] = useState({ dates: [], activeCalories: [] });
    const chartRef = useRef<HTMLCanvasElement>(null);


    useEffect(() => {
        fetch('/api/getActivityData')
            .then(response => response.json())
            .then(data => {
                const dates = data.data.map((entry: ActivityEntry) => entry.day);
                const activeCalories = data.data.map((entry: ActivityEntry) => entry.active_calories);
                setActivityData({ dates, activeCalories });
            })
            .catch(error => console.error('Error:', error));
    }, []);

    useEffect(() => {
        console.log('Testing useEffect');
    }, [activityData]);
    

    return (
        <div>
            <canvas ref={chartRef} width="800" height="800" />
        </div>
    );
    
};

export default ActivityChart;
