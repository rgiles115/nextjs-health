// Importing necessary modules from Next.js and external libraries.
import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies'; // Used for handling cookies in Next.js API routes.
import axios, { AxiosError } from 'axios';

interface ErrorResponse {
    error: string;
}

// Asynchronous function to handle requests to this API route.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Destructuring query parameters from the request object.
    const { start_date, end_date } = req.query;

    // Validation: Check if both start and end dates are provided in the query.
    if (!start_date || !end_date) {
        // Responds with a 400 error if either is missing.
        res.status(400).json({ error: 'Start and end dates are required.' });
        return; // Exit the function to prevent further execution.
    }

    // Initialize cookies with the request and response objects.
    const cookies = new Cookies(req, res);
    // Attempt to retrieve the 'ouraData' cookie, which should contain authentication details.
    const encodedOuraCookie = cookies.get('ouraData'); // Ensure the cookie name matches what's set by your application.

    // Check if the Oura cookie is not found.
    if (!encodedOuraCookie) {
        // Responds with a 400 error if the cookie is missing.
        res.status(400).json({ error: 'Oura authentication details not found.' });
        return; // Exit the function to prevent further execution.
    }

    // Decode the URL-encoded Oura cookie to obtain the actual string.
    const decodedOuraCookie = decodeURIComponent(encodedOuraCookie);
    // Parse the JSON stored in the cookie to get the Oura data object.
    const ouraData = JSON.parse(decodedOuraCookie);
    // Extract the access token from the Oura data object.
    const token = ouraData.access_token; // Ensure this matches the structure of your stored cookie data.

    // Construct the URL for the Oura API request using the start and end dates provided by the user.
    const ouraApiUrl = `https://api.ouraring.com/v2/usercollection/enhanced_tag?start_date=${start_date}&end_date=${end_date}`;

    try {
        const response = await axios.get(ouraApiUrl, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
    
        res.status(200).json(response.data);
    } catch (error: unknown) {
        console.log('Error caught:', error);
        console.log('Is Axios Error:', axios.isAxiosError(error));
    
        if (axios.isAxiosError(error)) {
            // Correctly identified as an Axios error
            const status = error.response?.status || 500;
            const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
    
            console.error('Axios Error fetching enhanced tags data:', errorMessage);
            res.status(status).json({ error: errorMessage });
        } else {
            // Handle non-Axios errors
            console.error('Non-Axios Error fetching enhanced tags data:', error);
            res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }
    
}
