import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import { OuraData, DailyReadinessData, DailyReadinessEntry } from '../../app/types/OuraInterfaces';


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
        const readinessResponse = await fetch(ouraApiUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!readinessResponse.ok) {
            res.status(readinessResponse.status).json({ error: `Error from Oura API: ${readinessResponse.statusText}` });
            return;
        }

        const readinessData: DailyReadinessData = await readinessResponse.json();
        // Map each readiness entry to a promise for fetching sleep data
        const sleepDataPromises = readinessData.data.map(entry =>
            fetchSleepData(entry.id, token)
        );

        // Use Promise.all to wait for all sleep data fetch operations to complete
        const sleepDataResults = await Promise.all(sleepDataPromises);

        // Assign fetched sleep data to the respective readiness entries
        readinessData.data.forEach((entry, index) => {
            entry.sleepData = sleepDataResults[index];
        });

        res.status(200).json(processReadinessData(readinessData));
    } catch (error) {
        console.error('Error fetching readiness data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }
}

// Function to fetch individual sleep data
async function fetchSleepData(sleepId: string, token: string) {
    const sleepApiUrl = `https://api.ouraring.com/v2/usercollection/sleep/${sleepId}`; // Ensure this is the correct endpoint
    try {
        const response = await fetch(sleepApiUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            // console.error(`Error fetching sleep data for ID ${sleepId}: Status ${response.status}`);
            const responseBody = await response.text(); // Get the response body as text
            // console.error(`Response body: ${responseBody}`); // Log the response body
            return null;
        }
        return await response.json();
    } catch (error) {
        // console.error(`Error fetching sleep data for ID ${sleepId}:`, error);
        return null;
    }
}


function processReadinessData(data: DailyReadinessData): DailyReadinessData {
    data.data.forEach((entry: DailyReadinessEntry) => {
        entry.timestamp = convertToUTC(entry.timestamp);
    });

    return data;
}

function convertToUTC(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString();
}
