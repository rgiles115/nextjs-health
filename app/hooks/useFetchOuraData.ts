// Import necessary React hooks for managing state and side effects.
import { useState, useEffect } from 'react';
// Import the date formatting function from date-fns library.
import { format } from 'date-fns';
// Import the ReadinessData type for type safety and clarity.
import { ReadinessData } from '../../app/types/OuraInterfaces';

// Definition of the custom hook with parameters for start and end dates, and a boolean indicating if the user is authenticated with Oura.
const useFetchOuraData = (startDate: Date, endDate: Date, isOuraAuthed: boolean) => {
  // State for holding the readiness data or null if not available.
  const [data, setData] = useState<ReadinessData | null>(null);
  // State to track the loading status of the data fetch operation.
  const [isLoading, setLoading] = useState<boolean>(false);
  // State for storing any error message that might occur during data fetching.
  const [error, setError] = useState<string | null>(null);

  // useEffect hook to handle the side effect of fetching data from an API.
  useEffect(() => {
    // Early exit if the user is not authenticated with Oura, logging a message to the console.
    if (!isOuraAuthed) {
      console.log("Oura is not authenticated, skipping fetch.");
      setLoading(false);
      return;
    }

    // Asynchronous function to fetch readiness data from the API.
    const fetchData = async () => {
      setLoading(true); // Indicate the start of a loading process.
      setError(null); // Reset any previous error state.

      try {
        // Perform the API request with the start and end dates formatted in 'yyyy-MM-dd'.
        const response = await fetch(`/api/getReadinessData?start_date=${format(startDate, 'yyyy-MM-dd')}&end_date=${format(endDate, 'yyyy-MM-dd')}`);
        // Throw an error if the response status is not OK to indicate a failed request.
        if (!response.ok) {
          throw new Error(`HTTP Error Response: status ${response.status} ${response.statusText}`);
        }
        const result = await response.json(); // Parse the JSON response from the API.

        // Process and map the data to a more readable format and structure.
        const formattedDates = result.data.map((entry: any) =>
          format(new Date(entry.day), 'do MMM yyyy')
        );
        // Construct readiness data with processed dates, resting heart rate, hrv balance, and body temperature.
        const readinessData: ReadinessData = {
          dates: formattedDates,
          restingHeartRate: result.data.map((entry: any) => entry.contributors.resting_heart_rate),
          hrvBalance: result.data.map((entry: any) => entry.contributors.hrv_balance),
          bodyTemperature: result.data.map((entry: any) => entry.contributors.body_temperature)
        };
        setData(readinessData); // Set the processed data in the state.
      } catch (error) {
        // Handle any errors that occur during the fetch operation, logging them and setting an error state.
        console.error('Fetch error:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false); // Ensure the loading state is false after the operation, regardless of outcome.
      }
    };

    fetchData(); // Invoke the fetchData function to start the data fetching process.
  }, [startDate, endDate, isOuraAuthed]); // Depend on startDate, endDate, and isOuraAuthed to re-run the effect when they change.

  // Return the readiness data, loading status, and any error message to the consumer of the hook.
  return { data, isLoading, error };
};

// Export the custom hook for use elsewhere in the application.
export default useFetchOuraData;