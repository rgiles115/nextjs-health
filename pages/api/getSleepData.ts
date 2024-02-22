import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import { OuraData, SleepData } from '../../app/types/OuraInterfaces';


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
