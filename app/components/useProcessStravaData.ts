// useProcessStravaData.js
import { useState, useEffect } from 'react';
import { eachDayOfInterval, format, parseISO } from 'date-fns';
import { Activity } from '../types/activityTypes';
import { StravaActivity } from '../types/StravaInterface';

const useProcessStravaData = (stravaData: StravaActivity[] | null, startDate: Date, endDate: Date): { processedData: Activity[], totalDistance: number, totalElevationGain: number } => {
    const [processedData, setProcessedData] = useState<Activity[]>([]);
    const [totalDistance, setTotalDistance] = useState<number>(0);
    const [totalElevationGain, setTotalElevationGain] = useState<number>(0);
  
    useEffect(() => {
      if (stravaData) {
        let totalDistanceTemp = 0;
        let elevationGainTemp = 0;
        const dateSeries = eachDayOfInterval({ start: startDate, end: endDate }).map(day =>
            format(day, 'yyyy-MM-dd')
          );
      
          // Reset the total elevation gain before fetching new activities
          setTotalElevationGain(0);
      
          const activitiesDict = stravaData.reduce(
            (acc: { [key: string]: { distance: number; total_elevation_gain: number; moving_time: number; weighted_watts: number } }, activity: StravaActivity) => {
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
            const activitiesForDate = stravaData.filter((activity: StravaActivity) => {
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
      
            const totalDistance = activitiesForDate.reduce((acc: number, activity: StravaActivity) => {
              return acc + activity.distance / 1000; // Assuming distance is in meters and you want to convert it to kilometers
            }, 0);
            
      
            totalDistanceTemp += totalDistance;
      
            const totalElevation = activitiesForDate.reduce((acc: number, activity: StravaActivity) => acc + activity.total_elevation_gain, 0);
            elevationGainTemp += totalElevation; // Correctly accumulate elevation gain

      
            const totalMovingTime = activitiesForDate.reduce((acc: number, activity: StravaActivity) => {
              return acc + activity.moving_time;
            }, 0);
      
            const weightedAverageWatts = activitiesForDate.reduce((acc: number, activity: StravaActivity) => {
              const activityPercentage = activity.moving_time / totalMovingTime;
              return acc + activity.average_watts * activityPercentage;
            }, 0);
      
            return {
              day: format(parseISO(day), 'do MMM yyyy'),
              distance: totalDistance, // Convert to string
              total_elevation_gain: totalElevation, // Convert to string
              average_watts: weightedAverageWatts,
              moving_time: totalMovingTime,
              start_date: format(parseISO(day), 'do MMM yyyy'),
            };
          });
      
      // At the end of your logic:
      setProcessedData(filledActivities);
      setTotalDistance(totalDistanceTemp);
      setTotalElevationGain(elevationGainTemp);
    }
  }, [stravaData, startDate, endDate]);
  return { processedData, totalDistance, totalElevationGain };
};

export default useProcessStravaData;
