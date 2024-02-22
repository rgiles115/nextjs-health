import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import dynamic from 'next/dynamic';
import "react-datepicker/dist/react-datepicker.css";
import { transformedHrvData } from '../../app/types/OuraInterfaces';


const Loading = dynamic(() => import('./Loading'), { ssr: false });
Chart.register(...registerables);

interface HRVChartProps {
    hrvData: transformedHrvData[];
    isLoading: boolean; // Ensure this accepts a boolean
}

const HRVChart: React.FC<HRVChartProps> = ({ hrvData, isLoading }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!isLoading && hrvData && hrvData.length > 0 && chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                if (chartInstanceRef.current) {
                    chartInstanceRef.current.destroy();
                }

                chartInstanceRef.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: hrvData.map(data => data.date), // Map dates for labels
                        datasets: [
                            {
                                label: 'Average HRV',
                                data: hrvData.map(data => data.averageHRV), // Map averageHRV for data
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
                                type: 'time',
                                time: {
                                    unit: 'day',
                                    tooltipFormat: 'do MMM yyyy', // Updated format
                                    // If your dates are not in 'do MMM yyyy' format and need parsing, specify parser here
                                },
                                title: {
                                    display: true,
                                    text: 'Date',
                                }
                            },
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Average HRV',
                                }
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
