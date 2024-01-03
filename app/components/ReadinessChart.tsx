import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
Chart.register(...registerables);

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

const ReadinessChart: React.FC<ReadinessChartProps> = ({ startDate, endDate }) => {
    // Update state to include new data points
    const [readinessData, setReadinessData] = useState({
        dates: [],
        restingHeartRate: [],
        hrvBalance: [],
        bodyTemperature: []
    });
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];

        fetch(`/api/getReadinessData?start_date=${formattedStartDate}&end_date=${formattedEndDate}`)
            .then(response => response.json())
            .then(data => {
                // Map over your data to create the chart datasets
                const formattedDates = data.data.map((entry: ReadinessEntry) =>
                    format(new Date(entry.day), 'do MMM yyyy')
                );
                setReadinessData({
                    dates: formattedDates,
                    restingHeartRate: data.data.map((entry: ReadinessEntry) => entry.contributors.resting_heart_rate),
                    hrvBalance: data.data.map((entry: ReadinessEntry) => entry.contributors.hrv_balance),
                    bodyTemperature: data.data.map((entry: ReadinessEntry) => entry.contributors.body_temperature)
                });
            })
            .catch(error => console.error('Error:', error));
    }, [startDate, endDate]);

    useEffect(() => {
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
                                pointRadius: 0 // Set point radius to 0 to hide the dots
                            },
                            {
                                label: 'HRV Balance',
                                data: readinessData.hrvBalance,
                                pointRadius: 0 // Set point radius to 0 to hide the dots

                            },
                            {
                                label: 'Body Temperature',
                                data: readinessData.bodyTemperature,
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
            <canvas ref={chartRef} />
        </div>
    );
};

export default ReadinessChart;
