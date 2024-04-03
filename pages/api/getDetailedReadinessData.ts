import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import { OuraData, OuraReadinessData, DetailedReadinessData } from '../../app/types/OuraInterfaces'; // Ensure you have corresponding interfaces for these types

// Handler for fetching daily readiness data including detailed information for each document
export default async function readinessHandler(req: NextApiRequest, res: NextApiResponse) {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
        res.status(400).json({ error: 'Start and end dates are required' });
        return;
    }

    const cookies = new Cookies(req, res);
    const encodedOuraCookie = cookies.get('ouraData'); // Use the actual cookie name here
    
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

        const data: OuraReadinessData = await response.json(); // Ensure your ReadinessData type matches the expected response structure

        // Fetch detailed data for each readiness entry
        const fetchPromises = data.data.map(entry => fetchDetailedReadinessData(entry.id, token));

        // Wait for all detailed data fetching to complete
        const detailedDataResults = await Promise.all(fetchPromises);

        // Combine detailed data with each readiness entry
        data.data.forEach((entry, index) => {
            const detailedReadinessData = detailedDataResults[index];
            if (detailedReadinessData) {
                entry.detailedData = detailedReadinessData; // Adjust based on your needs
            }
        });
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching readiness data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }
}

// Function to fetch detailed readiness data for a given document ID
async function fetchDetailedReadinessData(documentId: string, token: string): Promise<DetailedReadinessData | null> {
    const detailedReadinessApiUrl = `https://api.ouraring.com/v2/usercollection/daily_readiness/${documentId}`;
    try {
        const response = await fetch(detailedReadinessApiUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            console.error(`Error fetching detailed readiness data for ID ${documentId}: Status ${response.status}`);
            return null; // Handle error as appropriate
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching detailed readiness data for ID ${documentId}:`, error);
        return null; // Handle error as appropriate
    }
}
