import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import "react-datepicker/dist/react-datepicker.css";
import dynamic from 'next/dynamic';
import isEqual from 'lodash/isEqual';
import { format, parse } from 'date-fns'; // Import format and parse from date-fns

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

const ReadinessChart: React.FC<ReadinessChartProps> = ({ startDate, endDate, readinessData, isLoading }) => {
    const Loading = dynamic(() => import('./Loading'), { ssr: false });
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    // Function to convert date strings from "8th Mar 2024" to "YYYY-MM-DD"
    function convertDateString(dateString: string): string {
        const parts = dateString.match(/(\d+)(?:th|st|nd|rd)\s([A-Za-z]+)\s(\d{4})/);
        if (!parts) return ''; // Handle the error as appropriate

        const parsedDate = parse(`${parts[1]} ${parts[2]} ${parts[3]}`, 'd MMMM yyyy', new Date());
        return format(parsedDate, 'yyyy-MM-dd');
    }

    useEffect(() => {
        if (!readinessData || readinessData.dates.length === 0 || !chartRef.current) {
            return;
        }

        const convertedDates = readinessData.dates.map(date => convertDateString(date));
        const ctx = chartRef.current.getContext('2d');
        if (ctx) {
            chartInstanceRef.current?.destroy();

            chartInstanceRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: convertedDates, // Use converted dates here
                    datasets: [
                        {
                            label: 'Resting Heart Rate',
                            data: readinessData.restingHeartRate,
                            pointRadius: 0, // Set point radius to 0 to hide the dots
                            backgroundColor: 'rgba(93, 166, 180, 0.5)', // Pale Turquoise with transparency
                            borderColor: '#3567fa', // Pale Turquoise
                            tension: 0.4,
                        },
                        {
                            label: 'HRV Balance',
                            data: readinessData.hrvBalance,
                            pointRadius: 0, // Set point radius to 0 to hide the dots
                            backgroundColor: 'rgba(50, 115, 136, 0.5)', // Teal Blue with some transparency
                            borderColor: '#37c6ff', // Teal Blue
                            tension: 0.4,
                        },
                        {
                            label: 'Body Temperature',
                            data: readinessData.bodyTemperature,
                            pointRadius: 0, // Set point radius to 0 to hide the dots
                            backgroundColor: 'rgba(87, 160, 174, 0.5)', // Soft Cyan with some transparency
                            borderColor: '#d84bff', // Soft Cyan
                            tension: 0.4,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    layout: {
                        padding: window.innerWidth <= 600 ? 5 : 15, // Dynamic padding based on window width
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                tooltipFormat: 'd MMM yy',
                                displayFormats: {
                                    day: 'd MMM yy',
                                }
                            },
                            grid: {
                                display: false
                            },
                            ticks: {
                                autoSkip: true,
                                maxRotation: 0,
                                minRotation: 0,
                                maxTicksLimit: 5
                            },
                            min: format(startDate, 'yyyy-MM-dd'), // Setting minimum bound
                            max: format(endDate, 'yyyy-MM-dd'),   // Setting maximum bound
                        },
                        y: {
                            grid: {
                                display: false,
                            },
                            ticks: {
                                display: true,
                                maxTicksLimit: 5
                            },
                        },
                        // Other scales configurations...
                    },
                    plugins: {
                        tooltip: {
                            enabled: true,
                        },
                        legend: {
                            display: false // Disable the default legend
                        },
                    }
                }
            });
        }

        return () => chartInstanceRef.current?.destroy();
    }, [readinessData, startDate, endDate]); // Add startDate and endDate to the dependency list

    useEffect(() => {
        const chart = chartInstanceRef.current;
        const legendContainer = document.getElementById('readiness-chart-legend');
    
        if (chart && legendContainer) {
            legendContainer.innerHTML = ''; // Clear existing legend items
    
            chart.data.datasets.forEach((dataset, index) => {
                const legendItem = document.createElement('div');
                legendItem.className = 'custom-legend-item';
    
                const colorBox = document.createElement('div');
                colorBox.className = 'custom-legend-color-box';
                // Set initial color based on dataset visibility
                const borderColor = typeof dataset.borderColor === 'string' ? dataset.borderColor : 'grey';
                colorBox.style.backgroundColor = chart.isDatasetVisible(index) ? borderColor : 'grey';
    
                const labelText = document.createElement('span');
                labelText.textContent = dataset.label || 'No label'; // Provide a default label if undefined
                colorBox.appendChild(labelText);
    
                legendItem.appendChild(colorBox);
                legendItem.onclick = function () {
                    const meta = chart.getDatasetMeta(index);
                    meta.hidden = !meta.hidden; // Toggle the hidden state
                    chart.update();
    
                    // Update color based on new visibility status
                    colorBox.style.backgroundColor = meta.hidden ? 'grey' : (typeof dataset.borderColor === 'string' ? dataset.borderColor : 'grey');
                };
                legendContainer.appendChild(legendItem);
            });
        }
    }, [readinessData]); // Include all necessary dependencies in the dependency array
    




    useEffect(() => {
        const handleResize = () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.resize();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (

        <div>
            {isLoading ? (
                <Loading />
            ) : (
                <div className="rounded-lg bg-white p-4">
                    <canvas ref={chartRef} className="w-auto h-auto" />
                    <div id="readiness-chart-legend" className="flex flex-row flex-wrap justify-center items-center content-center w-full p-2.5 overflow-hidden">
                    </div>
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