import { useState, useEffect } from 'react';
import { parseISO, isEqual, format } from 'date-fns';
import { transformedHrvData, EnhancedTagData } from '../../app/types/OuraInterfaces';

interface ExtendedHRVData extends transformedHrvData {
    parsedDate: Date;
    sortDate: Date; // For sorting
    averageSleepBreath?: number;
    averageSleepHeartRate?: number;
    lowestSleepHeartRate?: number;
    totalSleepDuration?: number;
    tags?: string[];
}

interface EnhancedStravaActivity {
    day: string;
    sortDate?: Date; // Now optional
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

const processStravaData = (stravaData: EnhancedStravaActivity[], tagsData: EnhancedTagData[] | null) => {
    return stravaData.map(activity => ({
        ...activity,
        day: format(parseISO(activity.day), 'do MMM yyyy'),
        sortDate: parseISO(activity.day), // Ensure sortDate is populated
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
            sortDate: parseISO(hrv.date), // Ensure sortDate is populated
            tags: tagsData?.filter(tag => isEqual(parseISO(tag.start_day), parseISO(hrv.date)))
                .map(tag => `${tag.tag_type_code}: ${tag.comment}`) || [],
        })) || [];

        let initialProcessedData: EnhancedStravaActivity[] = [];

        if (stravaData && stravaData.length > 0) {
            const processedStravaData = processStravaData(stravaData, tagsData);
            initialProcessedData = [...processedStravaData];
        }

        hrvDataWithParsedDates.forEach(hrv => {
            const dateFormatted = format(hrv.parsedDate, 'do MMM yyyy');
            const existingEntryIndex = initialProcessedData.findIndex(activity => activity.day === dateFormatted);

            if (existingEntryIndex > -1) {
                initialProcessedData[existingEntryIndex] = {
                    ...initialProcessedData[existingEntryIndex],
                    averageSleepHRV: hrv.averageSleepHRV ?? undefined,
                    averageSleepBreath: hrv.averageSleepBreath ?? undefined,
                    averageSleepHeartRate: hrv.averageSleepHeartRate ?? undefined,
                    lowestSleepHeartRate: hrv.lowestSleepHeartRate ?? undefined,
                    totalSleepDuration: hrv.totalSleepDuration ?? undefined,
                    tags: [...(initialProcessedData[existingEntryIndex].tags || []), ...(hrv.tags || [])],
                };
            } else {
                initialProcessedData.push({
                    day: dateFormatted,
                    sortDate: hrv.sortDate, // Use sortDate for sorting
                    averageSleepHRV: hrv.averageSleepHRV ?? undefined,
                    averageSleepBreath: hrv.averageSleepBreath ?? undefined,
                    averageSleepHeartRate: hrv.averageSleepHeartRate ?? undefined,
                    lowestSleepHeartRate: hrv.lowestSleepHeartRate ?? undefined,
                    totalSleepDuration: hrv.totalSleepDuration ?? undefined,
                    tags: hrv.tags ?? undefined,
                });
            }
        });

        // Sort the combined data by sortDate before setting the state
        initialProcessedData.sort((a, b) => {
            // Use a fallback if sortDate is undefined (e.g., current date or another safe value)
            const dateA = a.sortDate ? a.sortDate.getTime() : new Date().getTime();
            const dateB = b.sortDate ? b.sortDate.getTime() : new Date().getTime();
            return dateA - dateB;
        });
        
        setProcessedData(initialProcessedData);
    }, [stravaData, hrvData, tagsData]);

    return processedData;
};

export default useProcessStravaAndHRVData;
