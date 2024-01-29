import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import dynamic from 'next/dynamic';

const Loading = dynamic(() => import('./Loading'), { ssr: false });
Chart.register(...registerables);

interface SleepData {
    data: SleepEntry[];
    next_token: string | null;
}

interface SleepEntry {
    id: string;
    contributors: Contributors;
    day: string;
    score: number;
    timestamp: string;
}

interface Contributors {
    deep_sleep: number;
    efficiency: number;
    latency: number;
    rem_sleep: number;
    restfulness: number;
    timing: number;
    total_sleep: number;
}


interface SleepChartProps {
    startDate: Date;
    endDate: Date;
}

const SleepChart: React.FC<SleepChartProps> = ({ startDate, endDate }) => {
    const [sleepData, setSleepData] = useState({ dates: [], total: [], rem: [], deep: [], light: [], restfulness: [] });
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true); // Start loading
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];

        fetch(`/api/getSleepData?start_date=${formattedStartDate}&end_date=${formattedEndDate}`)
            .then(response => response.json())
            .then(data => {
                const formattedDates = data.data.map((entry: SleepEntry) => format(new Date(entry.timestamp), 'do MMM yyyy'));
                const total = data.data.map((entry: SleepEntry) => entry.contributors.total_sleep);
                setSleepData({
                    dates: formattedDates,
                    total: data.data.map((entry: SleepEntry) => entry.contributors.total_sleep),
                    rem: data.data.map((entry: SleepEntry) => entry.contributors.rem_sleep),
                    deep: data.data.map((entry: SleepEntry) => entry.contributors.deep_sleep),
                    light: data.data.map((entry: SleepEntry) => entry.score),
                    restfulness: data.data.map((entry: SleepEntry) => entry.contributors.restfulness),
                });
                setIsLoading(false); // Stop loading after data is fetched

            })
            .catch(error => {
                console.error('Error:', error);
                setIsLoading(false); // Stop loading in case of error
            });
    }, [startDate, endDate]);

    useEffect(() => {
        if (sleepData.dates.length > 0 && chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                if (chartInstanceRef.current) {
                    chartInstanceRef.current.destroy();
                }

                chartInstanceRef.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: sleepData.dates,
                        datasets: [
                            {
                                label: 'Total Sleep',
                                data: sleepData.total,
                                pointRadius: 0, // Set point radius to 0 to hide the dots
                                tension: 0.4,
                            },
                            {
                                label: 'REM Sleep',
                                data: sleepData.rem,
                                pointRadius: 0, // Set point radius to 0 to hide the dots
                                tension: 0.4,
                            },
                            {
                                label: 'Deep Sleep',
                                data: sleepData.deep,
                                pointRadius: 0, // Set point radius to 0 to hide the dots
                                tension: 0.4,
                            },
                            {
                                label: 'Light Sleep',
                                data: sleepData.light,
                                pointRadius: 0, // Set point radius to 0 to hide the dots
                                tension: 0.4,
                            },
                            {
                                label: 'Restfulness',
                                data: sleepData.restfulness,
                                pointRadius: 0, // Set point radius to 0 to hide the dots
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
    }, [sleepData]);

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

export default SleepChart;
