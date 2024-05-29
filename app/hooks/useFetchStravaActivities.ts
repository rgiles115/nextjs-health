// Import necessary hooks from React for managing state and side effects.
import { useState, useEffect } from 'react';
// Import the types for Strava activities and yearly total ride statistics.
import { StravaActivity, YtdRideTotals } from '../types/StravaInterface';

// Custom hook that accepts start and end dates for fetching activities, and a boolean or undefined for authentication status.
const useFetchStravaActivities = (startDate: Date, endDate: Date, isStravaAuthed: boolean | undefined) => {
  // State for holding the fetched activities. Initially null.
  const [activities, setActivities] = useState<StravaActivity[] | null>(null);
  // State for holding yearly total ride statistics. Initially null.
  const [ytdRideTotals, setYtdRideTotals] = useState<YtdRideTotals | null>(null);
  // State to track if the data is currently being loaded.
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // State to hold any errors that occur during the fetch process.
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip fetching if authentication status is undetermined.
    if (isStravaAuthed === undefined) {
      // console.log("Authentication status undetermined, waiting...");
      return;
    }

    // Skip fetching and log a message if not authenticated.
    if (!isStravaAuthed) {
      // console.log("Strava is not authenticated, skipping fetch.");
      setIsLoading(false); // Ensure loading state is false.
      return;
    }

    // Asynchronous function to fetch data from the API.
    const fetchData = async () => {
      setIsLoading(true); // Indicate the start of fetching data.
      setError(null); // Reset any previous errors.

      // Adjust the start date to the beginning of the day.
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      const startTimestamp = Math.floor(startOfDay.getTime() / 1000);

      // Adjust the end date to the end of the day.
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      const endTimestamp = Math.floor(endOfDay.getTime() / 1000);

      try {
        // Fetch activities from the API using adjusted start and end timestamps.
        const response = await fetch(`/api/getStravaActivities?start_date=${startTimestamp}&end_date=${endTimestamp}`);
        if (!response.ok) {
          // Throw an error if the response is not ok.
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json(); // Parse the JSON response.
        // Update state with the fetched activities and yearly totals.
        setActivities(result.activities);
        setYtdRideTotals(result.ytdRideTotals);
      } catch (error) {
        // Handle any errors that occur during fetching.
        console.error("Failed to fetch Strava activities:", error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false); // Ensure loading state is false once fetching is complete.
      }
    };

    fetchData(); // Invoke the fetchData function to start the process.
  }, [startDate, endDate, isStravaAuthed]); // Rerun the effect if any of these dependencies change.

  // Return the fetched data, loading state, and any errors to the hook's consumer.
  return { activities, ytdRideTotals, isLoading, error };
};

// Export the custom hook for use in other parts of the application.
export default useFetchStravaActivities;