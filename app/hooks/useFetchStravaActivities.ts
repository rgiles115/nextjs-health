import { useState, useEffect } from 'react';
import { StravaActivity, YtdRideTotals } from '../types/StravaInterface';

// Added isStravaAuthed as a parameter to the hook
const useFetchStravaActivities = (startDate: Date, endDate: Date, isStravaAuthed: boolean) => {
  const [activities, setActivities] = useState<StravaActivity[] | null>(null);
  const [ytdRideTotals, setYtdRideTotals] = useState<YtdRideTotals | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Added a state variable for error handling

  useEffect(() => {
    if (!isStravaAuthed) {
      console.log("Strava is not authenticated, skipping fetch.");
      setIsLoading(false);
      setError('Not authenticated for Strava.'); // Set an error message for lack of authentication
      return; // Exit early as we do not want to proceed with the fetch
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null); // Reset the error state before attempting a new fetch

      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0); // Adjusts startDate to the beginning of the day
      const startTimestamp = Math.floor(startOfDay.getTime() / 1000);

      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999); // Adjusts endDate to the end of the day
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
        setError(error instanceof Error ? error.message : 'An unknown error occurred'); // Capture and set any errors that occur during the fetch
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, isStravaAuthed]); // Dependencies include isStravaAuthed

  return { activities, ytdRideTotals, isLoading, error }; // Return the error state along with other states
};

export default useFetchStravaActivities;
