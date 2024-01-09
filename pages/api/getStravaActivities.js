import Cookies from 'cookies';

export default async function handler(req, res) {
    const { start_date, end_date } = req.query;

    // Check if start and end dates are provided
    if (!start_date || !end_date) {
        res.status(400).json({ error: 'Start and end dates are required' });
        return;
    }

    // Retrieve the access token from the cookie
    const cookies = new Cookies(req, res);
    const encodedStravaCookie = cookies.get('stravaData'); // Replace with your actual cookie name

    if (!encodedStravaCookie) {
        res.status(400).json({ error: 'Strava cookie not found' });
        return;
    }

    const decodedStravaCookie = decodeURIComponent(encodedStravaCookie);
    const stravaData = JSON.parse(decodedStravaCookie);
    const accessToken = stravaData.access_token;

    const stravaApiUrl = `https://www.strava.com/api/v3/athlete/activities?before=${end_date}&after=${start_date}`;

    try {
        const response = await fetch(stravaApiUrl, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!response.ok) {
            res.status(response.status).json({ error: `Error from Strava API: ${response.statusText}` });
            return;
        }

        const activities = await response.json();
        console.log("Strava Data:", activities);
        res.status(200).json(activities);
    } catch (error) {
        console.error('Error fetching Strava activity data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
