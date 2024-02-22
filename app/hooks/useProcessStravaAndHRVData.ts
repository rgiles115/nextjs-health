// Import necessary hooks and functions from React and date-fns libraries.
import { useState, useEffect } from 'react';
import { parseISO, isEqual, format } from 'date-fns';
// Import the type definition for HRV data.
import { transformedHrvData } from '../../app/types/OuraInterfaces';

// Extending the HRVData type to include a parsedDate property for easier date comparisons.
interface ExtendedHRVData extends transformedHrvData {
    parsedDate: Date;
}

// Defining the structure for processed Strava activity data.
interface ProcessedStravaActivity {
    day: string; // Initially in ISO format, converted to a more user-friendly format in the output.
    distance: number;
    totalElevationGain: number;
    averageHRV?: number; // Optional property for HRV data.
    averageWatts?: number; // Optional property for power data, not used in current implementation.
}

// The custom hook definition, taking Strava and HRV data as inputs and returning merged and processed data.
const useProcessStravaAndHRVData = (
    stravaData: ProcessedStravaActivity[] | null,
    hrvData: transformedHrvData[] | null
): ProcessedStravaActivity[] => {
    // State hook for holding the processed and merged data.
    const [processedData, setProcessedData] = useState<ProcessedStravaActivity[]>([]);

    useEffect(() => {
        // If no Strava data is provided, reset the processed data to an empty array.
        if (!stravaData) {
            setProcessedData([]);
            return;
        }

        let hrvDataWithParsedDates: ExtendedHRVData[] = [];
        if (hrvData) {
            // Convert HRV data dates from ISO strings to Date objects to facilitate comparison.
            hrvDataWithParsedDates = hrvData.map(hrv => ({
                ...hrv,
                parsedDate: parseISO(hrv.date), // Parsing the date string into a Date object.
            }));
        }

        // Merge the Strava and HRV data based on matching dates.
        const mergedData = stravaData.map(activity => {
            const activityDate = parseISO(activity.day); // Parse the Strava activity date.
            // Find the matching HRV entry by comparing dates.
            const matchingHRV = hrvDataWithParsedDates.find(hrv =>
                isEqual(activityDate, hrv.parsedDate)
            );
        
            // Handle null values for averageHRV explicitly, converting them to undefined.
            let averageHRV = matchingHRV?.averageHRV;
            if (averageHRV === null) {
                averageHRV = undefined; // Ensures averageHRV is either a number or undefined.
            }
        
            // Return the merged activity data, including the HRV data if available.
            return {
                ...activity,
                averageHRV,
            };
        });
        
        // Format the day property of each activity for a more user-friendly display.
        const formattedData = mergedData.map(activity => ({
            ...activity,
            day: format(parseISO(activity.day), 'do MMM yyyy'), // Formatting the date.
        }));

        // Update the state with the formatted and merged data.
        setProcessedData(formattedData);
    }, [stravaData, hrvData]); // Depend on stravaData and hrvData to re-run the effect when they change.

    // Return the processed data for use in the component that utilizes this hook.
    return processedData;
};

// Export the custom hook for use in other parts of the application.
export default useProcessStravaAndHRVData;