import React, { useRef, useEffect } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-date-fns';
import dynamic from 'next/dynamic';
import { format, parse } from 'date-fns';


Chart.register(...registerables, annotationPlugin);


interface ProcessedStravaActivity {
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

interface StravaChartProps {
    processedData: ProcessedStravaActivity[];
    isLoading: boolean;
    startDate: Date; // Adding startDate
    endDate: Date;   // Adding endDate
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

const StravaChartComponent: React.FC<StravaChartProps> = ({ processedData, isLoading, startDate, endDate }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    const processedDataWithStandardDates = processedData.map(data => ({
        ...data,
        day: convertDateString(data.day), // Convert to a format that can be parsed
    }));
    // console.log('Day:', processedData);


    useEffect(() => {


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
                        data: processedData.map(data => data.distance ?? 0),
                        borderColor: '#219ebc',
                        tension: 0.4,
                        pointRadius: 0,
                        yAxisID: 'y',
                    },
                    {
                        label: 'Elevation Gain (m)',
                        data: processedData.map(data => data.totalElevationGain ?? 0),
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
                                ticks: {
                                    autoSkip: true,
                                    maxRotation: 0,
                                    minRotation: 0,
                                    maxTicksLimit: 10
                                },
                                min: format(startDate, 'yyyy-MM-dd'), // Use formatted startDate
                                max: format(endDate, 'yyyy-MM-dd'),   // Use formatted endDate
                                grid: {
                                    display: false,
                                },

                            },
                            y: {
                                grid: {
                                    display: false,
                                },
                                ticks: {
                                    display: true,
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
                                display: false // Disable default legend
                            },
                            annotation: {
                                annotations: tagAnnotations,
                            },
                        },
                    },
                };


                chartInstanceRef.current = new Chart(ctx, chartConfig);
                createCustomLegend(chartInstanceRef.current); // Create custom legend after chart initialization

            }
        }


    }, [processedData, isLoading, startDate, endDate]); // Include startDate and endDate

    function createCustomLegend(chart: Chart) {
        const legendContainer = document.getElementById('strava-chart-legend');
        if (!legendContainer) return;

        legendContainer.innerHTML = ''; // Clear existing legend items
        chart.data.datasets.forEach((dataset, index) => {
            const legendItem = document.createElement('div');
            legendItem.className = 'custom-legend-item';

            const colorBox = document.createElement('div');
            colorBox.className = 'custom-legend-color-box';
            colorBox.style.backgroundColor = typeof dataset.borderColor === 'string' ? dataset.borderColor : 'grey';

            const labelText = document.createElement('span');
            labelText.textContent = dataset.label || '';
            colorBox.appendChild(labelText); // Place the text inside the color box

            legendItem.appendChild(colorBox);
            legendItem.onclick = function () {
                const meta = chart.getDatasetMeta(index);
                meta.hidden = meta.hidden === null ? true : !meta.hidden;
                chart.update();
            };
            legendContainer.appendChild(legendItem);
        });
    }

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
                <div className="graph-container">
                    <canvas ref={chartRef} />
                    <div id="strava-chart-legend" className="custom-legend-container"></div>
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