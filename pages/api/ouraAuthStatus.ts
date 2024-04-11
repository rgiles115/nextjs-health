import { NextApiRequest, NextApiResponse } from 'next';
import cookie, { serialize } from 'cookie';
import axios from 'axios';

// Load environment variables for Oura API
const OURA_CLIENT_ID = process.env.OURA_CLIENT_ID;
const OURA_CLIENT_SECRET = process.env.OURA_CLIENT_SECRET;

// Interface defining the structure of Oura cookie data
interface OuraCookieData {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    expires_at: number;
    last_checked: string; // Added to track the last check date
}

// Main handler for the API route
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Cache-Control', 'no-store');
    // Parse cookies from the request
    console.log("Attempting to check cookie for Oura token");
    const cookies = cookie.parse(req.headers.cookie || '');

    // Function to check if the Oura token needs refreshing (either expired, new day, or less than an hour left)
    const needsTokenRefresh = (ouraData: OuraCookieData): boolean => {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const currentDate = new Date().toDateString();
        const expired = currentTimestamp >= ouraData.expires_at;
        const isNewDay = ouraData.last_checked !== currentDate;
        const lessThanAnHourLeft = (ouraData.expires_at - currentTimestamp) < 3600; // Less than 3600 seconds left
        return expired || isNewDay || lessThanAnHourLeft;
    };


    // Function to refresh the Oura token
    const refreshOuraToken = async (ouraData: OuraCookieData): Promise<OuraCookieData | null> => {
        console.log("Attempting to refresh token for Oura");

        const params = new URLSearchParams();
        params.append('client_id', OURA_CLIENT_ID!);
        params.append('client_secret', OURA_CLIENT_SECRET!);
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', ouraData.refresh_token);

        try {
            const response = await axios.post('https://api.ouraring.com/oauth/token', params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const data = response.data;
            console.log('Refresh token response:', data);

            const currentTimestamp = Math.floor(Date.now() / 1000);
            const currentDate = new Date().toDateString(); // Get the current date as a string
            const expiresAt = currentTimestamp + data.expires_in;

            const refreshedData = {
                ...ouraData,
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_in: data.expires_in,
                expires_at: expiresAt,
                last_checked: currentDate, // Update last_checked to today's date
            };

            // Serialize the updated cookie data
            const cookieString = serialize('ouraData', JSON.stringify(refreshedData), {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                expires: new Date(expiresAt * 1000),
                path: '/',
            });

            // Set the updated cookie in the response header
            res.setHeader('Set-Cookie', cookieString);

            return refreshedData;
        } catch (error) {
            console.error('Error refreshing Oura token:', error);
            return null;
        }
    };

    // Attempt to retrieve and parse the Oura data from the cookie
    let ouraData: OuraCookieData | null = cookies.ouraData ? JSON.parse(cookies.ouraData) : null;
    if (ouraData && !ouraData.last_checked) {
        ouraData.last_checked = new Date().toDateString(); // Initialize if missing
    }
    // Check if the Oura token needs to be refreshed and attempt to refresh it
    if (ouraData && needsTokenRefresh(ouraData)) {
        console.log('Token needs refresh. Attempting to refresh.');
        const refreshedData = await refreshOuraToken(ouraData);
        if (refreshedData) {
            ouraData = refreshedData; // Successfully refreshed token
            console.log('Token successfully refreshed');
        } else {
            // Refresh failed, potentially requires re-authentication
            console.log('Token refresh failed. May require re-authentication.');
            return res.status(401).json({ error: 'reauthentication_required', message: 'Please re-authenticate.' });
        }
    }

    // Final check to determine if Oura authentication is valid
    const isOuraAuthed = ouraData && !needsTokenRefresh(ouraData);
    console.log('Oura Cookie:', JSON.stringify(ouraData));
    console.log('Final isOuraAuthed status:', isOuraAuthed);
    res.status(200).json({ isOuraAuthed });
}
