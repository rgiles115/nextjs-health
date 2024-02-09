import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import dynamic from 'next/dynamic';
import ReadinessAnalysis from './ReadinessAnalysis';
import isEqual from 'lodash/isEqual'; // Import isEqual from lodash for deep comparison


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
    isLoading: boolean;
}

interface ReadinessEntry {
    day: string;
    contributors: {
        resting_heart_rate: number;
        hrv_balance: number;
        body_temperature: number; // Ensure these match the actual API response fields
    };
}

const ReadinessChart: React.FC<ReadinessChartProps> = ({ startDate, endDate, readinessData, isLoading }) => {
    const Loading = dynamic(() => import('./Loading'), { ssr: false });

    // Update state to include new data points
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
    

    useEffect(() => {
        if (!readinessData) {
            // If readinessData is null, do not proceed
            return;
        }
        if (readinessData.dates.length > 0 && chartRef.current) {
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
                <Loading /> // Use the Loading component when isLoading is true
            ) : (
                <div className="graph-container">
                    <canvas ref={chartRef} />
                </div>
            )}
        </div>
    );


};

// Custom comparison function for React.memo with explicit types
const areEqual = (prevProps: ReadinessChartProps, nextProps: ReadinessChartProps) => {
    // Perform a deep comparison between prevProps and nextProps
    return isEqual(prevProps, nextProps);
};

const MemoizedReadinessChart = React.memo(ReadinessChart, areEqual);

export default MemoizedReadinessChart;