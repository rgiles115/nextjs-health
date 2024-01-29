export interface ProcessedDataItem {
    day: string; // or Date, depending on your data structure
    distance: number;
    average_watts: number;
    total_elevation_gain: number;
    // Add other fields as necessary
}

export interface StravaChartProps {
    processedData: ProcessedDataItem[];
    isLoading: boolean;
}

export interface NumberContainersProps {
    totalDistance: number;
    totalElevationGain: number;
}
