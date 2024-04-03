import { useState, useEffect } from 'react';
import { parseISO, isEqual, format } from 'date-fns';
import { transformedHrvData, EnhancedTagData } from '../../app/types/OuraInterfaces';

interface ExtendedHRVData extends transformedHrvData {
    day: string; // Formatted date string
    tags?: string[];
}

interface ProcessedStravaActivity {
    day: string;
    distance: number;
    totalElevationGain: number;
    averageSleepHRV?: number;
    averageSleepBreath?: number;
    averageSleepHeartRate?: number;
    lowestSleepHeartRate?: number;
    totalSleepDuration?: number;
    averageWatts?: number;
    tags?: string[];
}

const useProcessStravaAndHRVData = (
    stravaData: ProcessedStravaActivity[] | null,
    hrvData: transformedHrvData[] | null,
    tagsData: EnhancedTagData[] | null
): (ProcessedStravaActivity[] | ExtendedHRVData[]) => {
    const [processedData, setProcessedData] = useState<(ProcessedStravaActivity[] | ExtendedHRVData[])>([]);

    useEffect(() => {
        if (!stravaData || stravaData.length === 0) {
            if (hrvData && hrvData.length > 0) {
                const hrvDataWithTags: ExtendedHRVData[] = hrvData.map(hrv => ({
                    ...hrv,
                    day: format(parseISO(hrv.date), 'do MMM yyyy'), // Ensuring the day field is formatted
                    tags: tagsData?.filter(tag => isEqual(parseISO(tag.start_day), parseISO(hrv.date)))
                                   .map(tag => `${tag.tag_type_code}: ${tag.comment}`) || [],
                }));
                // Casting to the expected return type
                setProcessedData(hrvDataWithTags as unknown as ProcessedStravaActivity[]);
            } else {
                setProcessedData([]);
            }
            return;
        }

        // Logic to process and merge Strava and HRV data if Strava data is present
        // Assuming processStravaData function does its job as per the initial code
        const processedStravaData = stravaData.map(activity => ({
            ...activity,
            day: format(parseISO(activity.day), 'do MMM yyyy'),
            tags: tagsData?.filter(tag => isEqual(parseISO(tag.start_day), parseISO(activity.day)))
                .map(tag => `${tag.tag_type_code}: ${tag.comment}`) || [],
        }));
        
        setProcessedData(processedStravaData);
    }, [stravaData, hrvData, tagsData]);

    return processedData;
};

export default useProcessStravaAndHRVData;
