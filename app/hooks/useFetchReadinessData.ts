import { useState, useEffect } from 'react';
import { format, parseISO, subDays } from 'date-fns';
import { DetailedReadinessData } from '../../app/types/OuraInterfaces';

interface UseFetchReadinessDataReturn {
    data: DetailedReadinessData[] | null;
    isLoading: boolean;
    error: Error | null;
}

const useFetchReadinessData = (startDate: Date, endDate: Date, isAuthenticated: boolean): UseFetchReadinessDataReturn => {
    const [data, setData] = useState<DetailedReadinessData[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            // console.log("Not authenticated, skipping readiness data fetch.");
            setIsLoading(false);
            return;
        }

        const fetchReadinessData = async () => {
            setIsLoading(true);
            setError(null);

            const formattedStartDate = format(startDate, 'yyyy-MM-dd');
            const formattedEndDate = format(endDate, 'yyyy-MM-dd');

            try {
                const response = await fetch(`/api/getReadinessData?start_date=${formattedStartDate}&end_date=${formattedEndDate}`);
                if (!response.ok) {
                    throw new Error(`HTTP Error Response: status ${response.status} ${response.statusText}`);
                }
                const result = await response.json(); // Assuming the endpoint returns an object with a data property

                setData(result.data); // Here you could transform the data as needed.
            } catch (error) {
                console.error("Failed to fetch readiness data:", error);
                setError(error instanceof Error ? error : new Error('An error occurred while fetching readiness data'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchReadinessData();
    }, [startDate, endDate, isAuthenticated]);

    return { data, isLoading, error };
};

export default useFetchReadinessData;
