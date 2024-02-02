// useFetchHrvData.ts
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface SleepEntry {
    average_hrv: number | null;
    day: string;
    // Add other fields from SleepEntry as necessary
}

interface HRVData {
    dates: string[];
    hrv: number[];
}

const useFetchHrvData = (startDate: Date, endDate: Date) => {
    const [data, setData] = useState<HRVData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setIsLoading(true);
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];

        fetch(`/api/getSleepData?start_date=${formattedStartDate}&end_date=${formattedEndDate}`)
            .then(response => response.json())
            .then((data: { data: SleepEntry[] }) => {
                const groupedData = data.data
                    .filter((entry: SleepEntry) => entry.average_hrv !== null)
                    .reduce((acc: { [key: string]: number[] }, entry: SleepEntry) => {
                        const dayFormatted = format(new Date(entry.day), 'do MMM yyyy');
                        acc[dayFormatted] = acc[dayFormatted] || [];
                        acc[dayFormatted].push(entry.average_hrv as number);
                        return acc;
                    }, {});

                const formattedDates = Object.keys(groupedData);
                const hrvAverages = formattedDates.map((dayFormatted: string) => {
                    const hrvValues = groupedData[dayFormatted];
                    return hrvValues.reduce((a: number, b: number) => a + b, 0) / hrvValues.length;
                });

                setData({ dates: formattedDates, hrv: hrvAverages });
                setIsLoading(false);
            })
            .catch((err: Error) => {
                setError(err);
                setIsLoading(false);
            });
    }, [startDate, endDate]);

    return { data, isLoading, error };
};

export default useFetchHrvData;
