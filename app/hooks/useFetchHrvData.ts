import { useState, useEffect } from 'react';
import { format, parseISO, subDays } from 'date-fns';

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
            
            try {
                const response = await fetch(`/api/getSleepData?start_date=${formattedStartDate}&end_date=${formattedEndDate}`);
                
                // Check if the response is not ok to log additional details
                if (!response.ok) {
                    console.error(`HTTP Error Response: status ${response.status} ${response.statusText}`);
        
                    // Attempt to read and log the response body which might contain more details about the error
                    try {
                        const errorBody = await response.json(); // Assuming the server returns JSON with error details
                        console.error("Error Body:", errorBody);
                    } catch (bodyError) {
                        console.error("Failed to parse error response body:", bodyError);
                    }
        
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
                console.error("Fetch HRV Data Error:", err);
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        };
        

        fetchHRVData();
    }, [startDate, endDate, isAuthenticated]); // Include isAuthenticated in the dependency array

    return { data, isLoading, error };
};

export default useFetchHrvData;