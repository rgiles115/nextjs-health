import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import dynamic from 'next/dynamic';
import ReadinessAnalysis from './ReadinessAnalysis';

const Loading = dynamic(() => import('./Loading'), { ssr: false });

Chart.register(...registerables);

interface ReadinessChartProps {
    startDate: Date;
    endDate: Date;
    readinessData: {
        dates: string[];
        restingHeartRate: number[];
        hrvBalance: number[];
        bodyTemperature: number[];
    } | null;
}

interface ReadinessEntry {
    day: string;
    contributors: {
        resting_heart_rate: number;
        hrv_balance: number;
        body_temperature: number; // Ensure these match the actual API response fields
    };
}

interface ReadinessChartProps {
    startDate: Date;
    endDate: Date;
}

const ReadinessChart: React.FC<ReadinessChartProps> = ({ startDate, endDate, readinessData }) => {
    // Update state to include new data points
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!readinessData) {
            // If readinessData is null, do not proceed
            return;
        }
        if (readinessData.dates.length > 0 && chartRef.current) {
            console.log("Readiness:", readinessData);
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                if (chartInstanceRef.current) {
                    chartInstanceRef.current.destroy();
                }

                chartInstanceRef.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: readinessData.dates,
                        datasets: [
                            {
                                label: 'Resting Heart Rate',
                                data: readinessData.restingHeartRate,
                                pointRadius: 0, // Set point radius to 0 to hide the dots
                                backgroundColor: 'rgba(93, 166, 180, 0.5)', // Pale Turquoise with transparency
                                borderColor: '#5da6b4', // Pale Turquoise
                                tension: 0.4,
                            },
                            {
                                label: 'HRV Balance',
                                data: readinessData.hrvBalance,
                                pointRadius: 0, // Set point radius to 0 to hide the dots
                                backgroundColor: 'rgba(50, 115, 136, 0.5)', // Teal Blue with some transparency
                                borderColor: '#327388', // Teal Blue
                                tension: 0.4,
                            },
                            {
                                label: 'Body Temperature',
                                data: readinessData.bodyTemperature,
                                pointRadius: 0, // Set point radius to 0 to hide the dots
                                backgroundColor: 'rgba(87, 160, 174, 0.5)', // Soft Cyan with some transparency
                                borderColor: '#57a0ae', // Soft Cyan
                                tension: 0.4,
                            }
                        ]
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
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [readinessData]);

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
                <div><Loading /></div> // Replace with a spinner or loading component
            ) : (
                <div className="graph-container">
                    <canvas ref={chartRef} />
                </div>
            )}
        </div>
    );


};

export default ReadinessChart;
