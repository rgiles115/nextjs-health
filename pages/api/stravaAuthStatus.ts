// pages/api/stravaAuthStatus.ts

// This code handles the authentication status of Strava tokens.
// It includes checks for token expiration, refreshes the token
// if necessary, and updates the client's cookie with the new
// token data.

import { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';
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
        // Athlete-specific data
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

// Interface for custom cookie structure
interface CustomCookies {
    stravaData?: string;
}

// Main handler for the API route
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Parse cookies from the request
    const cookies: CustomCookies = cookie.parse(req.headers.cookie || '');
    console.log('Cookies:', cookies);
    // Function to check if the Strava token has expired
    const isStravaExpired = (stravaCookie: string): boolean => {
        try {
            // Parse Strava data from cookie
            const stravaData: StravaCookieData = JSON.parse(stravaCookie);
            // Compare current timestamp to token's expiry timestamp
            return Date.now() >= stravaData.expires_at * 1000;
        } catch (e) {
            console.error('Error parsing Strava cookie:', e);
            return true;
        }
    };

    // Function to refresh the Strava token
    const refreshStravaToken = async (stravaData: StravaCookieData): Promise<StravaCookieData | null> => {
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
            if (axios.isAxiosError(error)) {
                // Axios-specific error
                console.error('Axios error refreshing Strava token:', error.message);
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.error('Error data:', error.response.data);
                    console.error('Error status:', error.response.status);
                    console.error('Error headers:', error.response.headers);
                } else if (error.request) {
                    // The request was made but no response was received
                    console.error('Error request:', error.request);
                }
            } else {
                // Non-Axios error
                console.error('Error refreshing Strava token:', error);
            }
            return null;
        }
    };


    // Initialize stravaData variable, to be populated with parsed cookie data
    let stravaData: StravaCookieData | null = null;
    if (cookies.stravaData) {
        // Parse the Strava data from the cookie
        stravaData = JSON.parse(cookies.stravaData);
    }

    // Check the authentication and expiry status of the Strava token
    if (stravaData && cookies.stravaData) {
        if (!isStravaExpired(cookies.stravaData)) {
            // Token is valid and not expired
            // console.log('Strava token is authenticated and not expired.');
        } else {
            // Token is either not present or expired
            // console.log('Strava token is either not present or expired.');
            if (stravaData.refresh_token) {
                // Attempt to refresh the Strava token
                const refreshedStravaData = await refreshStravaToken(stravaData);
                if (refreshedStravaData) {
                    // Update the cookie with the refreshed token data
                    res.setHeader('Set-Cookie', `stravaData=${JSON.stringify(refreshedStravaData)}; HttpOnly; Secure`);
                    console.log('Strava token refreshed.');
                } else {
                    console.log('Failed to refresh Strava token.');
                }
            }
        }
    }
    if (stravaData) {
        // Token is authenticated, include athlete data in the response
        res.status(200).json({ isStravaAuthed: true, athlete: stravaData.athlete });
    } else {
        // Token is not authenticated, respond without athlete data
        res.status(200).json({ isStravaAuthed: false });
    }
}