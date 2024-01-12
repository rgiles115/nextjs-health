import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { eachDayOfInterval, format, parseISO } from 'date-fns';
import dynamic from 'next/dynamic';

const Loading = dynamic(() => import('./Loading'), { ssr: false });

Chart.register(...registerables);

interface Activity {
  day: string;
  distance: number;
  average_watts: number;
  start_date: string;
  moving_time: number;
  total_elevation_gain: number;
}

declare global {
  interface Window {
    myStravaChart: Chart | undefined;
  }
}

const ClientStravaActivitiesChart: React.FC<{ startDate: Date; endDate: Date }> = ({ startDate, endDate }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [totalElevationGain, setTotalElevationGain] = useState<number>(0);

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  const fetchActivities = async () => {
    setIsLoading(true); // Start loading
    const startTimestamp = startDate.getTime() / 1000;
    const endTimestamp = endDate.getTime() / 1000;
    const response = await fetch(`/api/getStravaActivities?start_date=${startTimestamp}&end_date=${endTimestamp}`);
    const data = await response.json();

    const dateSeries = eachDayOfInterval({ start: startDate, end: endDate }).map((day) =>
      format(day, 'yyyy-MM-dd')
    );

    let totalDistanceTemp = 0;

    // Reset the total elevation gain before fetching new activities
    setTotalElevationGain(0);

    const activitiesDict = data.reduce(
      (acc: { [key: string]: { distance: number; total_elevation_gain: number; moving_time: number; weighted_watts: number } }, activity: Activity) => {
        const sortableDate = format(parseISO(activity.start_date), 'yyyy-MM-dd');

        if (acc[sortableDate]) {
          acc[sortableDate].distance += activity.distance;
          acc[sortableDate].total_elevation_gain += activity.total_elevation_gain;
          acc[sortableDate].moving_time += activity.moving_time;
          acc[sortableDate].weighted_watts +=
            (activity.average_watts * activity.moving_time) / 3600;
        } else {
          acc[sortableDate] = {
            distance: activity.distance,
            total_elevation_gain: activity.total_elevation_gain,
            moving_time: activity.moving_time,
            weighted_watts: (activity.average_watts * activity.moving_time) / 3600,
          };
        }

        return acc;
      }, {});

    const filledActivities = dateSeries.map((day) => {
      const activitiesForDate = data.filter((activity: Activity) => {
        const sortableDate = format(parseISO(activity.start_date), 'yyyy-MM-dd');
        return sortableDate === day;
      });

      if (activitiesForDate.length === 0) {
        return {
          day: format(parseISO(day), 'do MMM yyyy'),
          distance: 0,
          total_elevation_gain: 0,
          average_watts: 0,
          moving_time: 0,
          start_date: format(parseISO(day), 'do MMM yyyy'),
        };
      }

      const totalDistance = activitiesForDate.reduce((acc: number, activity: Activity) => {
        return acc + activity.distance / 1000;
      }, 0);

      totalDistanceTemp += totalDistance;

      const totalElevation = activitiesForDate.reduce((acc: number, activity: Activity) => acc + activity.total_elevation_gain, 0);

      // Update the total elevation gain
      setTotalElevationGain(prevElevation => prevElevation + totalElevation);

      const totalMovingTime = activitiesForDate.reduce((acc: number, activity: Activity) => {
        return acc + activity.moving_time;
      }, 0);

      const weightedAverageWatts = activitiesForDate.reduce((acc: number, activity: Activity) => {
        const activityPercentage = activity.moving_time / totalMovingTime;
        return acc + activity.average_watts * activityPercentage;
      }, 0);

      return {
        day: format(parseISO(day), 'do MMM yyyy'),
        distance: totalDistance,
        total_elevation_gain: totalElevation,
        average_watts: weightedAverageWatts,
        moving_time: totalMovingTime,
        start_date: format(parseISO(day), 'do MMM yyyy'),
      };
    });

    setActivities(filledActivities);
    setTotalDistance(totalDistanceTemp);
    setIsLoading(false); // Stop loading after data is fetched
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
            labels: activities.map((a) => a.day),
            datasets: [
              {
                label: 'Distance',
                data: activities.map((a) => a.distance),
                pointRadius: 0,
                borderColor: '#5da6b4', // Pale Turquoise
                tension: 0.4,
              },
              {
                label: 'Average Watts',
                data: activities.map((a) => a.average_watts),
                pointRadius: 0,
                borderColor: '#327388', // Teal Blue
                tension: 0.4,
              },
              {
                label: 'Elevation Gain',
                data: activities.map((a) => a.total_elevation_gain),
                pointRadius: 0,
                borderColor: '#57a0ae', // Soft Cyan
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
  
    handleResize();
  
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div>
    {isLoading ? (
        <div><Loading /></div> // Replace with a spinner or loading component
    ) : (
      <div className="graph-container">
      <div>
        <div id="totalTitle">Total Distance (km)</div>
        <div id="totalValue">{totalDistance.toFixed(2)}</div> {/* Display total distance */}
        <div id="totalTitle">Total Elevation Gain (m)</div>
        <div id="totalValue">{totalElevationGain}</div> {/* Display total elevation gain */}
        <canvas ref={chartRef} />
        <div id="viewOnStrava"><a href="https://strava.com/athletes/">View on Strava</a></div>
        </div>
        </div>
        )}
        </div>
  );
};

export default ClientStravaActivitiesChart;
