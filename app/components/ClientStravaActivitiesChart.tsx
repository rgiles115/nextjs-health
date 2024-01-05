// ClientStravaActivitiesChart.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { eachDayOfInterval, format, parseISO } from 'date-fns';

Chart.register(...registerables);

interface Activity {
  date: string;
  distance: number;
  average_watts: number;
  start_date: string;
}

declare global {
    interface Window {
      myStravaChart: Chart | undefined; // Define the type here (Chart or undefined)
    }
  }

const ClientStravaActivitiesChart: React.FC<{ startDate: Date; endDate: Date }> = ({ startDate, endDate }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);


  const fetchActivities = async () => {
    const startTimestamp = startDate.getTime() / 1000;
    const endTimestamp = endDate.getTime() / 1000;

    const response = await fetch(`/api/getStravaActivities?start_date=${startTimestamp}&end_date=${endTimestamp}`);
    const data = await response.json();

    const dateSeries = eachDayOfInterval({ start: startDate, end: endDate }).map(date =>
      format(date, 'yyyy-MM-dd')
    );

    const activitiesDict = data.reduce((acc: { [key: string]: number }, activity: Activity) => {
        const sortableDate = format(parseISO(activity.start_date), 'yyyy-MM-dd');
      acc[sortableDate] = activity.distance;
      return acc;
    }, {});

    const filledActivities = dateSeries.map(date => ({
        date: format(parseISO(date), 'do MMM yyyy'),
        distance: activitiesDict[date] ? activitiesDict[date] / 1000 : 0, // Convert meters to kilometers
        average_watts: activitiesDict[date] ? activitiesDict[date].average_watts : 0, // Add average_watts property
        start_date: format(parseISO(date), 'do MMM yyyy')
      }));
      

    setActivities(filledActivities);
  };

  useEffect(() => {
    fetchActivities();
  }, [startDate, endDate]);

  useEffect(() => {
    if (activities.length > 0 && chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        if (window.myStravaChart) {
          window.myStravaChart.destroy();
        }

        window.myStravaChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: activities.map(a => a.date),
            datasets: [
                {
                  label: 'Distance',
                  data: activities.map(a => a.distance),
                  pointRadius: 0,
                },
                {
                  label: 'Average Watts', // Label for average watts
                  data: activities.map(a => a.average_watts), // Use the average_watts property
                  pointRadius: 0,
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
                  maxTicksLimit: 10
                },
                grid: {
                  display: false
                }
              }
            }
          }
        });
      }
    }



    return () => {
      if (window.myStravaChart) {
        window.myStravaChart.destroy();
      }
    };
  }, [activities]);

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
  return <canvas ref={chartRef}></canvas>;
};

export default ClientStravaActivitiesChart;
