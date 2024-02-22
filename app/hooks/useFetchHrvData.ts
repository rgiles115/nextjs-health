// Imports necessary hooks and utility functions from React and date-fns libraries.
import { useState, useEffect } from 'react';
import { format, parseISO, subDays } from 'date-fns';
// Imports types for transformed HRV data and sleep entries.
import { transformedHrvData, SleepEntry } from '../../app/types/OuraInterfaces';

// Defines the TypeScript interface for the hook's return type.
interface UseFetchHrvDataReturn {
    data: transformedHrvData[] | null; // The processed HRV data or null if not available.
    isLoading: boolean; // Flag indicating whether the data is currently being loaded.
    error: Error | null; // Stores any error that occurs during data fetching or processing.
}

// The custom hook definition, accepting start and end dates to fetch data for, and an authentication status.
const useFetchHrvData = (startDate: Date, endDate: Date, isAuthenticated: boolean): UseFetchHrvDataReturn => {
    // State hooks for managing HRV data, loading status, and any errors.
    const [data, setData] = useState<transformedHrvData[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    // useEffect hook to perform the data fetch operation when the hook's inputs change.
    useEffect(() => {
        // Checks if the user is authenticated. If not, skips fetching data and sets loading to false.
        if (!isAuthenticated) {
            console.log("Not authenticated, skipping HRV data fetch.");
            setIsLoading(false);
            return;
        }

        // Asynchronous function to fetch HRV data from the API.
        const fetchHRVData = async () => {
            setIsLoading(true); // Indicates the start of data fetching.
            setError(null); // Resets any previous errors before fetching new data.

            // Adjusts the start date by subtracting one day and formats start and end dates.
            const adjustedStartDate = subDays(startDate, 1);
            const formattedStartDate = format(adjustedStartDate, 'yyyy-MM-dd');
            const formattedEndDate = format(endDate, 'yyyy-MM-dd');

            try {
                // Attempts to fetch data from the API with the formatted query parameters.
                const response = await fetch(`/api/getSleepData?start_date=${formattedStartDate}&end_date=${formattedEndDate}`);
                if (!response.ok) {
                    // Throws an error if the response status is not OK.
                    throw new Error(`HTTP Error Response: status ${response.status} ${response.statusText}`);
                }
                const result = await response.json(); // Parses the JSON response.

                // Transforms the fetched data by filtering and mapping to the desired structure.
                const transformedData = (result.data as SleepEntry[])
                    .filter((entry) => entry.average_hrv !== null)
                    .map((entry) => ({
                        date: format(parseISO(entry.day), 'yyyy-MM-dd'),
                        averageHRV: entry.average_hrv,
                    }));

                setData(transformedData); // Sets the transformed data to the state.
            } catch (error) {
                // Catches and logs any errors that occur during fetching or processing.
                console.error("Failed to fetch HRV data:", error);
                // Sets an error state, ensuring it's an Error object.
                setError(error instanceof Error ? error : new Error('An error occurred while fetching HRV data'));
            } finally {
                setIsLoading(false); // Sets loading to false after the fetch operation is complete, regardless of outcome.
            }
        };

        fetchHRVData(); // Calls the fetchHRVData function defined above.
    }, [startDate, endDate, isAuthenticated]); // Dependencies array, effect reruns when any of these values change.

    // Returns the HRV data, loading status, and any error state.
    return { data, isLoading, error };
};

// Exports the custom hook for use in other parts of the application.
export default useFetchHrvData;
