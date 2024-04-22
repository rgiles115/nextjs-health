import React, { useRef, useEffect } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-date-fns';
import dynamic from 'next/dynamic';
import { format, parse } from 'date-fns';

// Register Chart.js and the annotation plugin globally
Chart.register(...registerables, annotationPlugin);

interface SleepData {
    day: string;
    distance?: number;
    totalElevationGain?: number;
    averageSleepHRV?: number;
    averageWatts?: number;
    tags?: string[];
    averageSleepBreath?: number;
    averageSleepHeartRate?: number;
    lowestSleepHeartRate?: number;
    totalSleepDuration?: number;
}

interface SleepDataChartProps {
    sleepData: SleepData[];
    isLoading: boolean;
    startDate: Date; // Added startDate
    endDate: Date;   // Added endDate
}


const Loading = dynamic(() => import('./Loading'), { ssr: false });

function convertDateString(dateString: string): string {
    const parts = dateString.match(/(\d+)(?:th|st|nd|rd)\s([A-Za-z]+)\s(\d{4})/);
    if (!parts) return ''; // Return an empty string or handle the error as appropriate

    const parsedDate = parse(`${parts[1]} ${parts[2]} ${parts[3]}`, 'd MMMM yyyy', new Date());
    return format(parsedDate, 'yyyy-MM-dd');
}

// Comparison function for React.memo
const arePropsEqual = (prevProps: SleepDataChartProps, nextProps: SleepDataChartProps) => {
    return prevProps.isLoading === nextProps.isLoading &&
        JSON.stringify(prevProps.sleepData) === JSON.stringify(nextProps.sleepData);
};

function SleepDataChartComponent({ sleepData, isLoading, startDate, endDate }: SleepDataChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {


        if (!isLoading && sleepData.length > 0 && chartRef.current) {
            const convertedSleepData = sleepData.map(data => ({
                ...data,
                day: convertDateString(data.day),
            }));
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                chartInstanceRef.current?.destroy();

                const datasets = [
                    // Dataset configurations
                    {
                        label: 'Avg. Sleep HR',
                        data: sleepData.map(data => data.averageSleepHeartRate ?? 0),
                        borderColor: '#3567fa',
                        tension: 0.4,
                        pointRadius: 0,
                        yAxisID: 'y',
                    },
                    {
                        label: 'Lowest Sleep HR',
                        data: sleepData.map(data => data.lowestSleepHeartRate ?? 0),
                        borderColor: '#37c6ff',
                        tension: 0.4,
                        pointRadius: 0,
                        yAxisID: 'y',
                    },
                    {
                        label: 'Avg. Breath Rate',
                        data: sleepData.map(data => data.averageSleepBreath ?? 0),
                        borderColor: '#d84bff',
                        tension: 0.4,
                        pointRadius: 0,
                        yAxisID: 'y',
                    },
                    {
                        label: 'Sleep Duration',
                        data: sleepData.map(data => Number(((data.totalSleepDuration ?? 0) / 3600).toFixed(2))),
                        borderColor: '#8338ec',
                        tension: 0.4,
                        pointRadius: 0,
                        yAxisID: 'y1',
                    },
                ];

                const chartConfig: ChartConfiguration<'line', number[], string> = {
                    type: 'line',
                    data: {
                        labels: convertedSleepData.map(data => data.day), // Use converted dates
                        datasets,
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
                                    unit: 'day', // Explicitly set the unit to 'day'
                                    tooltipFormat: 'd MMM yy',
                                    displayFormats: {
                                        day: 'd MMM yy', // You may adjust this format as needed
                                    }
                                },
                                grid: {
                                    display: false,
                                },
                                ticks: {
                                    autoSkip: true,
                                    maxRotation: 0,
                                    minRotation: 0,
                                    maxTicksLimit: 10
                                },
                                min: format(startDate, 'yyyy-MM-dd'), // Set minimum bound to selected start date
                                max: format(endDate, 'yyyy-MM-dd'),   // Set maximum bound to selected end date
                            },
                            y: { // Primary Y axis configuration
                                position: 'left',
                                title: {
                                    display: false,
                                    text: 'Rates (BPM)'
                                },
                                grid: {
                                    display: false,
                                },
                            },
                            y1: { // Second Y axis configuration for total sleep duration
                                position: 'right',
                                title: {
                                    display: false,
                                    text: 'Total Sleep Duration (hours)'
                                },
                                grid: {
                                    drawOnChartArea: false,
                                },
                                // Additional customization as needed
                            },
                        },
                        plugins: {
                            legend: { display: false } // Disable default legend
                        },
                    },
                };

                chartInstanceRef.current = new Chart(ctx, chartConfig);
            }
        }


    }, [sleepData, isLoading]);

    useEffect(() => {
        if (chartInstanceRef.current) {
            const chart = chartInstanceRef.current;
            const legendContainer = document.getElementById('sleep-chart-legend');

            if (legendContainer) { // Check if the element is not null
                legendContainer.innerHTML = ''; // Clear existing legend items

                chart.data.datasets.forEach((dataset, index) => {
                    const legendItem = document.createElement('div');
                    legendItem.className = 'custom-legend-item';

                    const colorBox = document.createElement('div');
                    colorBox.className = 'custom-legend-color-box';
                    colorBox.style.backgroundColor = typeof dataset.borderColor === 'string' ? dataset.borderColor : 'grey';

                    const labelText = document.createElement('span');
                    labelText.textContent = dataset.label || ''; // Using dataset.label with a fallback to an empty string
                    colorBox.appendChild(labelText);

                    legendItem.appendChild(colorBox);
                    legendItem.onclick = function () {
                        const meta = chart.getDatasetMeta(index);
                        // Explicitly handle null and boolean values
                        if (meta.hidden === null) {
                            meta.hidden = true; // Set hidden to true if it's currently null
                        } else {
                            meta.hidden = !meta.hidden; // Toggle the boolean value
                        }
                        chart.update();
                    };


                    legendContainer.appendChild(legendItem);
                });
            }
        }
    }, [sleepData]); // Dependency on sleepData to rebuild the legend when data changes


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
            {isLoading ? <Loading /> : (
                <div className="m-5 rounded-lg bg-white p-5">
                    <canvas ref={chartRef} className="w-auto h-auto m-5" />
                    <div id="sleep-chart-legend" className="flex flex-row flex-wrap justify-center items-center content-center w-full p-2.5 overflow-hidden"></div>
                </div>
            )}
        </div>

    );
}

export default React.memo(SleepDataChartComponent, arePropsEqual);