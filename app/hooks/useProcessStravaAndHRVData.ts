import { useState, useEffect } from 'react';
import { parseISO, isEqual, format } from 'date-fns';
import { transformedHrvData, EnhancedTagData } from '../../app/types/OuraInterfaces';

interface ExtendedHRVData extends transformedHrvData {
    parsedDate: Date;
    averageSleepBreath?: number;
    averageSleepHeartRate?: number;
    lowestSleepHeartRate?: number;
    totalSleepDuration?: number;
    tags?: string[]; // Include tags in the ExtendedHRVData interface
}

interface EnhancedStravaActivity {
    day: string;
    distance?: number;
    totalElevationGain?: number;
    averageSleepHRV?: number;
    averageSleepBreath?: number;
    averageSleepHeartRate?: number;
    lowestSleepHeartRate?: number;
    totalSleepDuration?: number;
    averageWatts?: number;
    tags?: string[];
}


// Function to process Strava data similarly to HRV data
const processStravaData = (stravaData: EnhancedStravaActivity[], tagsData: EnhancedTagData[] | null) => {
    return stravaData.map(activity => ({
        ...activity,
        day: format(parseISO(activity.day), 'do MMM yyyy'),
        tags: tagsData?.filter(tag => isEqual(parseISO(tag.start_day), parseISO(activity.day)))
            .map(tag => `${tag.tag_type_code}: ${tag.comment}`) || [],
    }));
};

const useProcessStravaAndHRVData = (
    stravaData: EnhancedStravaActivity[] | null,
    hrvData: transformedHrvData[] | null,
    tagsData: EnhancedTagData[] | null
): EnhancedStravaActivity[] => {
    const [processedData, setProcessedData] = useState<EnhancedStravaActivity[]>([]);

    useEffect(() => {
        const hrvDataWithParsedDates: ExtendedHRVData[] = hrvData?.map(hrv => ({
            ...hrv,
            parsedDate: parseISO(hrv.date),
            tags: tagsData?.filter(tag => isEqual(parseISO(tag.start_day), parseISO(hrv.date)))
                .map(tag => `${tag.tag_type_code}: ${tag.comment}`) || [],
        })) || [];

        let initialProcessedData: EnhancedStravaActivity[] = [];

        if (stravaData && stravaData.length > 0) {
            const processedStravaData = processStravaData(stravaData, tagsData);
            initialProcessedData = [...processedStravaData];
        }

        // Ensure all days in HRV data are formatted and merged correctly
        hrvDataWithParsedDates.forEach(hrv => {
            const dateFormatted = format(hrv.parsedDate, 'do MMM yyyy');
            const existingEntryIndex = initialProcessedData.findIndex(activity => activity.day === dateFormatted);

            if (existingEntryIndex > -1) {
                // Merge with existing Strava data entry
                initialProcessedData[existingEntryIndex] = {
                    ...initialProcessedData[existingEntryIndex],
                    averageSleepHRV: hrv.averageSleepHRV ?? undefined,
                    averageSleepBreath: hrv.averageSleepBreath ?? undefined,
                    averageSleepHeartRate: hrv.averageSleepHeartRate ?? undefined,
                    lowestSleepHeartRate: hrv.lowestSleepHeartRate ?? undefined,
                    totalSleepDuration: hrv.totalSleepDuration ?? undefined,
                    tags: hrv.tags ?? undefined,
                };
            } else {
                // Add as new entry with formatted day
                initialProcessedData.push({
                    day: dateFormatted,
                    averageSleepHRV: hrv.averageSleepHRV ?? undefined,
                    averageSleepBreath: hrv.averageSleepBreath ?? undefined,
                    averageSleepHeartRate: hrv.averageSleepHeartRate ?? undefined,
                    lowestSleepHeartRate: hrv.lowestSleepHeartRate ?? undefined,
                    totalSleepDuration: hrv.totalSleepDuration ?? undefined,
                    tags: hrv.tags ?? undefined,
                });
            }
        });

        setProcessedData(initialProcessedData);
    }, [stravaData, hrvData, tagsData]);

    return processedData;
};

export default useProcessStravaAndHRVData;
