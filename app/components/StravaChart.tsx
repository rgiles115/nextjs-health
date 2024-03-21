import React, { useRef, useEffect } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-date-fns';
import dynamic from 'next/dynamic';
import { format, parse } from 'date-fns';


Chart.register(...registerables, annotationPlugin);


interface ProcessedStravaActivity {
    day: string;
    distance: number;
    totalElevationGain: number;
    averageSleepHRV?: number;
    averageWatts?: number;
    tags?: string[]; // Include tags here
}

interface StravaChartProps {
    processedData: ProcessedStravaActivity[];
    isLoading: boolean;
}

const Loading = dynamic(() => import('./Loading'), { ssr: false });

function convertDateString(dateString: string): string {
    // Attempt to extract the day, month, and year from the input string
    const parts = dateString.match(/(\d+)(?:th|st|nd|rd)\s([A-Za-z]+)\s(\d{4})/);
    if (!parts) return ''; // Return an empty string or handle the error as appropriate

    // Use date-fns parse function with a custom format to interpret the extracted parts
    const parsedDate = parse(`${parts[1]} ${parts[2]} ${parts[3]}`, 'd MMMM yyyy', new Date());

    // Return the date in "YYYY-MM-DD" format
    return format(parsedDate, 'yyyy-MM-dd');
}

const StravaChartComponent: React.FC<StravaChartProps> = ({ processedData, isLoading }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    const processedDataWithStandardDates = processedData.map(data => ({
        ...data,
        day: convertDateString(data.day), // Convert to a format that can be parsed
    }));
        // console.log('Day:', processedData);


    useEffect(() => {
        const handleResize = () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.resize();
            }
        };

        const annotationType: 'label' = 'label'; // Correctly typed

        const tagAnnotations = processedDataWithStandardDates.flatMap((data, index) => {
            // Now using processedDataWithStandardDates
            return (data.tags ?? []).map(tag => ({
                type: annotationType,
                content: tag,
                xValue: data.day, // Ensure this uses the converted date
                backgroundColor: 'rgba(255, 99, 132, 0.25)',
                rotation: -90,
            }));
        });
        

        if (!isLoading && processedData.length > 0 && chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                chartInstanceRef.current?.destroy();

                const hasHRVData = processedData.some(data => data.averageSleepHRV != null);
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
                        data: processedData.map(data => data.averageSleepHRV ?? 0),
                        borderColor: '#8338ec',
                        tension: 0.4,
                        pointRadius: 0,
                        yAxisID: hasWattsData ? 'y1' : 'y',
                    });
                }

                const chartConfig: ChartConfiguration<'line', number[], string> = {
                    type: 'line',
                    data: {
                        labels: processedDataWithStandardDates.map(data => data.day), // Use converted dates
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
                            y: {
                                grid: {
                                    drawOnChartArea: true, // Keeps your previous setting for horizontal grid lines
                                },
                            },
                            ...(hasHRVData && hasWattsData && {
                                y1: {
                                    position: 'right',
                                    grid: {
                                        drawOnChartArea: false, // Keeps your adjustment based on axis preference
                                    },
                                }
                            }),
                        },
                                         
                        plugins: {
                            legend: {
                                display: window.innerWidth > 600, // Only show legend if window width is greater than 600px
                            },
                            annotation: {
                                annotations: tagAnnotations,
                            },
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