import { useState, useEffect } from 'react';
import { eachDayOfInterval, format, parseISO } from 'date-fns';
import { StravaActivity } from '../types/StravaInterface';

interface ProcessedStravaActivity {
  day: string;
  distance: number;
  totalElevationGain: number;
  averageWatts: number;
  totalWeightedWatts: number;
  totalDuration: number;
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
    if (!Array.isArray(stravaData) || stravaData.length === 0) {
      setProcessedData([]);
      return;
    }

    const dateSeries = eachDayOfInterval({ start: startDate, end: endDate }).map(day =>
      format(day, 'yyyy-MM-dd')
    );

    const processed: ProcessedStravaActivity[] = dateSeries.map(date => ({
      day: date,
      distance: 0,
      totalElevationGain: 0,
      averageWatts: 0,
      totalWeightedWatts: 0,
      totalDuration: 0,
    }));

    let totalDistanceTemp = 0;
    let totalElevationGainTemp = 0;
    let totalWeightedWattsTemp = 0;
    let totalDurationTemp = 0;

    stravaData.forEach(activity => {
      if (activity.type === 'Ride' || activity.type === 'VirtualRide') {
        const activityDate = format(parseISO(activity.start_date), 'yyyy-MM-dd');
        const index = dateSeries.indexOf(activityDate);
        if (index !== -1) {
          processed[index].distance += activity.distance / 1000;
          processed[index].totalElevationGain += activity.total_elevation_gain;
          
          if (activity.average_watts) {
            const duration = activity.elapsed_time;
            const weightedWatts = activity.average_watts * duration;
            processed[index].totalWeightedWatts += weightedWatts;
            processed[index].totalDuration += duration;
            totalWeightedWattsTemp += weightedWatts;
            totalDurationTemp += duration;
          }
          
          totalDistanceTemp += activity.distance / 1000;
          totalElevationGainTemp += activity.total_elevation_gain;
        }
      }
    });

    const averageWattsTemp = totalDurationTemp > 0 ? totalWeightedWattsTemp / totalDurationTemp : 0;

    setProcessedData(processed.map(activity => ({
      ...activity,
      averageWatts: activity.totalDuration > 0 ? activity.totalWeightedWatts / activity.totalDuration : 0,
    })));
    setTotalDistance(totalDistanceTemp);
    setTotalElevationGain(totalElevationGainTemp);
    setAverageWatts(averageWattsTemp);
  }, [stravaData, startDate, endDate]);

  return { processedData, totalDistance, totalElevationGain, averageWatts };
};

export default useProcessStravaData;
