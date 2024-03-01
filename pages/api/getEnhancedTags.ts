import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import axios from 'axios'; // Using axios for convenience, but 'fetch' works too

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
        res.status(400).json({ error: 'Start and end dates are required.' });
        return;
    }

    const cookies = new Cookies(req, res);
    const encodedOuraCookie = cookies.get('ouraData'); // Use your actual cookie name

    if (!encodedOuraCookie) {
        res.status(400).json({ error: 'Oura authentication details not found.' });
        return;
    }

    const decodedOuraCookie = decodeURIComponent(encodedOuraCookie);
    const ouraData = JSON.parse(decodedOuraCookie);
    const token = ouraData.access_token; // Ensure this matches the structure of your cookie

    // Define the URL for the Oura API endpoint you want to hit
    const ouraApiUrl = `https://api.ouraring.com/v2/usercollection/enhanced_tag?start_date=${start_date}&end_date=${end_date}`;

    try {
        const response = await axios.get(ouraApiUrl, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        // Assuming the response structure matches what you expect, directly relay it
        res.status(200).json(response.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching enhanced tags data:', error.response?.data);
            res.status(error.response?.status || 500).json({ error: error.response?.data.error || 'An error occurred while fetching enhanced tags data.' });
        } else {
            console.error('Error fetching enhanced tags data:', error);
            res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }
}
