// pages/api/getActivityData.js

export default async function handler(req, res) {
    const { start_date, end_date } = req.query;

    // Check if start and end dates are provided
    if (!start_date || !end_date) {
        res.status(400).json({ error: 'Start and end dates are required' });
        return;
    }

    const ouraApiUrl = `https://api.ouraring.com/v2/usercollection/daily_activity?start_date=${start_date}&end_date=${end_date}`;
    const token = process.env.OURA_API_BEARER_TOKEN;

    try {
        const response = await fetch(ouraApiUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            // Send a response if the API call was not successful
            res.status(response.status).json({ error: `Error from Oura API: ${response.statusText}` });
            return;
        }

        const data = await response.json();

        // Process and return the data
        res.status(200).json(processActivityData(data));



    } catch (error) {
        console.error('Error fetching activity data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }
}

function processActivityData(data) {
    // Process and format the data from Oura API as needed

    return data;  // Return the processed data
}
