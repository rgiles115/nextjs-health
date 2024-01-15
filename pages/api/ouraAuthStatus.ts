// pages/api/ouraAuthStatus.ts
import { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';
import axios from 'axios';

// Load environment variables specific to Oura
const OURA_CLIENT_ID = process.env.OURA_CLIENT_ID;
const OURA_CLIENT_SECRET = process.env.OURA_CLIENT_SECRET;

interface OuraCookieData {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  expires_at: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const cookies = cookie.parse(req.headers.cookie || '');

    const isOuraExpired = (ouraData: OuraCookieData): boolean => {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        return currentTimestamp >= ouraData.expires_at;
    };

    const refreshOuraToken = async (ouraData: OuraCookieData): Promise<OuraCookieData | null> => {
        try {
            const response = await axios.post(
                'https://api.ouraring.com/oauth/token',
                {
                    client_id: OURA_CLIENT_ID,
                    client_secret: OURA_CLIENT_SECRET,
                    grant_type: 'refresh_token',
                    refresh_token: ouraData.refresh_token,
                }
            );

            if (response.data && response.data.access_token) {
                return {
                    ...ouraData,
                    access_token: response.data.access_token,
                    expires_at: Math.floor(Date.now() / 1000) + response.data.expires_in,
                    expires_in: response.data.expires_in,
                    refresh_token: response.data.refresh_token
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error refreshing Oura token:', error);
            return null;
        }
    };

    const isOuraAuthed = (): boolean => {
        if (cookies.ouraData) {
            try {
                const ouraData: OuraCookieData = JSON.parse(cookies.ouraData);
                return !isOuraExpired(ouraData);
            } catch (error) {
                return false;
            }
        }
        return false;
    };

    if (isOuraAuthed()) {
        console.log('Oura token is authenticated and not expired.');
    } else {
        console.log('Oura token is either not present or expired.');
        if (cookies.ouraData) {
            const ouraData: OuraCookieData = JSON.parse(cookies.ouraData);
            if (isOuraExpired(ouraData)) {
                const refreshedData = await refreshOuraToken(ouraData);
                if (refreshedData) {
                    // Set the updated cookie with the refreshed token data
                    res.setHeader('Set-Cookie', `ouraData=${JSON.stringify(refreshedData)}; HttpOnly; Secure`);
                    console.log('Oura token refreshed.');
                } else {
                    console.log('Failed to refresh Oura token.');
                }
            }
        }
    }

    res.status(200).json({ isOuraAuthed: isOuraAuthed() });
}
