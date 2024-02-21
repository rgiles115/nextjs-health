import { useState, useEffect } from 'react';
import { format, parseISO, subDays } from 'date-fns';
import { HRVData } from '../../app/types/OuraInterfaces';


interface SleepEntry {
    average_hrv: number | null;
    day: string; // Assuming 'day' is already in an acceptable format for parseISO
}

interface UseFetchHrvDataReturn {
    data: HRVData[] | null;
    isLoading: boolean;
    error: Error | null;
}

// Added isAuthenticated as a parameter
const useFetchHrvData = (startDate: Date, endDate: Date, isAuthenticated: boolean): UseFetchHrvDataReturn => {
    const [data, setData] = useState<HRVData[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Immediately return if not authenticated
        if (!isAuthenticated) {
            console.log("Not authenticated, skipping HRV data fetch.");
            setIsLoading(false); // Make sure to set loading to false as we're not fetching
            // Optionally, reset data and error here if you want to clear previous state
            // setData(null);
            // setError(null);
            return; // Exit early
        }
        const fetchHRVData = async () => {
            setIsLoading(true);
            const adjustedStartDate = subDays(startDate, 1);
            const formattedStartDate = format(adjustedStartDate, 'yyyy-MM-dd');
            const formattedEndDate = format(endDate, 'yyyy-MM-dd');

            // Define the timeout duration in milliseconds
            const timeoutDuration = 10000; // for example, 10 seconds

            // Create a timeout flag
            let didTimeout = false;

            // Create a promise that logs a message after a timeout but does not reject
            const timeoutPromise = new Promise(resolve => {
                setTimeout(() => {
                    didTimeout = true;
                    console.log('Request might have timed out');
                    resolve(null); // Resolve instead of reject to avoid throwing an error
                }, timeoutDuration);
            });

            // Fetch request wrapped in a promise to work with Promise.race
            const fetchPromise = fetch(`/api/getSleepData?start_date=${formattedStartDate}&end_date=${formattedEndDate}`)
                .then(response => {
                    if (!response.ok) {
                        console.error(`HTTP Error Response: status ${response.status} ${response.statusText}`);
                        throw new Error('Network response was not ok');
                    }
                    return response.json(); // Proceed to process the response if it's ok
                });

            // Use Promise.race to race the fetch request against the timeout
            const result = await Promise.race([fetchPromise, timeoutPromise]);

            // Proceed only if the fetchPromise resolved before the timeout
            if (!didTimeout && result) {
                const transformedData = (result.data as SleepEntry[])
                    .filter((entry) => entry.average_hrv !== null)
                    .map((entry) => ({
                        date: format(parseISO(entry.day), 'yyyy-MM-dd'),
                        averageHRV: entry.average_hrv,
                    }));


                setData(transformedData);
            }

            setIsLoading(false);
        };

        fetchHRVData();
    }, [startDate, endDate, isAuthenticated]); // Include isAuthenticated in the dependency array

    return { data, isLoading, error };
};

export default useFetchHrvData;