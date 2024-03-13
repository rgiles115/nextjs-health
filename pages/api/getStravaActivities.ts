import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import axios from 'axios';

interface StravaData {
    token_type: string;
    expires_at: number;
    expires_in: number;
    refresh_token: string;
    access_token: string;
    athlete: {
      id: number;
      username: string;
      resource_state: number;
      firstname: string;
      lastname: string;
      bio: string;
      city: string;
      state: string;
      country: string;
      sex: string;
      premium: boolean;
      summit: boolean;
      created_at: string;
      updated_at: string;
      badge_type_id: number;
      weight: number;
      profile_medium: string;
      profile: string;
      friend: null;
      follower: null;
    };
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

// Function to check if Strava token is expired
const isStravaExpired = (stravaData: StravaData): boolean => {
    return Date.now() >= stravaData.expires_at * 1000;
};

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;


// Function to refresh Strava token
const refreshStravaToken = async (stravaData: StravaData): Promise<StravaData | null> => {
    try {
        const response = await axios.post(
            'https://www.strava.com/api/v3/oauth/token',
            {
                client_id: STRAVA_CLIENT_ID,
                client_secret: STRAVA_CLIENT_SECRET,
                grant_type: 'refresh_token',
                refresh_token: stravaData.refresh_token,
            }
        );

        if (response.data) {
            return {
                ...stravaData,
                access_token: response.data.access_token,
                expires_at: Math.floor(Date.now() / 1000) + response.data.expires_in,
                expires_in: response.data.expires_in,
                refresh_token: response.data.refresh_token
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error refreshing Strava token:', error);
        return null;
    }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
        res.status(400).json({ error: 'Start and end dates are required' });
        return;
    }

    const cookies = new Cookies(req, res);
    const encodedStravaCookie = cookies.get('stravaData');

    if (!encodedStravaCookie) {
        res.status(400).json({ error: 'Strava cookie not found' });
        return;
    }

    let stravaData = JSON.parse(decodeURIComponent(encodedStravaCookie));

    if (isStravaExpired(stravaData)) {
        const refreshedStravaData = await refreshStravaToken(stravaData);
        if (refreshedStravaData) {
            stravaData = refreshedStravaData;
            res.setHeader('Set-Cookie', `stravaData=${encodeURIComponent(JSON.stringify(refreshedStravaData))}; HttpOnly; Secure`);
        } else {
            res.status(500).json({ error: 'Failed to refresh Strava token' });
            return;
        }
    }

    const accessToken = stravaData.access_token;
    const allActivities = [];
    let page = 1;
    const perPage = 200;

    try {
        while (true) {
            const activitiesResponse = await axios.get(`https://www.strava.com/api/v3/athlete/activities?before=${end_date}&after=${start_date}&per_page=${perPage}&page=${page}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (activitiesResponse.status !== 200) {
                break; // Exit loop if there's an error or no more activities
            }

            const activities = activitiesResponse.data;
            if (activities.length === 0) {
                break; // No more activities to fetch
            }

            allActivities.push(...activities);
            page++;
        }

        // Fetch YTD ride totals
        const statsResponse = await axios.get(`https://www.strava.com/api/v3/athletes/${stravaData.athlete.id}/stats`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        const ytdRideTotals = statsResponse.data.ytd_ride_totals;

        // console.log('Strava:', allActivities);
        // console.log('Start Date:', start_date);

        // Include YTD ride totals in the response
        res.status(200).json({
            activities: allActivities,
            ytdRideTotals: ytdRideTotals
        });

    } catch (error) {
        console.error('Error fetching Strava activity data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}