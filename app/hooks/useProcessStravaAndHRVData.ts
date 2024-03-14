import { useState, useEffect } from 'react';
import { parseISO, isEqual, format } from 'date-fns';
import { transformedHrvData, EnhancedTagData } from '../../app/types/OuraInterfaces';

interface ExtendedHRVData extends transformedHrvData {
    parsedDate: Date;
    averageBreath?: number;
    averageHeartRate?: number;
    lowestHeartRate?: number;
    totalSleepDuration?: number;
}

interface ProcessedStravaActivity {
    day: string;
    distance: number;
    totalElevationGain: number;
    averageHRV?: number;
    averageBreath?: number;
    averageHeartRate?: number;
    lowestHeartRate?: number;
    totalSleepDuration?: number;
    averageWatts?: number;
    tags?: string[];
}

const useProcessStravaAndHRVData = (
    stravaData: ProcessedStravaActivity[] | null,
    hrvData: transformedHrvData[] | null,
    tagsData: EnhancedTagData[] | null
): ProcessedStravaActivity[] => {
    const [processedData, setProcessedData] = useState<ProcessedStravaActivity[]>([]);

    useEffect(() => {
        // Check for the absence of data or empty arrays
        if (!stravaData || stravaData.length === 0 || !hrvData || hrvData.length === 0) {
            // Optionally, process stravaData if it's the only dataset available
            setProcessedData(stravaData || []);
            return;
        }

        // Map hrvData to include parsed dates
        const hrvDataWithParsedDates: ExtendedHRVData[] = hrvData.map(hrv => ({
            ...hrv,
            parsedDate: parseISO(hrv.date),
        }));

        // Merge Strava and HRV data based on matching dates
        const mergedData = stravaData.map(activity => {
            const matchingHRV = hrvDataWithParsedDates.find(hrv => isEqual(hrv.parsedDate, parseISO(activity.day)));
        
            return {
                ...activity,
                averageHRV: matchingHRV?.averageHRV ?? undefined, // Convert null to undefined
                averageBreath: matchingHRV?.averageBreath ?? undefined,
                averageHeartRate: matchingHRV?.averageHeartRate ?? undefined,
                lowestHeartRate: matchingHRV?.lowestHeartRate ?? undefined,
                totalSleepDuration: matchingHRV?.totalSleepDuration ?? undefined,
                tags: tagsData?.filter(tag => isEqual(parseISO(tag.start_day), parseISO(activity.day)))
                                   .map(tag => `${tag.tag_type_code}: ${tag.comment}`) || [],
            };
        });
        

        // Further process merged data if necessary
        const formattedData = mergedData.map(activity => ({
            ...activity,
            day: format(parseISO(activity.day), 'do MMM yyyy'),
        }));

        setProcessedData(formattedData);
    }, [stravaData, hrvData, tagsData]);

    return processedData;
};

export default useProcessStravaAndHRVData;
