'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import dynamic from 'next/dynamic';
import { ActivityData, ActivityEntry, ActivityContributors, MetData, ActivityChartProps } from '../types/ActivityInterfaces';


const Loading = dynamic(() => import('./Loading'), { ssr: false });

Chart.register(...registerables);


const ActivityChart: React.FC<ActivityChartProps> = ({ startDate, endDate }) => {

    // Initialize state
    const [activityData, setActivityData] = useState({ dates: [], activeCalories: [] });
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true); // Start loading
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];
    
        fetch(`/api/getActivityData?start_date=${formattedStartDate}&end_date=${formattedEndDate}`)
            .then(response => response.json())
            .then(data => {
                const formattedDates = data.data.map((entry: ActivityEntry) => 
                    format(new Date(entry.timestamp), 'do MMM yyyy')
                );
                const activeCalories = data.data.map((entry: ActivityEntry) => entry.active_calories);
                setActivityData({ dates: formattedDates, activeCalories });
                setIsLoading(false); // Stop loading after data is fetched
            })
            .catch(error => {
                console.error('Error:', error);
                setIsLoading(false); // Stop loading in case of error
            });
    }, [startDate, endDate]);
    
    useEffect(() => {
        if (activityData.dates.length > 0 && chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                            // Destroy the existing chart instance if it exists
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
                const gradientFill = ctx.createLinearGradient(0, 0, 0, ctx.canvas.clientHeight);
                gradientFill.addColorStop(0, 'rgba(138, 43, 226, 0.9)');
                gradientFill.addColorStop(1, 'rgba(138, 43, 226, 0.2)');

                chartInstanceRef.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: activityData.dates, // Your formatted dates
                        datasets: [{
                            label: 'Active Calories',
                            data: activityData.activeCalories,
                            fill: true,
                            backgroundColor: gradientFill,
                            borderColor: 'rgba(138, 43, 226, 1)',
                            pointBackgroundColor: 'rgba(138, 43, 226, 1)',
                            borderWidth: 2,
                            pointRadius: 0, // Set point radius to 0 to hide the dots
                            tension: 0.4,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        scales: {
                            x: {
                                ticks: {
                                    autoSkip: true,
                                    maxRotation: 0,
                                    minRotation: 0,
                                    maxTicksLimit: 10
                                },
                                grid: {
                                    display: false
                                },
                                }
                                },
                                plugins: {
                                    tooltip: {
                                      enabled: true,
                                    }
                                  }
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
    
    useEffect(() => {
        const handleResize = () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.resize();
            }
        };
    
        window.addEventListener('resize', handleResize);
    
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    

    return (
        <div>
            {isLoading ? (
                <div><Loading /></div>
            ) : (
                <canvas ref={chartRef} />
            )}
        </div>
    );
    
    
};

export default ActivityChart;
