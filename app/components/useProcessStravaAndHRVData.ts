import { useState, useEffect } from 'react';
import { parseISO, isEqual, format } from 'date-fns';

interface HRVData {
    date: string;
    averageHRV: number;
}

// Extending HRVData to include a parsedDate property for internal use
interface ExtendedHRVData extends HRVData {
    parsedDate: Date;
}

interface ProcessedStravaActivity {
    day: string; // ISO format in input, user-friendly format in output
    distance: number;
    totalElevationGain: number;
    averageHRV?: number;
    averageWatts?: number;
}

const useProcessStravaAndHRVData = (
    stravaData: ProcessedStravaActivity[] | null,
    hrvData: HRVData[] | null
): ProcessedStravaActivity[] => {
    const [processedData, setProcessedData] = useState<ProcessedStravaActivity[]>([]);

    useEffect(() => {
        if (!stravaData) {
            setProcessedData([]);
            return;
        }

        let hrvDataWithParsedDates: ExtendedHRVData[] = [];
        if (hrvData) {
            // Convert HRV data dates from ISO strings to Date objects for comparison
            hrvDataWithParsedDates = hrvData.map(hrv => ({
                ...hrv,
                parsedDate: parseISO(hrv.date), // Now valid with the ExtendedHRVData type
            }));
        }

        const mergedData = stravaData.map(activity => {
            const activityDate = parseISO(activity.day);
            const matchingHRV = hrvDataWithParsedDates.find(hrv =>
                isEqual(activityDate, hrv.parsedDate)
            );

            return {
                ...activity,
                averageHRV: matchingHRV ? matchingHRV.averageHRV : undefined,
            };
        });

        const formattedData = mergedData.map(activity => ({
            ...activity,
            day: format(parseISO(activity.day), 'do MMM yyyy'),
        }));

        setProcessedData(formattedData);
    }, [stravaData, hrvData]);

    return processedData;
};

export default useProcessStravaAndHRVData;
