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
    distance: number;
    totalElevationGain: number;
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

function SleepDataChartComponent({ sleepData, isLoading }: SleepDataChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
        const handleResize = () => {
            chartInstanceRef.current?.resize();
        };

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
                        label: 'Average Sleep Heart Rate',
                        data: sleepData.map(data => data.averageSleepHeartRate ?? 0),
                        borderColor: '#eb4034',
                        tension: 0.4,
                        pointRadius: 0,
                        yAxisID: 'y',
                    },
                    {
                        label: 'Lowest Sleep Heart Rate',
                        data: sleepData.map(data => data.lowestSleepHeartRate ?? 0),
                        borderColor: '#34eb98',
                        tension: 0.4,
                        pointRadius: 0,
                        yAxisID: 'y',
                    },
                    {
                        label: 'Average Sleep Breath Rate',
                        data: sleepData.map(data => data.averageSleepBreath ?? 0),
                        borderColor: '#3496eb',
                        tension: 0.4,
                        pointRadius: 0,
                        yAxisID: 'y',
                    },
                    {
                        label: 'Total Sleep Duration (hours)',
                        data: sleepData.map(data => Number(((data.totalSleepDuration ?? 0) / 3600).toFixed(2))),
                        borderColor: '#eb34d2',
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
                                    display: false,
                                },
                            },
                            y: { // Primary Y axis configuration
                                position: 'left',
                                title: {
                                    display: true,
                                    text: 'Rates (BPM)'
                                },
                                grid: {
                                    display: false,
                                },
                            },
                            y1: { // Second Y axis configuration for total sleep duration
                                position: 'right',
                                title: {
                                    display: true,
                                    text: 'Total Sleep Duration (hours)'
                                },
                                grid: {
                                    drawOnChartArea: false,
                                },
                                // Additional customization as needed
                            },
                        },
                        plugins: {
                            legend: {
                                display: window.innerWidth > 600,
                            },
                        },
                    },
                };

                chartInstanceRef.current = new Chart(ctx, chartConfig);
                window.addEventListener('resize', handleResize);

            }
        }

        return () => {
            chartInstanceRef.current?.destroy();
            window.removeEventListener('resize', handleResize);
        };
    }, [sleepData, isLoading]);

    return (
        <div>
            {isLoading ? <Loading /> : <div className="graph-container"><canvas ref={chartRef} /></div>}
        </div>
    );
}

export default React.memo(SleepDataChartComponent, arePropsEqual);