'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
Chart.register(...registerables);


interface ActivityData {
    data: ActivityEntry[];
    next_token: string | null;
}

interface ActivityEntry {
    id: string;
    class_5_min: string;
    score: number;
    active_calories: number;
    average_met_minutes: number;
    contributors: ActivityContributors;
    equivalent_walking_distance: number;
    high_activity_met_minutes: number;
    high_activity_time: number;
    inactivity_alerts: number;
    low_activity_met_minutes: number;
    low_activity_time: number;
    medium_activity_met_minutes: number;
    medium_activity_time: number;
    met: MetData;
    meters_to_target: number;
    non_wear_time: number;
    resting_time: number;
    sedentary_met_minutes: number;
    sedentary_time: number;
    steps: number;
    target_calories: number;
    target_meters: number;
    total_calories: number;
    day: string;
    timestamp: string;
}

interface ActivityContributors {
    meet_daily_targets: number;
    move_every_hour: number;
    recovery_time: number;
    stay_active: number;
    training_frequency: number;
    training_volume: number;
}

interface MetData {
    interval: number;
    items: number[];
    timestamp: string;
}


  interface ActivityChartProps {
    startDate: Date;
    endDate: Date;
}

const ActivityChart: React.FC<ActivityChartProps> = ({ startDate, endDate }) => {

    // Initialize state
    const [activityData, setActivityData] = useState({ dates: [], activeCalories: [] });
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
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
            })
            .catch(error => console.error('Error:', error));
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
            <canvas ref={chartRef} />
        </div>
    );
    
};

export default ActivityChart;
