import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
Chart.register(...registerables);

interface SleepEntry {
    day: string;
    contributors: {
        total_sleep: number;
        rem_sleep: number;
        deep_sleep: number;
        restfulness: number,
        // Additional fields if needed
    };
    score: number; // Assuming this represents light sleep
}

interface SleepChartProps {
    startDate: Date;
    endDate: Date;
}

const SleepChart: React.FC<SleepChartProps> = ({ startDate, endDate }) => {
    const [sleepData, setSleepData] = useState({ dates: [], total: [], rem: [], deep: [], light: [], restfulness: [] });
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];

        fetch(`/api/getSleepData?start_date=${formattedStartDate}&end_date=${formattedEndDate}`)
            .then(response => response.json())
            .then(data => {
                const formattedDates = data.data.map((entry: SleepEntry) => format(new Date(entry.day), 'do MMM yyyy'));
                setSleepData({
                    dates: formattedDates,
                    total: data.data.map((entry) => entry.contributors.total_sleep),
                    rem: data.data.map((entry) => entry.contributors.rem_sleep),
                    deep: data.data.map((entry) => entry.contributors.deep_sleep),
                    light: data.data.map((entry) => entry.score),
                    restfulness: data.data.map((entry) => entry.contributors.restfulness),
                });
            })
            .catch(error => console.error('Error:', error));
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
                                pointRadius: 0 // Set point radius to 0 to hide the dots
                            },
                            {
                                label: 'REM Sleep',
                                data: sleepData.rem,
                                pointRadius: 0 // Set point radius to 0 to hide the dots

                            },
                            {
                                label: 'Deep Sleep',
                                data: sleepData.deep,
                                pointRadius: 0 // Set point radius to 0 to hide the dots

                            },
                            {
                                label: 'Light Sleep',
                                data: sleepData.light,
                                pointRadius: 0 // Set point radius to 0 to hide the dots

                            },
                            {
                                label: 'Restfulness',
                                data: sleepData.restfulness,
                                pointRadius: 0 // Set point radius to 0 to hide the dots

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
            <canvas ref={chartRef} />
        </div>
    );
};

export default SleepChart;
