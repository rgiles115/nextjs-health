import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ReadinessData } from '../../app/types/OuraInterfaces';

const useFetchOuraData = (startDate: Date, endDate: Date, isOuraAuthed: boolean) => {
  const [data, setData] = useState<ReadinessData | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOuraAuthed) {
      console.log("Oura is not authenticated, skipping fetch.");
      setLoading(false);
      return; // Exit early if not authenticated
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/getReadinessData?start_date=${format(startDate, 'yyyy-MM-dd')}&end_date=${format(endDate, 'yyyy-MM-dd')}`);
        if (!response.ok) {
          throw new Error(`HTTP Error Response: status ${response.status} ${response.statusText}`);
        }
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
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, isOuraAuthed]);

  return { data, isLoading, error };
};

export default useFetchOuraData;
