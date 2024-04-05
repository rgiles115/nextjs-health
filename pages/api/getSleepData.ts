import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import { OuraData, SleepData } from '../../app/types/OuraInterfaces';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
        return res.status(400).json({ error: 'Start and end dates are required' });
    }

    // Convert and adjust the start and end dates to UTC
    // Move start_date back by one day to include the starting day fully in the range
    const adjustedStartDate = new Date(start_date + 'T00:00:00Z');
    adjustedStartDate.setDate(adjustedStartDate.getDate() - 1);
    start_date = adjustedStartDate.toISOString().split('T')[0];
    
    // Extend end_date by one day if necessary, to ensure the end date is inclusive
    const adjustedEndDate = new Date(end_date + 'T00:00:00Z');
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1); // Comment this line out if extending the end date is not desired
    end_date = adjustedEndDate.toISOString().split('T')[0];

    const cookies = new Cookies(req, res);
    const encodedOuraCookie = cookies.get('ouraData'); 
    
    if (!encodedOuraCookie) {
        return res.status(400).json({ error: 'Oura cookie not found' });
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
            return res.status(response.status).json({ error: `Error from Oura API: ${response.statusText}` });
        }

        const data: SleepData = await response.json();

        // Map sleep entries to fetch promises for detailed data
        const fetchPromises = data.data.map(entry => fetchDetailedSleepData(entry.id, token));

        // Use Promise.all to wait for all promises to resolve
        const detailedDataResults = await Promise.all(fetchPromises);

        // Combine the detailed data with each sleep entry
        data.data.forEach((entry, index) => {
            const detailedSleepData = detailedDataResults[index];
            if (detailedSleepData) {
                entry.detailedSleepData = detailedSleepData;
                entry.hrv_values = detailedSleepData.hrv_values;
            }
        });
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching sleep data:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Function to fetch detailed sleep data
async function fetchDetailedSleepData(sleepId: string, token: string) {
    const detailedSleepApiUrl = `https://api.ouraring.com/v2/usercollection/sleep/${sleepId}`;
    try {
        const response = await fetch(detailedSleepApiUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            console.error(`Error fetching detailed sleep data for ID ${sleepId}: Status ${response.status}`);
            return null; // Handle error appropriately
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching detailed sleep data for ID ${sleepId}:`, error);
        return null; // Handle error appropriately
    }
}
