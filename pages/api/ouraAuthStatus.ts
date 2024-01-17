// pages/api/ouraAuthStatus.ts

// This code handles the authentication status of Oura tokens.
// It includes checks for token expiration, refreshes the token
// if necessary, and updates the client's cookie with the new
// token data.


import { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';
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
}

// Main handler for the API route
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Parse cookies from the request
    const cookies = cookie.parse(req.headers.cookie || '');

    // Function to check if the Oura token has expired
    const isOuraExpired = (ouraData: OuraCookieData): boolean => {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        // Compare current timestamp to token's expiry timestamp
        return currentTimestamp >= ouraData.expires_at;
    };

    // Function to refresh the Oura token
    const refreshOuraToken = async (ouraData: OuraCookieData): Promise<OuraCookieData | null> => {
        try {
            // Request to Oura API for token refresh
            const response = await axios.post(
                'https://api.ouraring.com/oauth/token',
                {
                    client_id: OURA_CLIENT_ID,
                    client_secret: OURA_CLIENT_SECRET,
                    grant_type: 'refresh_token',
                    refresh_token: ouraData.refresh_token,
                }
            );

            // If response is successful, return updated token data
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

    // Function to check if the Oura token is authenticated and not expired
    const isOuraAuthed = (): boolean => {
        if (cookies.ouraData) {
            try {
                // Parse the Oura data from the cookie
                const ouraData: OuraCookieData = JSON.parse(cookies.ouraData);
                // Check if the token is not expired
                return !isOuraExpired(ouraData);
            } catch (error) {
                return false;
            }
        }
        return false;
    };
    
    // Check the authentication status of the Oura token
    if (isOuraAuthed()) {
        console.log('Oura token is authenticated and not expired.');
    } else {
        console.log('Oura token is either not present or expired.');
        if (cookies.ouraData) {
            // If the token is expired, attempt to refresh it
            const ouraData: OuraCookieData = JSON.parse(cookies.ouraData);
            if (isOuraExpired(ouraData)) {
                const refreshedData = await refreshOuraToken(ouraData);
                if (refreshedData) {
                    // Update the cookie with the refreshed token data
                    res.setHeader('Set-Cookie', `ouraData=${JSON.stringify(refreshedData)}; HttpOnly; Secure`);
                    console.log('Oura token refreshed.');
                } else {
                    console.log('Failed to refresh Oura token.');
                }
            }
        }
    }
    
    // Respond with the authentication status
    res.status(200).json({ isOuraAuthed: isOuraAuthed() });
}
