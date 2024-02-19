import { useState, useEffect } from 'react';
import { StravaActivity, YtdRideTotals } from '../types/StravaInterface';

const useFetchStravaActivities = (startDate: Date, endDate: Date) => {
  const [activities, setActivities] = useState<StravaActivity[] | null>(null);
  const [ytdRideTotals, setYtdRideTotals] = useState<YtdRideTotals | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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
        // Assuming your updated API now returns an object with both activities and ytdRideTotals
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
  }, [startDate, endDate]);

  return { activities, ytdRideTotals, isLoading };
};

export default useFetchStravaActivities;
