import { useState, useEffect } from 'react';
import { StravaActivity, YtdRideTotals } from '../types/StravaInterface';

// Added isStravaAuthed as a parameter to the hook
const useFetchStravaActivities = (startDate: Date, endDate: Date, isStravaAuthed: boolean) => {
  const [activities, setActivities] = useState<StravaActivity[] | null>(null);
  const [ytdRideTotals, setYtdRideTotals] = useState<YtdRideTotals | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if Strava is authenticated before fetching
    if (!isStravaAuthed) {
      console.log("Strava is not authenticated, skipping fetch.");
      // Optionally, you can set activities and ytdRideTotals to null here if you want to reset the state
      // setActivities(null);
      // setYtdRideTotals(null);
      setIsLoading(false); // Make sure to set loading to false as we're not fetching
      return; // Exit early as we do not want to proceed with the fetch
    }

    const fetchData = async () => {
      setIsLoading(true);

      // Adjust startDate to the beginning of the day
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0); // Sets to beginning of the day
      const startTimestamp = Math.floor(startOfDay.getTime() / 1000);

      // Adjust endDate to the end of the day
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999); // Sets to end of the day
      const endTimestamp = Math.floor(endOfDay.getTime() / 1000);

      try {
        const response = await fetch(`/api/getStravaActivities?start_date=${startTimestamp}&end_date=${endTimestamp}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setActivities(result.activities);
        setYtdRideTotals(result.ytdRideTotals);
      } catch (error) {
        console.error("Failed to fetch Strava activities:", error);
        setActivities(null);
        setYtdRideTotals(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, isStravaAuthed]); // Make sure to include isStravaAuthed as a dependency

  return { activities, ytdRideTotals, isLoading };
};

export default useFetchStravaActivities;
