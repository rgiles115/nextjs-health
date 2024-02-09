// Importing necessary modules and components from React, Chart.js, and Next.js
import React, { useRef, useEffect } from 'react';
import { Chart, ChartConfiguration } from 'chart.js';
import 'chartjs-adapter-date-fns'; // For date handling within charts
import dynamic from 'next/dynamic';

// Interface for individual processed Strava activity data
interface ProcessedStravaActivity {
    day: string; // The day of the activity
    distance: number; // Distance covered in the activity
    totalElevationGain: number; // Total elevation gain during the activity
    averageHRV?: number; // Optional average Heart Rate Variability
    averageWatts?: number; // Optional average Watts generated
}

// Props for the StravaChart component
interface StravaChartProps {
    processedData: ProcessedStravaActivity[]; // Array of processed Strava activities
    isLoading: boolean; // Loading state to manage rendering
}

// Dynamically import the Loading component for better performance
const Loading = dynamic(() => import('./Loading'), { ssr: false });

// Functional component definition using React.FC with StravaChartProps as props
const StravaChartComponent: React.FC<StravaChartProps> = ({ processedData, isLoading }) => {
    const chartRef = useRef<HTMLCanvasElement>(null); // Ref for the canvas element
    const chartInstanceRef = useRef<Chart | null>(null); // Ref to store the Chart.js instance

    // useEffect hook to create or update the chart when processedData or isLoading changes
    useEffect(() => {
        // Only proceed if not loading, data is available, and the canvas ref is current
        if (!isLoading && processedData.length > 0 && chartRef.current) {
            const ctx = chartRef.current.getContext('2d'); // Get the rendering context
            if (ctx) {
                chartInstanceRef.current?.destroy(); // Destroy any existing chart instance

                // Check for the presence of HRV and Watts data in the dataset
                const hasHRVData = processedData.some(data => data.averageHRV != null);
                const hasWattsData = processedData.some(data => data.averageWatts != null);

                // Define datasets for the chart
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

                // Conditionally add datasets for Watts and HRV if data is present
                if (hasWattsData) {
                    datasets.push({
                        label: 'Average Watts',
                        data: processedData.map(data => data.averageWatts ?? 0), // Replace null with 0
                        borderColor: '#ffbe0b',
                        tension: 0.4,
                        pointRadius: 0,
                        yAxisID: 'y',
                    });
                }

                if (hasHRVData) {
                    datasets.push({
                        label: 'Average HRV',
                        data: processedData.map(data => data.averageHRV ?? 0), // Replace null with 0
                        borderColor: '#8338ec',
                        tension: 0.4,
                        pointRadius: 0,
                        yAxisID: hasWattsData ? 'y1' : 'y', // Use a separate axis if both HRV and Watts data are present
                    });
                }

                // Chart configuration
                const chartConfig: ChartConfiguration<'line', number[], string> = {
                    type: 'line',
                    data: {
                        labels: processedData.map(data => data.day), // Use the day as labels
                        datasets,
                    },
                    options: {
                        scales: {
                            y: { // Configure the primary Y axis
                                position: 'left',
                            },
                            ...(hasHRVData && hasWattsData && {
                                y1: { // Optionally configure a secondary Y axis
                                    position: 'right',
                                    grid: {
                                        drawOnChartArea: false, // Avoid drawing grid lines for the secondary axis on the chart area
                                    },
                                }
                            }),
                        },
                    },
                };

                // Initialize the chart with the config
                chartInstanceRef.current = new Chart(ctx, chartConfig);
            }
        }

        // Cleanup function to destroy the chart instance when the component unmounts
        return () => {
            chartInstanceRef.current?.destroy();
        };
    }, [processedData, isLoading]); // Depend on processedData and isLoading to re-run the effect
    console.log('Rendering Strava Chart');

    // Render the component
    return (
        <div>
            {isLoading ? (
                <Loading /> // Show loading component if data is still loading
            ) : (
                <div style={{ height: '300px', width: '100%' }}>
                    <canvas ref={chartRef} /> 
                </div>
            )}
        </div>
    );
};

// Function to compare props to prevent unnecessary re-renders
const areEqual = (prevProps: StravaChartProps, nextProps: StravaChartProps) => {
    return prevProps.isLoading === nextProps.isLoading &&
        prevProps.processedData === nextProps.processedData; // Simple comparison, consider deeper comparison if necessary
};

// Wrap the component with React.memo for performance optimization
const StravaChart = React.memo(StravaChartComponent, areEqual);

export default StravaChart; // Export the component for use in other parts of the application
