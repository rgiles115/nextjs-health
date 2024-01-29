import React, { useRef, useEffect } from 'react';
import { Chart, ChartConfiguration } from 'chart.js';
import 'chartjs-adapter-date-fns';

interface ProcessedDataItem {
    day: string; // or Date, depending on your data structure
    distance: number;
    average_watts: number;
    total_elevation_gain: number;
    // Add other fields as necessary
}

interface StravaChartProps {
    processedData: ProcessedDataItem[];
    isLoading: boolean;
}

const StravaChart: React.FC<StravaChartProps> = ({ processedData, isLoading }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (processedData.length > 0 && chartRef.current) {
          const ctx = chartRef.current.getContext('2d');
          if (ctx) {
            chartInstanceRef.current?.destroy(); // Destroy previous chart instance if exists
    
            const chartConfig: ChartConfiguration = {
              type: 'line',
              data: {
                labels: processedData.map((a) => a.day),
                datasets: [
                  {
                    label: 'Distance',
                    data: processedData.map((a) => a.distance),
                    pointRadius: 0,
                    borderColor: '#219ebc',
                    tension: 0.4,
                  },
                  {
                    label: 'Average Watts',
                    data: processedData.map((a) => a.average_watts),
                    pointRadius: 0,
                    borderColor: '#ffb703',
                    tension: 0.4,
                  },
                  {
                    label: 'Elevation Gain',
                    data: processedData.map((a) => a.total_elevation_gain),
                    pointRadius: 0,
                    borderColor: '#fb8500',
                    tension: 0.4,
                  },
                ],
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
                      maxTicksLimit: 10,
                    },
                    grid: {
                      display: false,
                    },
                  },
                  y: {
                    grid: {
                      display: false,
                    }
                  }
                },
                plugins: {
                  tooltip: {
                    enabled: true,
                  },
                },
              },
    
         };
    
            chartInstanceRef.current = new Chart(ctx, chartConfig);
          }
        }
    
        return () => {
          chartInstanceRef.current?.destroy();
        };
      }, [processedData]);

      useEffect(() => {
        const handleResize = () => {
          chartInstanceRef.current?.resize();
        };
    
        window.addEventListener('resize', handleResize);
        handleResize();
    
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }, []);

    return (
        <div>
            {isLoading ? <div></div> : (
                <div className="graph-container">
                    <canvas ref={chartRef} />
                </div>
            )}
        </div>
    );
};

export default StravaChart;
