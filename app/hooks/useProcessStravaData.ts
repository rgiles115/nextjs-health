import { useState, useEffect } from 'react';
import { eachDayOfInterval, format, parseISO } from 'date-fns';
import { StravaActivity } from '../types/StravaInterface';

// Interface for the structure of processed Strava activities
interface ProcessedStravaActivity {
  day: string; // Date of the activity
  distance: number; // Total distance covered on the day (in kilometers)
  totalElevationGain: number; // Total elevation gain on the day
  averageWatts: number; // Calculated average watts for the day
  totalWeightedWatts: number; // Total weighted watts for all activities on the day
  totalDuration: number; // Total duration of all activities on the day (in the same unit as used in StravaActivity)
}

// Custom hook for processing raw Strava data within a specified date range
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
  // State hooks for storing processed data and overall statistics
  const [processedData, setProcessedData] = useState<ProcessedStravaActivity[]>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [totalElevationGain, setTotalElevationGain] = useState<number>(0);
  const [averageWatts, setAverageWatts] = useState<number>(0);

  useEffect(() => {
    // Early return if stravaData is not an array or is empty
    if (!Array.isArray(stravaData) || stravaData.length === 0) {
      setProcessedData([]);
      return;
    }

    // Create a series of dates between the start and end dates
    const dateSeries = eachDayOfInterval({ start: startDate, end: endDate }).map(day =>
      format(day, 'yyyy-MM-dd')
    );

    // Initialize the processed data array with structure for each day in the date range
    const processed: ProcessedStravaActivity[] = dateSeries.map(date => ({
      day: date,
      distance: 0,
      totalElevationGain: 0,
      averageWatts: 0,
      totalWeightedWatts: 0,
      totalDuration: 0,
    }));

    // Temporary variables for aggregate calculations
    let totalDistanceTemp = 0;
    let totalElevationGainTemp = 0;
    let totalWeightedWattsTemp = 0;
    let totalDurationTemp = 0;

    // Process each activity
    stravaData.forEach(activity => {
      const activityDate = format(parseISO(activity.start_date), 'yyyy-MM-dd');
      const index = dateSeries.indexOf(activityDate);
      if (index !== -1) {
        // Update distance and elevation gain for the day
        processed[index].distance += activity.distance / 1000; // Convert meters to kilometers
        processed[index].totalElevationGain += activity.total_elevation_gain;
        
        // If average watts is available, calculate weighted watts and update duration
        if (activity.average_watts) {
          const duration = activity.elapsed_time; // Use elapsed_time or another appropriate field for duration
          const weightedWatts = activity.average_watts * duration;
          processed[index].totalWeightedWatts += weightedWatts;
          processed[index].totalDuration += duration;
          totalWeightedWattsTemp += weightedWatts;
          totalDurationTemp += duration;
        }

        // Update temporary aggregate values
        totalDistanceTemp += activity.distance / 1000; // Convert meters to kilometers
        totalElevationGainTemp += activity.total_elevation_gain;
      }
    });

    // Calculate overall average watts using total weighted watts and total duration
    const averageWattsTemp = totalDurationTemp > 0 ? totalWeightedWattsTemp / totalDurationTemp : 0;

    // Set the processed data and overall statistics
    setProcessedData(processed.map(activity => ({
      ...activity,
      averageWatts: activity.totalDuration > 0 ? activity.totalWeightedWatts / activity.totalDuration : 0,
    })));
    setTotalDistance(totalDistanceTemp);
    setTotalElevationGain(totalElevationGainTemp);
    setAverageWatts(averageWattsTemp);
  }, [stravaData, startDate, endDate]); // Dependency array to trigger re-calculation when any of these values change

  // Return the processed data and aggregate statistics
  return { processedData, totalDistance, totalElevationGain, averageWatts };
};

export default useProcessStravaData;
