import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import { OuraData } from '../../app/types/OuraInterfaces';
import { DailySleepData } from '../../app/types/OuraInterfaces';

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
    const ouraApiUrl = `https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${start_date}&end_date=${end_date}`;

    try {
        const response = await fetch(ouraApiUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            res.status(response.status).json({ error: `Error from Oura API: ${response.statusText}` });
            return;
        }

        let data: DailySleepData = await response.json();

        // Create a list of promises for fetching detailed sleep data
        const detailedDataPromises = data.data.map(entry => fetchDetailedSleepData(entry.id, token));

        // Await all promises to resolve
        const detailedSleepDataResults = await Promise.all(detailedDataPromises);

        // Combine the detailed data with the respective sleep entries
        data.data.forEach((entry, index) => {
            entry.detailedSleepData = detailedSleepDataResults[index];
        });

        res.status(200).json(processSleepData(data));
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }

}

// Function to fetch detailed sleep data
async function fetchDetailedSleepData(sleepId: string, token: string) {
    const detailedSleepApiUrl = `https://api.ouraring.com/v2/usercollection/daily_sleep/${sleepId}`; // Ensure correct API endpoint
    try {
        const response = await fetch(detailedSleepApiUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            // console.error(`Error fetching detailed daily sleep data in getSleepData for ID ${sleepId}: Status ${response.status}`);
            return null; // Handle error as appropriate
        }
        return await response.json();
    } catch (error) {
        // console.error(`Error fetching detailed daily sleep data in getSleepData for ID ${sleepId}:`, error);
        return null; // Handle error as appropriate
    }
}

function processSleepData(data: DailySleepData): DailySleepData {
    data.data.forEach(entry => {
        entry.timestamp = convertToUTC(entry.timestamp);
        // No need to fetch detailed data here as it's done in the handler
    });
    return data;
}

function convertToUTC(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString(); // Converts to UTC and formats as an ISO string
}
