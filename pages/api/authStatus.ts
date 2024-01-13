// pages/api/authStatus.ts
import { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';
import axios from 'axios';

// Load environment variables
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const OURA_CLIENT_ID = process.env.OURA_CLIENT_ID;
const OURA_CLIENT_SECRET = process.env.OURA_CLIENT_SECRET;

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


interface OuraCookieData {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  expires_at: number; // Add expires_at field to store the token's expiration timestamp
}

// Custom type for cookies
interface CustomCookies {
  stravaData?: string;
  ouraData?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Parse the cookies from the request
  const cookies: CustomCookies = cookie.parse(req.headers.cookie || '');

  // Function to check if the Strava cookie is expired
  const isStravaExpired = (stravaCookie: string): boolean => {
    try {
      const stravaData: StravaCookieData = JSON.parse(stravaCookie);
      console.log("Strava Expires:", stravaData.expires_at * 1000);
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

  // Function to check if the Oura cookie is expired
  const isOuraExpired = (ouraCookie: string): boolean => {
    try {
      const ouraData: OuraCookieData = JSON.parse(ouraCookie);
      console.log("Oura Cookie:", JSON.parse(ouraCookie) );
      // Assuming the time of cookie creation is not stored, we cannot accurately determine the expiration
      return false; // Unable to determine, returning false for now
    } catch (e) {
      return true; // If there's an error parsing, assume expired
    }
  };

  // Function to refresh the Oura token
  const refreshOuraToken = async (refreshToken: string): Promise<string | null> => {
    try {
      const response = await axios.post(
        'https://api.ouraring.com/oauth/token', // Oura token refresh endpoint
        {
          client_id: OURA_CLIENT_ID,
          client_secret: OURA_CLIENT_SECRET,
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
      console.error('Error refreshing Oura token:', error);
      return null;
    }
  };

  // Check if Strava cookie is present and not expired
  const isStravaAuthed = Boolean(cookies.stravaData) && !isStravaExpired(cookies.stravaData ?? '');

  // Refresh Strava token if it's expired
  if (isStravaAuthed) {
    console.log('Strava token is authenticated and not expired.');
    const stravaData: StravaCookieData = JSON.parse(cookies.stravaData!);
    const newAccessToken = await refreshStravaToken(stravaData.refresh_token);

    if (newAccessToken) {
      // Update the access token in the cookie
      stravaData.access_token = newAccessToken;
      res.setHeader('Set-Cookie', `stravaData=${JSON.stringify(stravaData)}`);
      console.log('Strava token refreshed.');
    } else {
      console.log('Failed to refresh Strava token.');
    }
  } else {
    console.log('Strava token is either not present or expired.');
  }

  // Check if Oura cookie is present
  const isOuraAuthed = Boolean(cookies.ouraData);

  // Check if Oura token is expired
  const isOuraExpiredValue = isOuraAuthed && isOuraExpired(cookies.ouraData ?? '');

  // Refresh Oura token if it's expired
  if (isOuraAuthed && isOuraExpiredValue) {
    console.log('Oura token is authenticated and expired.');
    const ouraData: OuraCookieData = JSON.parse(cookies.ouraData!);
    const newAccessToken = await refreshOuraToken(ouraData.refresh_token);

    if (newAccessToken) {
      // Update the access token and the expires_at timestamp in the cookie
      ouraData.access_token = newAccessToken;
      res.setHeader('Set-Cookie', `ouraData=${JSON.stringify(ouraData)}`);
      console.log('Oura token refreshed.');
    } else {
      console.log('Failed to refresh Oura token.');
    }
  } else {
    console.log('Oura token is either not present or expired.');
  }

  // Respond with the authentication status
  res.status(200).json({ isStravaAuthed, isOuraAuthed });
}