import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import dynamic from 'next/dynamic';
import "react-datepicker/dist/react-datepicker.css";

const Loading = dynamic(() => import('./Loading'), { ssr: false });
Chart.register(...registerables);

interface HRVData {
    dates: string[];
    hrv: number[];
}

interface HRVChartProps {
    hrvData: HRVData;
    isLoading: boolean; // Added isLoading prop
}

const HRVChart: React.FC<HRVChartProps> = ({ hrvData, isLoading }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!isLoading && hrvData && hrvData.dates.length > 0 && chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                if (chartInstanceRef.current) {
                    chartInstanceRef.current.destroy();
                }

                chartInstanceRef.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: hrvData.dates,
                        datasets: [
                            {
                                label: 'Average HRV',
                                data: hrvData.hrv,
                                borderColor: 'rgb(75, 192, 192)',
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
                            },
                            y: {
                                beginAtZero: true, // Adjust as needed
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
    }, [hrvData, isLoading]);

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

export default HRVChart;
