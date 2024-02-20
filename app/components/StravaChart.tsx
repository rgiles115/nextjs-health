import React, { useRef, useEffect } from 'react';
import { Chart, ChartConfiguration } from 'chart.js';
import 'chartjs-adapter-date-fns';
import dynamic from 'next/dynamic';

interface ProcessedStravaActivity {
    day: string;
    distance: number;
    totalElevationGain: number;
    averageHRV?: number;
    averageWatts?: number;
}

interface StravaChartProps {
    processedData: ProcessedStravaActivity[];
    isLoading: boolean;
}

const Loading = dynamic(() => import('./Loading'), { ssr: false });

const StravaChartComponent: React.FC<StravaChartProps> = ({ processedData, isLoading }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
        const handleResize = () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.resize();
            }
        };

        if (!isLoading && processedData.length > 0 && chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                chartInstanceRef.current?.destroy();

                const hasHRVData = processedData.some(data => data.averageHRV != null);
                const hasWattsData = processedData.some(data => data.averageWatts != null);

                const datasets = [
                    {
                        label: 'Distance (km)',
                        data: processedData.map(data => data.distance),
                        borderColor: '#219ebc',
                        tension: 0.4,
                        pointRadius: 0,
                        yAxisID: 'y',
                    },
                    {
                        label: 'Elevation Gain (m)',
                        data: processedData.map(data => data.totalElevationGain),
                        borderColor: '#fb8500',
                        tension: 0.4,
                        pointRadius: 0,
                        yAxisID: 'y',
                    },
                ];

                if (hasWattsData) {
                    datasets.push({
                        label: 'Average Watts',
                        data: processedData.map(data => data.averageWatts ?? 0),
                        borderColor: '#ffbe0b',
                        tension: 0.4,
                        pointRadius: 0,
                        yAxisID: 'y',
                    });
                }

                if (hasHRVData) {
                    datasets.push({
                        label: 'Average HRV',
                        data: processedData.map(data => data.averageHRV ?? 0),
                        borderColor: '#8338ec',
                        tension: 0.4,
                        pointRadius: 0,
                        yAxisID: hasWattsData ? 'y1' : 'y',
                    });
                }

                const chartConfig: ChartConfiguration<'line', number[], string> = {
                    type: 'line',
                    data: {
                        labels: processedData.map(data => data.day),
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
                            y: {
                                position: 'left',
                            },
                            ...(hasHRVData && hasWattsData && {
                                y1: {
                                    position: 'right',
                                    grid: {
                                        drawOnChartArea: false,
                                    },
                                }
                            }),
                        },
                    },
                };

                chartInstanceRef.current = new Chart(ctx, chartConfig);

                // Add the resize event listener
                window.addEventListener('resize', handleResize);
            }
        }

        // Cleanup function to remove the resize event listener and destroy the chart instance
        return () => {
            chartInstanceRef.current?.destroy();
            window.removeEventListener('resize', handleResize);
        };
    }, [processedData, isLoading]);

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

const areEqual = (prevProps: StravaChartProps, nextProps: StravaChartProps) => {
    return prevProps.isLoading === nextProps.isLoading &&
        prevProps.processedData === nextProps.processedData;
};

const StravaChart = React.memo(StravaChartComponent, areEqual);

export default StravaChart;