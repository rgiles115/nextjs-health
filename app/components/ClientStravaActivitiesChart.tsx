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
  moving_time: number; // Add moving_time property
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

    const dateSeries = eachDayOfInterval({ start: startDate, end: endDate }).map((date) =>
      format(date, 'yyyy-MM-dd')
    );

    const activitiesDict = data.reduce(
      (
        acc: { [key: string]: { distance: number; moving_time: number; weighted_watts: number } },
        activity: Activity
      ) => {
        const sortableDate = format(parseISO(activity.start_date), 'yyyy-MM-dd');

        if (acc[sortableDate]) {
          acc[sortableDate].distance += activity.distance;
          acc[sortableDate].moving_time += activity.moving_time;
          acc[sortableDate].weighted_watts +=
            (activity.average_watts * activity.moving_time) / 3600; // Calculate weighted watts
        } else {
          acc[sortableDate] = {
            distance: activity.distance,
            moving_time: activity.moving_time,
            weighted_watts: (activity.average_watts * activity.moving_time) / 3600,
          };
        }

        return acc;
      },
      {}
    );

    const filledActivities = dateSeries.map((date) => {
      const activitiesForDate = data.filter((activity: Activity) => {
        const sortableDate = format(parseISO(activity.start_date), 'yyyy-MM-dd');
        return sortableDate === date;
      });

      if (activitiesForDate.length === 0) {
        // No activities for this date, create an entry with 0 values
        return {
          date: format(parseISO(date), 'do MMM yyyy'),
          distance: 0,
          average_watts: 0, // Set to 0 for days with no activity
          moving_time: 0, // Set to 0 for days with no activity
          start_date: format(parseISO(date), 'do MMM yyyy'),
        };
      }

      const totalDistance = activitiesForDate.reduce((acc: number, activity: Activity) => {
        return acc + activity.distance / 1000; // Convert meters to kilometers
      }, 0);

      const totalMovingTime = activitiesForDate.reduce((acc: number, activity: Activity) => {
        return acc + activity.moving_time;
      }, 0);

      // Calculate the weighted average watts
      const weightedAverageWatts = activitiesForDate.reduce((acc: number, activity: Activity) => {
        const activityPercentage = activity.moving_time / totalMovingTime;
        return acc + activity.average_watts * activityPercentage;
      }, 0);

      return {
        date: format(parseISO(date), 'do MMM yyyy'),
        distance: totalDistance,
        average_watts: weightedAverageWatts,
        moving_time: totalMovingTime,
        start_date: format(parseISO(date), 'do MMM yyyy'),
      };
    });

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
            labels: activities.map((a) => a.date),
            datasets: [
              {
                label: 'Distance',
                data: activities.map((a) => a.distance),
                pointRadius: 0,
              },
              {
                label: 'Average Watts', // Label for average watts
                data: activities.map((a) => a.average_watts), // Use the average_watts property
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
                  maxTicksLimit: 10,
                },
                grid: {
                  display: false,
                },
              },
            },
            plugins: {
              tooltip: {
                enabled: true,
              },
            },
          },
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

  return (
    <div>
      <canvas ref={chartRef} />
    </div>
  );
};

export default ClientStravaActivitiesChart;
