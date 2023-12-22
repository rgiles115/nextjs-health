'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);


interface ActivityEntry {
    day: string;           // Assuming 'day' is a string
    active_calories: number; // Assuming 'active_calories' is a number
  }

  const ActivityChart = () => {
    const [activityData, setActivityData] = useState({ dates: [], activeCalories: [] });
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
        fetch('/api/getActivityData')
            .then(response => response.json())
            .then(data => {
                console.log('Fetched data:', data); // Log the fetched data
                const dates = data.data.map((entry: ActivityEntry) => entry.day);
                const activeCalories = data.data.map((entry: ActivityEntry) => entry.active_calories);
                setActivityData({ dates, activeCalories });
            })
            .catch(error => console.error('Error:', error));
    }, []);

    useEffect(() => {
        if (activityData.dates.length > 0 && chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                            // Destroy the existing chart instance if it exists
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
                const gradientFill = ctx.createLinearGradient(0, 0, 0, ctx.canvas.clientHeight);
                gradientFill.addColorStop(0, 'rgba(138, 43, 226, 0.6)');
                gradientFill.addColorStop(1, 'rgba(138, 43, 226, 0)');

                chartInstanceRef.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: activityData.dates,
                        datasets: [{
                            label: 'Active Calories',
                            data: activityData.activeCalories,
                            fill: true,
                            backgroundColor: gradientFill,
                            borderColor: 'rgba(138, 43, 226, 1)',
                            pointBackgroundColor: 'rgba(138, 43, 226, 1)',
                            borderWidth: 2
                        }]
                    }
                });

            }
        }
            // Cleanup function to destroy chart instance when component unmounts or before re-rendering
    return () => {
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }
    };
    }, [activityData]);
    

    return (
        <div>
            <canvas ref={chartRef} />
        </div>
    );
    
};

export default ActivityChart;
