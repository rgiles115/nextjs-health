import React, { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import dynamic from 'next/dynamic';
import isEqual from 'lodash/isEqual';
import { useFetchSleepData } from '../hooks/useFetchSleepData';

const Loading = dynamic(() => import('./Loading'), { ssr: false });
Chart.register(...registerables);

interface SleepChartProps {
    startDate: Date;
    endDate: Date;
}

const SleepChart: React.FC<SleepChartProps> = ({ startDate, endDate }) => {
    const { data: sleepData, isLoading } = useFetchSleepData(startDate, endDate);
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

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
                <Loading /> 
            ) : (
                <div className="graph-container">
                    <canvas ref={chartRef} />
                </div>
            )}
        </div>
    );

};

// Custom comparison function for React.memo with explicit types
const areEqual = (prevProps: SleepChartProps, nextProps: SleepChartProps) => {
    return isEqual(prevProps, nextProps);
};

const MemoizedSleepChart = React.memo(SleepChart, areEqual);

export default MemoizedSleepChart;