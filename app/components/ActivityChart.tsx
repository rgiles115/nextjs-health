'use client'
import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const ActivityChart = () => {
    const [activityData, setActivityData] = useState({ dates: [], activeCalories: [] });
    const chartRef = useRef(null);

    useEffect(() => {
        fetch('/api/getActivityData')  // Replace with your server API endpoint
            .then(response => response.json())
            .then(data => {
                const dates = data.data.map(entry => entry.day);
                const activeCalories = data.data.map(entry => entry.active_calories);
                setActivityData({ dates, activeCalories });
            })
            .catch(error => console.error('Error:', error));
    }, []);

    useEffect(() => {
        if (activityData.dates.length > 0) {
            const ctx = chartRef.current.getContext('2d');
            const gradientFill = ctx.createLinearGradient(0, 0, 0, ctx.canvas.clientHeight);
            gradientFill.addColorStop(0, 'rgba(138, 43, 226, 0.6)');
            gradientFill.addColorStop(1, 'rgba(138, 43, 226, 0)');

            new Chart(ctx, {
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
                        borderWidth: 2,
                        lineTension: 0.3
                    }]
                },
                options: {
                    // ...your options here
                }
            });
        }
    }, [activityData]);

    return (
        <div>
            <canvas ref={chartRef} width="800" height="800" />
        </div>
    );
    
};

export default ActivityChart;
