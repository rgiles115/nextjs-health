import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';

interface SleepEntry {
    average_hrv: number | null;
    day: string; // Assuming 'day' is already in an acceptable format for parseISO
}

interface HRVData {
    date: string; // Using ISO date format 'yyyy-MM-dd'
    averageHRV: number;
}

interface UseFetchHrvDataReturn {
    data: HRVData[] | null;
    isLoading: boolean;
    error: Error | null;
}

const useFetchHrvData = (startDate: Date, endDate: Date): UseFetchHrvDataReturn => {
    const [data, setData] = useState<HRVData[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchHRVData = async () => {
            setIsLoading(true);
            const formattedStartDate = format(startDate, 'yyyy-MM-dd');
            const formattedEndDate = format(endDate, 'yyyy-MM-dd');

            try {
                // Replace the URL with your actual endpoint that accepts startDate and endDate as query parameters
                const response = await fetch(`/api/getSleepData?start_date=${formattedStartDate}&end_date=${formattedEndDate}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const { data } = await response.json();

                const transformedData = data
                    .filter((entry: SleepEntry) => entry.average_hrv !== null)
                    .map((entry: SleepEntry) => ({
                        date: format(parseISO(entry.day), 'yyyy-MM-dd'), // Ensure the date is in ISO format
                        averageHRV: entry.average_hrv as number,
                    }));

                setData(transformedData);
            } catch (err) {
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHRVData();
    }, [startDate, endDate]);

    return { data, isLoading, error };
};

export default useFetchHrvData;
