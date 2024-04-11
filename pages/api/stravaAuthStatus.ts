// pages/api/stravaAuthStatus.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import axios from 'axios';

// Load environment variables for Strava API
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

// Interface defining the structure of Strava cookie data
interface StravaCookieData {
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Cache-Control', 'no-store');
    console.log("Strava Auth Status Check Started");

    const cookies = req.cookies;
    console.log("Cookies received:", cookies);
    const stravaDataCookie = cookies.stravaData ? JSON.parse(cookies.stravaData) as StravaCookieData : null;

    if (stravaDataCookie) {
        console.log("StravaData cookie found:", stravaDataCookie);
        if (new Date().getTime() >= stravaDataCookie.expires_at * 1000) {
            console.log("Token expired, attempting to refresh");
            try {
                const response = await axios.post('https://www.strava.com/api/v3/oauth/token', {
                    client_id: STRAVA_CLIENT_ID,
                    client_secret: STRAVA_CLIENT_SECRET,
                    grant_type: 'refresh_token',
                    refresh_token: stravaDataCookie.refresh_token,
                });

                console.log("Token refresh response:", response.data);

                const refreshedData: StravaCookieData = {
                    ...stravaDataCookie,
                    access_token: response.data.access_token,
                    expires_at: Math.floor(Date.now() / 1000) + response.data.expires_in,
                    expires_in: response.data.expires_in,
                    refresh_token: response.data.refresh_token,
                };

                const serializedCookie = serialize('stravaData', JSON.stringify(refreshedData), {
                    httpOnly: true,
                    secure: process.env.NODE_ENV !== 'development',
                    sameSite: 'strict',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 7, // One week
                });

                console.log("Setting refreshed cookie");
                res.setHeader('Set-Cookie', serializedCookie);
                res.status(200).json({ isStravaAuthed: true, message: 'Strava token refreshed' });
            } catch (error) {
                console.error('Error refreshing Strava token:', error);
                res.status(500).json({ message: 'Failed to refresh Strava token' });
            }
        } else {
            console.log("Token is valid and not expired");
            res.status(200).json({ isStravaAuthed: true, athlete: stravaDataCookie.athlete });
        }
    } else {
        console.log("No StravaData cookie found, not authenticated");
        res.status(200).json({ isStravaAuthed: false });
    }
}
