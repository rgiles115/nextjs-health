import { useState, useEffect } from 'react';
import { parseISO, isEqual, format } from 'date-fns';
import { transformedHrvData, EnhancedTagData } from '../../app/types/OuraInterfaces';

interface ExtendedHRVData extends transformedHrvData {
    parsedDate: Date;
}

interface ProcessedStravaActivity {
    day: string;
    distance: number;
    totalElevationGain: number;
    averageHRV?: number;
    averageWatts?: number;
    tags?: string[]; // Array to hold tag comments
}

const useProcessStravaAndHRVData = (
    stravaData: ProcessedStravaActivity[] | null,
    hrvData: transformedHrvData[] | null,
    tagsData: EnhancedTagData[] | null // Added as a parameter
): ProcessedStravaActivity[] => {
    const [processedData, setProcessedData] = useState<ProcessedStravaActivity[]>([]);

    useEffect(() => {
        if (!stravaData) {
            setProcessedData([]);
            return;
        }

        let hrvDataWithParsedDates: ExtendedHRVData[] = [];
        if (hrvData) {
            hrvDataWithParsedDates = hrvData.map(hrv => ({
                ...hrv,
                parsedDate: parseISO(hrv.date),
            }));
        }

        const mergedData = stravaData.map(activity => {
            const activityDateFormatted = format(parseISO(activity.day), 'yyyy-MM-dd');
            
            const matchingTags = tagsData?.filter(tag => {
                const tagStartDateFormatted = format(parseISO(tag.start_day), 'yyyy-MM-dd');
                return tagStartDateFormatted === activityDateFormatted;
            }).map(tag => tag.comment) || [];
        
            // Now find the matching HRV data as before
            const matchingHRV = hrvDataWithParsedDates.find(hrv => {
                const hrvDateFormatted = format(hrv.parsedDate, 'yyyy-MM-dd');
                return hrvDateFormatted === activityDateFormatted;
            });
        
            let averageHRV = matchingHRV?.averageHRV;
            if (averageHRV === null) {
                averageHRV = undefined;
            }
        
            return {
                ...activity,
                averageHRV,
                tags: matchingTags, // Include the matching tags based on the normalized date comparison
            };
        });

        const formattedData = mergedData.map(activity => ({
            ...activity,
            day: format(parseISO(activity.day), 'do MMM yyyy'),
        }));

        setProcessedData(formattedData);
    }, [stravaData, hrvData, tagsData]); // Include tagsData in the dependency array

    return processedData;
};

export default useProcessStravaAndHRVData;
