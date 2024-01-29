import { useState, useEffect } from 'react';
import { StravaActivity } from '../types/StravaInterface';

// Add type annotations for the parameters
const useFetchStravaActivities = (startDate: Date, endDate: Date) => {
  // Specify the type for data state as StravaActivity[] | null
  const [data, setData] = useState<StravaActivity[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const startTimestamp = startDate.getTime() / 1000;
      const endTimestamp = endDate.getTime() / 1000;
      const response = await fetch(`/api/getStravaActivities?start_date=${startTimestamp}&end_date=${endTimestamp}`);
      const result = await response.json() as StravaActivity[]; // Assuming the response is always an array of StravaActivity
      setData(result);
      setIsLoading(false);
    };

    fetchData();
  }, [startDate, endDate]);

  // The return type is inferred correctly here
  return { data, isLoading };
};

export default useFetchStravaActivities;
