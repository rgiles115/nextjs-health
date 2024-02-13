import { useState, useEffect } from 'react';
import { StravaActivity, YtdRideTotals } from '../types/StravaInterface';

// Add type annotations for the parameters
const useFetchStravaActivities = (startDate: Date, endDate: Date) => {
  const [activities, setActivities] = useState<StravaActivity[] | null>(null);
  const [ytdRideTotals, setYtdRideTotals] = useState<YtdRideTotals | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const startTimestamp = Math.floor(startDate.getTime() / 1000);
      const endTimestamp = Math.floor(endDate.getTime() / 1000);
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