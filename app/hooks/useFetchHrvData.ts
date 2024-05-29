import { useState, useEffect } from 'react';
import { format, parseISO, subDays } from 'date-fns';
import { transformedHrvData, SleepEntry } from '../../app/types/OuraInterfaces';

interface UseFetchHrvDataReturn {
    data: transformedHrvData[] | null;
    isLoading: boolean;
    error: Error | null;
}

interface AggregatedSleepData {
    [date: string]: {
        total_sleep_duration: number;
        average_hrv?: number | null; 
        average_breath?: number | null;
        average_heart_rate?: number | null;
        lowest_heart_rate?: number | null;
        count: number;
    };
}

const useFetchHrvData = (startDate: Date, endDate: Date, isAuthenticated: boolean): UseFetchHrvDataReturn => {
    const [data, setData] = useState<transformedHrvData[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            // console.log("Not authenticated, skipping HRV data fetch.");
            setIsLoading(false);
            return;
        }

        const fetchHRVData = async () => {
            setIsLoading(true);
            setError(null);

            const formattedStartDate = format(startDate, 'yyyy-MM-dd');
            const formattedEndDate = format(endDate, 'yyyy-MM-dd');

            try {
                const response = await fetch(`/api/getSleepData?start_date=${formattedStartDate}&end_date=${formattedEndDate}`);
                if (!response.ok) {
                    throw new Error(`HTTP Error Response: status ${response.status} ${response.statusText}`);
                }
                const result = await response.json();
                // console.log("Sleep:", result);
                let groupedByDate = result.data.reduce((acc: AggregatedSleepData, entry: SleepEntry) => {
                    const entryDate = format(parseISO(entry.day), 'yyyy-MM-dd');
                    if (!acc[entryDate]) {
                        acc[entryDate] = { ...entry, total_sleep_duration: entry.total_sleep_duration, count: 1 };
                    } else {
                        // Only keep the entry if it's longer than the current one for the same date
                        if (entry.total_sleep_duration > acc[entryDate].total_sleep_duration) {
                            acc[entryDate] = { ...entry, total_sleep_duration: entry.total_sleep_duration, count: 1 };
                        }
                    }
                    return acc;
                }, {});

                const transformedData = Object.keys(groupedByDate).map(date => ({
                    date: date,
                    averageSleepHRV: groupedByDate[date].average_hrv,
                    averageSleepBreath: groupedByDate[date].average_breath,
                    averageSleepHeartRate: groupedByDate[date].average_heart_rate,
                    lowestSleepHeartRate: groupedByDate[date].lowest_heart_rate,
                    totalSleepDuration: groupedByDate[date].total_sleep_duration,
                }));
                setData(transformedData);
            } catch (error) {
                console.error("Failed to fetch HRV data:", error);
                setError(error instanceof Error ? error : new Error('An error occurred while fetching HRV data'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchHRVData();
    }, [startDate, endDate, isAuthenticated]);
    return { data, isLoading, error };
};

export default useFetchHrvData;
