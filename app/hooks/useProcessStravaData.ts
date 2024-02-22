//This hook simplifies the process of aggregating and analyzing Strava
// activity data over a specified period, making it easier to display
// summarized or detailed insights about an athlete's performance so that
// it can be sent to ChatGPT for analysis and not use too many tokens.

// Import necessary hooks and utility functions from React and date-fns.
import { useState, useEffect } from 'react';
import { eachDayOfInterval, format, parseISO } from 'date-fns';
// Import the StravaActivity type for type safety.
import { StravaActivity } from '../types/StravaInterface';

// Define a structure for the processed Strava activities.
interface ProcessedStravaActivity {
  day: string; // The date of the activity
  distance: number; // Total distance covered
  totalElevationGain: number; // Total elevation gained
  averageWatts: number; // Average power output
}

// The custom hook accepting raw Strava data and a date range as inputs.
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
  // State hooks for storing processed data and aggregate statistics.
  const [processedData, setProcessedData] = useState<ProcessedStravaActivity[]>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [totalElevationGain, setTotalElevationGain] = useState<number>(0);
  const [averageWatts, setAverageWatts] = useState<number>(0);

  useEffect(() => {
    // Check if stravaData is an array and not empty before proceeding.
    if (!Array.isArray(stravaData) || stravaData.length === 0) {
      setProcessedData([]);
      return;
    }

    // Create a series of dates between startDate and endDate.
    const dateSeries = eachDayOfInterval({ start: startDate, end: endDate }).map(day =>
      format(day, 'yyyy-MM-dd')
    );

    // Initialize an array to hold processed data for each date in the interval.
    const processed: ProcessedStravaActivity[] = dateSeries.map(date => ({
      day: date,
      distance: 0,
      totalElevationGain: 0,
      averageWatts: 0,
    }));

    // Temporary variables to hold aggregate values.
    let totalDistanceTemp = 0;
    let totalElevationGainTemp = 0;
    let totalWattsTemp = 0;
    let wattActivitiesCount = 0; // Count of activities with average watts recorded.

    // Iterate over each Strava activity to aggregate data.
    stravaData.forEach(activity => {
      const activityDate = format(parseISO(activity.start_date), 'yyyy-MM-dd');
      const index = dateSeries.indexOf(activityDate);
      if (index !== -1) { // If the activity date is within the range.
        processed[index].distance += activity.distance / 1000; // Convert distance from meters to kilometers.
        processed[index].totalElevationGain += activity.total_elevation_gain;
        if (activity.average_watts) {
          processed[index].averageWatts += activity.average_watts;
          totalWattsTemp += activity.average_watts;
          wattActivitiesCount++;
        }
        totalDistanceTemp += activity.distance / 1000; // Update aggregate distance.
        totalElevationGainTemp += activity.total_elevation_gain; // Update aggregate elevation gain.
      }
    });

    // Calculate the average watts across all activities.
    const averageWattsTemp = wattActivitiesCount > 0 ? totalWattsTemp / wattActivitiesCount : 0;

    // Set the state with the processed and aggregated data.
    setProcessedData(processed.map(activity => ({
      ...activity,
      // Calculate average watts per activity, if applicable.
      averageWatts: activity.averageWatts > 0 ? activity.averageWatts / wattActivitiesCount : 0
    })));
    setTotalDistance(totalDistanceTemp);
    setTotalElevationGain(totalElevationGainTemp);
    setAverageWatts(averageWattsTemp);
  }, [stravaData, startDate, endDate]); // Depend on stravaData, startDate, and endDate to re-run the effect when they change.

  // Return the processed data and aggregate statistics.
  return { processedData, totalDistance, totalElevationGain, averageWatts };
};

// Export the custom hook for use elsewhere in the application.
export default useProcessStravaData;