import React, { useEffect, useState, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { eachDayOfInterval, format, parseISO } from 'date-fns';

Chart.register(...registerables);

interface Activity {
  date: string;
  distance: number;
}

const StravaActivitiesChart: React.FC<{ startDate: Date, endDate: Date }> = ({ startDate, endDate }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const chartRef = useRef<HTMLCanvasElement>(null);

  const fetchActivities = async () => {
    const startTimestamp = startDate.getTime() / 1000;
    const endTimestamp = endDate.getTime() / 1000;

    const response = await fetch(`/api/getStravaActivities?start_date=${startTimestamp}&end_date=${endTimestamp}`);
    const data = await response.json();

    const dateSeries = eachDayOfInterval({ start: startDate, end: endDate }).map(date =>
      format(date, 'yyyy-MM-dd')
    );

    const activitiesDict = data.reduce((acc, activity) => {
      const sortableDate = format(parseISO(activity.start_date), 'yyyy-MM-dd');
      acc[sortableDate] = activity.distance;
      return acc;
    }, {});

    const filledActivities = dateSeries.map(date => ({
        date: format(parseISO(date), 'do MMM yyyy'),
        distance: activitiesDict[date] ? activitiesDict[date] / 1000 : 0 // Convert meters to kilometers
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
            datasets: [{
              label: 'Distance',
              data: activities.map(a => a.distance),
              pointRadius: 0
            }]
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

  return <canvas ref={chartRef}></canvas>;
};

export default StravaActivitiesChart;
