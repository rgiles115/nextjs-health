import { useState, useEffect } from 'react';
import { format } from 'date-fns'; // Ensure date-fns is installed and imported for formatting

const useFetchOuraData = (startDate, endDate) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];
        const url = `/api/getReadinessData?start_date=${formattedStartDate}&end_date=${formattedEndDate}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok.');

        const result = await response.json();

        // Process data as per your existing logic
        const formattedDates = result.data.map(entry =>
            format(new Date(entry.day), 'do MMM yyyy')
        );
        const readinessData = {
            dates: formattedDates,
            restingHeartRate: result.data.map(entry => entry.contributors.resting_heart_rate),
            hrvBalance: result.data.map(entry => entry.contributors.hrv_balance),
            bodyTemperature: result.data.map(entry => entry.contributors.body_temperature)
        };

        setData(readinessData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]); // Dependency array includes startDate and endDate

  return { data, loading, error };
};

export default useFetchOuraData;
