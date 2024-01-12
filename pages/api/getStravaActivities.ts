import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';

interface StravaData {
    access_token: string;
}

// Replace 'any' with a more detailed structure of Strava activities if known
interface StravaActivity {
    resource_state: number;
    athlete: {
        id: number;
        resource_state: number;
    };
    name: string;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    total_elevation_gain: number;
    type: string;
    sport_type: string;
    id: number;
    start_date: string;
    start_date_local: string;
    timezone: string;
    utc_offset: number;
    location_city: string | null;
    location_state: string | null;
    location_country: string;
    achievement_count: number;
    kudos_count: number;
    comment_count: number;
    athlete_count: number;
    photo_count: number;
    map: {
        id: string;
        summary_polyline: string;
        resource_state: number;
    };
    trainer: boolean;
    commute: boolean;
    manual: boolean;
    private: boolean;
    visibility: string;
    flagged: boolean;
    gear_id: string;
    start_latlng: number[];
    end_latlng: number[];
    average_speed: number;
    max_speed: number;
    average_cadence: number;
    average_watts: number;
    max_watts: number;
    weighted_average_watts: number;
    kilojoules: number;
    device_watts: boolean;
    has_heartrate: boolean;
    average_heartrate: number;
    max_heartrate: number;
    heartrate_opt_out: boolean;
    display_hide_heartrate_option: boolean;
    elev_high: number;
    elev_low: number;
    upload_id: number;
    upload_id_str: string;
    external_id: string;
    from_accepted_tag: boolean;
    pr_count: number;
    total_photo_count: number;
    has_kudoed: boolean;
    suffer_score: number;
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    const stravaData: StravaData = JSON.parse(decodedStravaCookie);
    const accessToken = stravaData.access_token;

    const perPage = 30; // Number of activities per page (default is 30)
    let page = 1; // Start with page 1
    const allActivities = [];

    try {
        while (true) {
            const stravaApiUrl = `https://www.strava.com/api/v3/athlete/activities?before=${end_date}&after=${start_date}&per_page=${perPage}&page=${page}`;
            const response = await fetch(stravaApiUrl, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (!response.ok) {
                res.status(response.status).json({ error: `Error from Strava API: ${response.statusText}` });
                return;
            }

            const activities: StravaActivity[] = await response.json();
            if (activities.length === 0) {
                // No more activities to fetch, break out of the loop
                break;
            }

            allActivities.push(...activities);
            page++;
        }

        res.status(200).json(allActivities);
    } catch (error) {
        console.error('Error fetching Strava activity data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}