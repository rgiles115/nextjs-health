import { useState, useEffect } from 'react';

const useFetchStravaActivities = (startDate, endDate) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const startTimestamp = startDate.getTime() / 1000;
      const endTimestamp = endDate.getTime() / 1000;
      const response = await fetch(`/api/getStravaActivities?start_date=${startTimestamp}&end_date=${endTimestamp}`);
      const result = await response.json();
      setData(result);
      setIsLoading(false);
    };

    fetchData();
  }, [startDate, endDate]);

  return { data, isLoading };
};

export default useFetchStravaActivities;
