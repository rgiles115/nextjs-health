// pages/api/stravaAuthStatus.ts
import { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';
import axios from 'axios';

// Load environment variables specific to Strava
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

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
    friend: null; // Adjust if there's a specific type
    follower: null; // Adjust if there's a specific type
  };
}

// Custom type for cookies
interface CustomCookies {
  stravaData?: string;
  // Define Oura-specific cookie data structure here
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Parse the cookies from the request
  const cookies: CustomCookies = cookie.parse(req.headers.cookie || '');

  // Function to check if the Strava cookie is expired
  const isStravaExpired = (stravaCookie: string): boolean => {
    try {
      const stravaData: StravaCookieData = JSON.parse(stravaCookie);
      return Date.now() >= stravaData.expires_at * 1000; // Convert to milliseconds
    } catch (e) {
      return true; // If there's an error parsing, assume expired
    }
  };

  // Function to refresh the Strava token
  const refreshStravaToken = async (refreshToken: string): Promise<string | null> => {
    try {
      const response = await axios.post(
        'https://www.strava.com/api/v3/oauth/token', // Strava token refresh endpoint
        {
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }
      );

      if (response.data && response.data.access_token) {
        return response.data.access_token;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error refreshing Strava token:', error);
      return null;
    }
  };

  // Check if Strava cookie is present and not expired
  if (cookies.stravaData && !isStravaExpired(cookies.stravaData)) {
    console.log('Strava token is authenticated and not expired.');
  } else {
    console.log('Strava token is either not present or expired.');

    if (cookies.stravaData) {
      // The token is expired, refresh it
      const stravaData: StravaCookieData = JSON.parse(cookies.stravaData);
      const newAccessToken = await refreshStravaToken(stravaData.refresh_token);

      if (newAccessToken) {
        // Update the access token in the cookie
        stravaData.access_token = newAccessToken;
        res.setHeader('Set-Cookie', `stravaData=${JSON.stringify(stravaData)}`);
        console.log('Strava token refreshed.');
      } else {
        console.log('Failed to refresh Strava token.');
      }
    }
  }

  // Respond with the authentication status for Strava
  res.status(200).json({ isStravaAuthed: !!cookies.stravaData });
}
