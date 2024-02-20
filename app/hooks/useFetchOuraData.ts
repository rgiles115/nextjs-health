import { useState, useEffect } from 'react';
import { format } from 'date-fns'; // Ensure date-fns is installed and imported for formatting

interface ReadinessData {
  dates: string[];
  restingHeartRate: number[];
  hrvBalance: number[];
  bodyTemperature: number[];
}

// Added isOuraAuthed as a parameter
const useFetchOuraData = (startDate: Date, endDate: Date, isOuraAuthed: boolean) => {
  const [data, setData] = useState<ReadinessData | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Immediately return if not authenticated with Oura
    if (!isOuraAuthed) {
      console.log("Oura is not authenticated, skipping fetch.");
      setLoading(false); // Make sure to set loading to false as we're not fetching
      // Optionally, reset data and error here if you want to clear previous state
      // setData(null);
      // setError(null);
      return; // Exit early
    }

    setLoading(true);
    const fetchData = async () => {
      try {
        const formattedStartDate = format(startDate, 'yyyy-MM-dd');
        const formattedEndDate = format(endDate, 'yyyy-MM-dd');
        const url = `/api/getReadinessData?start_date=${formattedStartDate}&end_date=${formattedEndDate}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok.');

        const result = await response.json();

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
      } catch (err: unknown) {
        let errorMessage: string;
        if (err instanceof Error) {
          errorMessage = err.message;
        } else {
          errorMessage = 'An unknown error occurred';
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, isOuraAuthed]); // Include isOuraAuthed in the dependency array

  return { data, isLoading, error };
};

export default useFetchOuraData;