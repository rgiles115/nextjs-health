import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';

interface ReadinessData {
  dates: string[];
  restingHeartRate: number[];
  hrvBalance: number[];
  bodyTemperature: number[];
}

const useFetchOuraData = (startDate: Date, endDate: Date, isOuraAuthed: boolean) => {
  const [data, setData] = useState<ReadinessData | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Use a ref to track whether a timeout has occurred
  const timeoutOccurred = useRef(false);

  useEffect(() => {
    if (!isOuraAuthed) {
      console.log("Oura is not authenticated, skipping fetch.");
      setLoading(false);
      return; // Exit early if not authenticated
    }

    const fetchData = async () => {
      setLoading(true);

      // Setup a timeout to indicate a slow request
      const timeoutDuration = 10000; // Set timeout to 10 seconds
      setTimeout(() => {
        timeoutOccurred.current = true;
        console.log('Request might be slow');
        // Optionally, set a state here to show a message in the UI
      }, timeoutDuration);

      try {
        const response = await fetch(`/api/getReadinessData?start_date=${format(startDate, 'yyyy-MM-dd')}&end_date=${format(endDate, 'yyyy-MM-dd')}`);
        if (!response.ok) {
          throw new Error(`HTTP Error Response: status ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        // console.log('Result:', result);

        if (!timeoutOccurred.current) {
          // Process the data only if timeout did not occur, or process regardless if you want
          const formattedDates = result.data.map((entry: any) =>
          format(new Date(entry.day), 'do MMM yyyy')
      );
      const readinessData: ReadinessData = {
          dates: formattedDates,
          restingHeartRate: result.data.map((entry: any) => entry.contributors.resting_heart_rate),
          hrvBalance: result.data.map((entry: any) => entry.contributors.hrv_balance),
          bodyTemperature: result.data.map((entry: any) => entry.contributors.body_temperature)
      };
          setData(readinessData);
          // console.log('Readiness Data:', readinessData);
        }
      } catch (error: unknown) {
        console.error('Fetch error:', error);
        if (error instanceof Error) {
          setError(error); // Set the error state if it's an instance of Error
        } else {
          // Handle cases where the error might not be an Error instance
          setError(new Error('An unexpected error occurred'));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup function to reset the timeoutOccurred flag upon component unmount or before next effect runs
    return () => {
      timeoutOccurred.current = false;
    };
  }, [startDate, endDate, isOuraAuthed]);

  return { data, isLoading, error };
};

export default useFetchOuraData;