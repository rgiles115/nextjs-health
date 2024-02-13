import { useState, useEffect } from 'react';
import { eachDayOfInterval, format, parseISO } from 'date-fns';
import { StravaActivity } from '../types/StravaInterface';

interface ProcessedStravaActivity {
  day: string;
  distance: number;
  totalElevationGain: number;
  averageWatts: number;
}

const useProcessStravaData = (
  stravaData: StravaActivity[] | null,
  startDate: Date,
  endDate: Date
): {
  processedData: ProcessedStravaActivity[];
  totalDistance: number;
  totalElevationGain: number;
  averageWatts: number;
} => {
  const [processedData, setProcessedData] = useState<ProcessedStravaActivity[]>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [totalElevationGain, setTotalElevationGain] = useState<number>(0);
  const [averageWatts, setAverageWatts] = useState<number>(0);

  useEffect(() => {
    // Ensure stravaData is an array before proceeding
    if (!Array.isArray(stravaData) || stravaData.length === 0) {
      setProcessedData([]);
      return;
    }

    const dateSeries = eachDayOfInterval({ start: startDate, end: endDate }).map(day =>
      format(day, 'yyyy-MM-dd')
    );

    // Initialize processed array with dates in the interval
    const processed: ProcessedStravaActivity[] = dateSeries.map(date => ({
      day: date,
      distance: 0,
      totalElevationGain: 0,
      averageWatts: 0,
    }));

    let totalDistanceTemp = 0;
    let totalElevationGainTemp = 0;
    let totalWattsTemp = 0;
    let wattActivitiesCount = 0;

    stravaData.forEach(activity => {
      const activityDate = format(parseISO(activity.start_date), 'yyyy-MM-dd');
      const index = dateSeries.indexOf(activityDate);
      if (index !== -1) {
        processed[index].distance += activity.distance / 1000; // Assuming distance is in meters
        processed[index].totalElevationGain += activity.total_elevation_gain;
        if (activity.average_watts) {
          processed[index].averageWatts += activity.average_watts;
          totalWattsTemp += activity.average_watts;
          wattActivitiesCount++;
        }
        totalDistanceTemp += activity.distance / 1000;
        totalElevationGainTemp += activity.total_elevation_gain;
      }
    });

    const averageWattsTemp = wattActivitiesCount > 0 ? totalWattsTemp / wattActivitiesCount : 0;

    setProcessedData(processed.map(activity => ({
      ...activity,
      averageWatts: activity.averageWatts > 0 ? activity.averageWatts / wattActivitiesCount : 0
    })));
    setTotalDistance(totalDistanceTemp);
    setTotalElevationGain(totalElevationGainTemp);
    setAverageWatts(averageWattsTemp);
  }, [stravaData, startDate, endDate]);

  return { processedData, totalDistance, totalElevationGain, averageWatts };
};

export default useProcessStravaData;
