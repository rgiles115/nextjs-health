import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';

interface OuraData {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    expires_at: number;
}

interface ReadinessData {
    data: ReadinessEntry[];
    next_token: string | null;
}

interface ReadinessEntry {
    id: string;
    contributors: Contributors;
    day: string;
    score: number;
    temperature_deviation: number;
    temperature_trend_deviation: number | null;
    timestamp: string;
}

interface Contributors {
    activity_balance: number | null;
    body_temperature: number;
    hrv_balance: number;
    previous_day_activity: number | null;
    previous_night: number;
    recovery_index: number;
    resting_heart_rate: number;
    sleep_balance: number;
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
        res.status(400).json({ error: 'Start and end dates are required' });
        return;
    }

    const cookies = new Cookies(req, res);
    const encodedOuraCookie = cookies.get('ouraData');

    if (!encodedOuraCookie) {
        res.status(400).json({ error: 'Oura cookie not found' });
        return;
    }

    const decodedOuraCookie = decodeURIComponent(encodedOuraCookie);
    const ouraData: OuraData = JSON.parse(decodedOuraCookie);
    const token = ouraData.access_token;
    const ouraApiUrl = `https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${start_date}&end_date=${end_date}`;

    try {
        const response = await fetch(ouraApiUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            res.status(response.status).json({ error: `Error from Oura API: ${response.statusText}` });
            return;
        }

        const data: ReadinessData = await response.json();

        res.status(200).json(processReadinessData(data));
    } catch (error) {
        console.error('Error fetching readiness data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }
}

function processReadinessData(data: ReadinessData): ReadinessData {
    data.data.forEach((entry: ReadinessEntry) => {
        entry.timestamp = convertToUTC(entry.timestamp);
    });

    return data;
}

function convertToUTC(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString();
}
