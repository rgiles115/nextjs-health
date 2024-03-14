import React, { useRef, useEffect } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-date-fns';
import dynamic from 'next/dynamic';

Chart.register(...registerables, annotationPlugin);

interface SleepData {
    day: string;
    distance: number;
    totalElevationGain: number;
    averageHRV?: number;
    averageWatts?: number;
    tags?: string[];
    averageBreath?: number;
    averageHeartRate?: number;
    lowestHeartRate?: number;
    totalSleepDuration?: number;
}

interface SleepDataChartProps {
    sleepData: SleepData[];
    isLoading: boolean;
}

const Loading = dynamic(() => import('./Loading'), { ssr: false });

const arePropsEqual = (prevProps: SleepDataChartProps, nextProps: SleepDataChartProps) => {
    return prevProps.isLoading === nextProps.isLoading &&
           JSON.stringify(prevProps.sleepData) === JSON.stringify(nextProps.sleepData);
};

const SleepDataChartComponent = React.memo(({ sleepData, isLoading }: SleepDataChartProps) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {

        const handleResize = () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.resize();
            }
        };

        if (!isLoading && sleepData.length > 0 && chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                chartInstanceRef.current?.destroy();

                const datasets = [
                    {
                        label: 'Average Sleep Heart Rate',
                        data: sleepData.map(data => data.averageHeartRate ?? 0),
                        borderColor: '#eb4034',
                        tension: 0.4,
                        pointRadius: 0,
                        yAxisID: 'y',
                    },
                    {
                        label: 'Lowest Sleep Heart Rate',
                        data: sleepData.map(data => data.lowestHeartRate ?? 0),
                        borderColor: '#34eb98',
                        tension: 0.4,
                        pointRadius: 0,
                        yAxisID: 'y',
                    },
                    {
                        label: 'Average Sleep Breath Rate',
                        data: sleepData.map(data => data.averageBreath ?? 0),
                        borderColor: '#3496eb',
                        tension: 0.4,
                        pointRadius: 0,
                        yAxisID: 'y',
                    },
                    // Updated dataset for total sleep duration with a specific yAxisID
                    {
                        label: 'Total Sleep Duration (hours)',
                        data: sleepData.map(data => Number(((data.totalSleepDuration ?? 0) / 3600).toFixed(2))),
                        borderColor: '#eb34d2',
                        tension: 0.4,
                        pointRadius: 0,
                        yAxisID: 'y1', // Assign to the second Y axis
                    },
                ];

                const chartConfig: ChartConfiguration<'line', number[], string> = {
                    type: 'line',
                    data: {
                        labels: sleepData.map(data => data.day),
                        datasets,
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
                                }
                            },
                            y: { // Primary Y axis configuration
                                position: 'left',
                                title: {
                                    display: true,
                                    text: 'Rates (BPM)'
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
}, arePropsEqual);

export default SleepDataChartComponent;
