import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { eachDayOfInterval, format, parseISO } from 'date-fns';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMountain, faRoad  } from "@fortawesome/free-solid-svg-icons";
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
        distance: totalDistance.toLocaleString('en-US'),
        total_elevation_gain: totalElevation.toLocaleString('en-US'),
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
                borderColor: '#219ebc', // Blue
                tension: 0.4,
              },
              {
                label: 'Average Watts',
                data: activities.map((a) => a.average_watts),
                pointRadius: 0,
                borderColor: '#ffb703', // Yellow
                tension: 0.4,
              },
              {
                label: 'Elevation Gain',
                data: activities.map((a) => a.total_elevation_gain),
                pointRadius: 0,
                borderColor: '#fb8500', // Orange
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
      <div>
        <div className="parent-number-container">
      
        <div className="number-container">
          <FontAwesomeIcon icon={faRoad} className="icon" style={{ color: "#219ebc" }} />  
          <div className="total-distance">
            <div className="total-value">{totalDistance.toFixed(2)}</div>
            <div className="total-title">TOTAL KILOMETERS</div>
          </div>
          <div className="divider"></div>
        </div>
        <div className="number-container">
          <FontAwesomeIcon icon={faMountain} className="icon" style={{ color: "#fb8500" }} />  
          <div className="total-distance">
            <div className="total-value">{totalElevationGain}</div>
            <div className="total-title">TOTAL ELEVATION</div>
          </div>
          <div className="divider"></div>
        </div>
        </div>
        <div className="graph-container">
          <canvas ref={chartRef} />
          <div id="viewOnStrava"><a href="https://strava.com/athletes/">View on Strava</a></div>
        </div>
      </div>
        
        )}
      </div>
  );
};

export default ClientStravaActivitiesChart;
