import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';

interface OuraData {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    expires_at: number;
}

interface SleepData {
    data: SleepEntry[];
    next_token: string | null;
}

interface SleepEntry {
    id: string;
    contributors: Contributors;
    day: string;
    score: number;
    timestamp: string;
    detailedSleepData: SleepEntry;  // Ensure this matches the declaration in SleepEntry
    hrv_values?: number[]; // Add this line to include HRV values
}

interface Contributors {
    deep_sleep: number;
    efficiency: number;
    latency: number;
    rem_sleep: number;
    restfulness: number;
    timing: number;
    total_sleep: number;
}

interface SleepData {
    data: SleepEntry[];
    next_token: string | null;
}

interface SleepEntry {
    id: string;
    average_breath: number;
    average_heart_rate: number;
    average_hrv: number | null;
    awake_time: number;
    bedtime_end: string;
    bedtime_start: string;
    day: string;
    deep_sleep_duration: number;
    efficiency: number;
    heart_rate: HeartRateData;
    hrv: HRVData;
    latency: number;
    light_sleep_duration: number;
    low_battery_alert: boolean;
    lowest_heart_rate: number;
    movement_30_sec: string;
    period: number;
    readiness: ReadinessData;
    readiness_score_delta: number | null;
    rem_sleep_duration: number;
    restless_periods: number;
    sleep_phase_5_min: string;
    sleep_score_delta: number | null;
    sleep_algorithm_version: string;
    time_in_bed: number;
    total_sleep_duration: number;
    type: string;
    detailedSleepData: DetailedSleepData;
}

interface HeartRateData {
    interval: number;
    items: (number | null)[];
    timestamp: string;
}

interface HRVData {
    interval: number;
    items: (number | null)[];
    timestamp: string;
}

interface ReadinessData {
    contributors: Contributors;
    score: number;
    temperature_deviation: number | null;
    temperature_trend_deviation: number;
}

interface Contributors {
    activity_balance: number;
    body_temperature: number | null;
    hrv_balance: number;
    previous_day_activity: number;
    previous_night: number | null;
    recovery_index: number | null;
    resting_heart_rate: number | null;
    sleep_balance: number;
}

type DetailedSleepData = SleepEntry;


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
        res.status(400).json({ error: 'Start and end dates are required' });
        return;
    }

    const cookies = new Cookies(req, res);
    const encodedOuraCookie = cookies.get('ouraData'); // Replace with your actual cookie name
    
    if (!encodedOuraCookie) {
        res.status(400).json({ error: 'Oura cookie not found' });
        return;
    }
    
    const decodedOuraCookie = decodeURIComponent(encodedOuraCookie);
    const ouraData: OuraData = JSON.parse(decodedOuraCookie);
    const token = ouraData.access_token;
    const ouraApiUrl = `https://api.ouraring.com/v2/usercollection/sleep?start_date=${start_date}&end_date=${end_date}`;

    try {
        const response = await fetch(ouraApiUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            res.status(response.status).json({ error: `Error from Oura API: ${response.statusText}` });
            return;
        }

        const data: SleepData = await response.json();

        for (const entry of data.data) {
            const detailedSleepData = await fetchDetailedSleepData(entry.id, token);
            if (detailedSleepData) {
                entry.detailedSleepData = detailedSleepData; // Combine the detailed data with the sleep entry
                entry.hrv_values = detailedSleepData.hrv_values; // Extract HRV values specifically
            }
        }

        res.status(200).json(data);
        // console.log('Sleep Data:', JSON.stringify(data));

    } catch (error) {
        console.error('Error fetching sleep data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }
}

// Function to fetch detailed sleep data
async function fetchDetailedSleepData(sleepId: string, token: string) {
    const detailedSleepApiUrl = `https://api.ouraring.com/v2/usercollection/sleep/${sleepId}`; // Ensure correct API endpoint
    try {
        const response = await fetch(detailedSleepApiUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            console.error(`Error fetching detailed sleep data for ID ${sleepId}: Status ${response.status}`);
            return null; // Handle error as appropriate
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching detailed sleep data for ID ${sleepId}:`, error);
        return null; // Handle error as appropriate
    }
}
