import { useState, useEffect } from 'react';
import { StravaActivity, YtdRideTotals } from '../types/StravaInterface';

// Assuming isStravaAuthed could be undefined initially, to represent an undetermined state
const useFetchStravaActivities = (startDate: Date, endDate: Date, isStravaAuthed: boolean | undefined) => {
  const [activities, setActivities] = useState<StravaActivity[] | null>(null);
  const [ytdRideTotals, setYtdRideTotals] = useState<YtdRideTotals | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If authentication status is undetermined, skip fetching
    if (isStravaAuthed === undefined) {
      console.log("Authentication status undetermined, waiting...");
      return;
    }

    // Proceed with fetching only if authenticated
    if (!isStravaAuthed) {
      console.log("Strava is not authenticated, skipping fetch.");
      setIsLoading(false);
      setError('Not authenticated for Strava.');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0); // Adjust startDate to the beginning of the day
      const startTimestamp = Math.floor(startOfDay.getTime() / 1000);

      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999); // Adjust endDate to the end of the day
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
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, isStravaAuthed]); // Including isStravaAuthed in the dependency array

  return { activities, ytdRideTotals, isLoading, error };
};

export default useFetchStravaActivities;