// pages/api/getActivityData.js

export default async function handler(req, res) {
    const ouraApiUrl = 'https://api.ouraring.com/v2/usercollection/daily_activity?start_date=2023-12-01&end_date=2023-12-18';
    
    try {
        const response = await fetch(ouraApiUrl, {
            headers: { 'Authorization': 'Bearer YOUR_API_KEY' }  // Replace YOUR_API_KEY with your actual key
        });
        const data = await response.json();

        // Process and return the data
        res.status(200).json(processActivityData(data));
    } catch (error) {
        console.error('Error fetching activity data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

function processActivityData(data) {
    // Process and format the data from Oura API as needed
    return data;  // Return the processed data
}
