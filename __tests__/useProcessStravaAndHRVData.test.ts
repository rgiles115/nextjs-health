import { renderHook, act } from '@testing-library/react';
import useProcessStravaAndHRVData from '../app/hooks/useProcessStravaAndHRVData'; // Make sure this path is correct
import { parseISO } from 'date-fns';
import { EnhancedTagData } from '../app/types/OuraInterfaces'; // Ensure these types are correctly imported

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

// Mock data for tests
const mockStravaData = [
  { day: '2023-04-01', distance: 10, totalElevationGain: 200 },
  // Add more mock data as needed
];

const mockHrvData = [
  { date: '2023-04-01', averageHRV: 50 },
  // Add more mock data as needed
];

const mockTagsData: EnhancedTagData[] = [
  {
      id: '4e65e255-cc2a-4105-a8d7-b1a5db64a3d5',
      tag_type_code: 'tag_generic_sick',
      start_time: '2023-04-01T19:45:21+08:00',
      end_time: null,
      start_day: '2023-04-01',
      end_day: null,
      comment: 'Potentially had food poisoning.'
  },
  // Add more objects as needed, ensuring they conform to the EnhancedTagData structure
];

describe('useProcessStravaAndHRVData Hook', () => {
  it('handles empty data inputs correctly', () => {
    const { result } = renderHook(() => useProcessStravaAndHRVData(null, null, null));
    expect(result.current).toEqual([]);
  });

  it('processes Strava data without HRV data correctly', () => {
    const { result } = renderHook(() => useProcessStravaAndHRVData(mockStravaData, null, mockTagsData));
    act(() => {
      // Intentionally empty: for demonstration purposes, assuming some effects might need to be triggered
    });
    const activities = result.current as ProcessedStravaActivity[];
    expect(activities.some(activity => activity.tags && activity.tags.length > 0)).toBeTruthy();
    expect(activities[0].day).toMatch(/\d{1,2}(st|nd|rd|th)? [A-Za-z]+ \d{4}/);
});

  it('merges and processes Strava and HRV data correctly', () => {
    const { result } = renderHook(() => useProcessStravaAndHRVData(mockStravaData, mockHrvData, mockTagsData));
    act(() => {
      // Again, intentionally empty for demonstration
    });
    const activities = result.current as ProcessedStravaActivity[];
    expect(activities[0]).toHaveProperty('averageHRV', 50);
  });

  it('integrates tags data correctly', () => {
    const { result } = renderHook(() => useProcessStravaAndHRVData(mockStravaData, null, mockTagsData));
    act(() => {
      // Force the hook to run its effects if necessary
    });
    const activities = result.current as ProcessedStravaActivity[];
    expect(activities[0].tags).toContain('tag_generic_sick: Potentially had food poisoning.'); // Ensure your mockTagsData or logic reflects this for the test to pass
  });

  // Add more tests as needed
});
