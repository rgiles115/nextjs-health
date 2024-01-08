// pages/api/getReadinessData.js

import Cookies from 'cookies';

export default async function handler(req, res) {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
        res.status(400).json({ error: 'Start and end dates are required' });
        return;
    }

       // Retrieve the access token from the cookie
       const cookies = new Cookies(req, res);
       const encodedOuraCookie = cookies.get('ouraData'); // Replace with your actual cookie name
   
       if (!encodedOuraCookie) {
           res.status(400).json({ error: 'Oura cookie not found' });
           return;
       }
   
       const decodedOuraCookie = decodeURIComponent(encodedOuraCookie);
       const ouraData = JSON.parse(decodedOuraCookie);
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

        const data = await response.json();

        res.status(200).json(processReadinessData(data));
    } catch (error) {
        console.error('Error fetching readiness data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }
}

function processReadinessData(data) {
    // Process and format the readiness data from Oura API as needed
    return data;  // Return the processed data
}
