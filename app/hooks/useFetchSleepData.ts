// Import necessary React hooks for managing state and side effects.
import { useState, useEffect } from 'react';
// Import the date formatting function from date-fns library.
import { format } from 'date-fns';
// Import the DailySleepEntry type for type safety and clarity.
import { DailySleepEntry } from '../../app/types/OuraInterfaces'; // Adjust the import path as needed

// The custom hook definition accepting start and end dates as parameters.
export const useFetchSleepData = (startDate: Date, endDate: Date) => {
    // State hook for storing the processed sleep data.
    const [data, setData] = useState({
        dates: [],
        total: [],
        rem: [],
        deep: [],
        light: [],
        restfulness: [],
    });
    // State hook to track the loading status of the data fetch operation.
    const [isLoading, setIsLoading] = useState(false);
    // State hook for storing any error that might occur during data fetching.
    const [error, setError] = useState(null);

    // useEffect hook to handle the side effect of fetching data from an API.
    useEffect(() => {
        // Early exit if startDate or endDate is not provided.
        if (!startDate || !endDate) {
            return;
        }

        setIsLoading(true); // Indicate the start of a loading process.
        setError(null); // Reset any previous error state.

        // Format the startDate and endDate to ISO strings and extract the date part.
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];

        // Perform the API request with the formatted start and end dates.
        fetch(`/api/getDailySleepData?start_date=${formattedStartDate}&end_date=${formattedEndDate}`)
            .then(response => response.json()) // Parse the JSON response from the API.
            .then(data => {
                // Process and map the data to a structured format suitable for use.
                const formattedData = {
                    dates: data.data.map((entry: DailySleepEntry) => format(new Date(entry.timestamp), 'do MMM yyyy')),
                    total: data.data.map((entry: DailySleepEntry) => entry.contributors.total_sleep),
                    rem: data.data.map((entry: DailySleepEntry) => entry.contributors.rem_sleep),
                    deep: data.data.map((entry: DailySleepEntry) => entry.contributors.deep_sleep),
                    light: data.data.map((entry: DailySleepEntry) => entry.score),
                    restfulness: data.data.map((entry: DailySleepEntry) => entry.contributors.restfulness),
                };
                setData(formattedData); // Set the processed data in the state.
                setIsLoading(false); // Update the loading status.
            })
            .catch(error => {
                // Handle any errors that occur during the fetch operation, logging them and setting an error state.
                console.error('Error:', error);
                setError(error);
                setIsLoading(false); // Ensure the loading state is false after the operation, regardless of outcome.
            });
    }, [startDate, endDate]); // Depend on startDate and endDate to re-run the effect when they change.

    // Return the sleep data, loading status, and any error message to the consumer of the hook.
    return { data, isLoading, error };
};