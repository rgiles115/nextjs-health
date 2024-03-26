import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { start_date, end_date } = req.query;

    // Validate required parameters.
    if (!start_date || !end_date) {
        return res.status(400).json({ error: 'Start and end dates are required' });
    }

    // Attempt to retrieve the Strava token from cookies.
    const cookies = new Cookies(req, res);
    const encodedStravaCookie = cookies.get('stravaData');
    if (!encodedStravaCookie) {
        return res.status(400).json({ error: 'Strava cookie not found' });
    }

    const stravaData = JSON.parse(decodeURIComponent(encodedStravaCookie));
    const accessToken = stravaData.access_token;

    // Proceed with fetching activities using the access token.
    try {
        const allActivities = [];
        let page = 1;
        const perPage = 200;
        
        while (true) {
            const response = await axios.get(`https://www.strava.com/api/v3/athlete/activities?before=${end_date}&after=${start_date}&per_page=${perPage}&page=${page}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (response.status !== 200 || response.data.length === 0) {
                break; // Exit if response is not OK or no more activities.
            }

            allActivities.push(...response.data);
            page++;
        }

        // Optionally fetch YTD ride totals if needed.
        const statsResponse = await axios.get(`https://www.strava.com/api/v3/athletes/${stravaData.athlete.id}/stats`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        res.status(200).json({
            activities: allActivities,
            ytdRideTotals: statsResponse.data.ytd_ride_totals
        });
    } catch (error) {
        console.error('Error fetching Strava activity data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}