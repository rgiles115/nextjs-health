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
    friend: null;
    follower: null;
  };
}

interface CustomCookies {
  stravaData?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const cookies: CustomCookies = cookie.parse(req.headers.cookie || '');
  
    const isStravaExpired = (stravaCookie: string): boolean => {
      try {
        const stravaData: StravaCookieData = JSON.parse(stravaCookie);
        const expirationDate = new Date(stravaData.expires_at * 1000);
        console.log(`Strava token expires at: ${expirationDate.toString()}`);
        return Date.now() >= stravaData.expires_at * 1000;
      } catch (e) {
        console.error('Error parsing Strava cookie:', e);
        return true;
      }
    };
  
    const refreshStravaToken = async (refreshToken: string): Promise<string | null> => {
      try {
        const response = await axios.post(
          'https://www.strava.com/api/v3/oauth/token',
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
  
    let stravaData: StravaCookieData | null = null;
    if (cookies.stravaData) {
      stravaData = JSON.parse(cookies.stravaData);
      console.log('Strava cookie found.');
    } else {
      console.log('No Strava cookie found.');
    }
  
    // Check if Strava cookie is present and not expired
    if (stravaData && cookies.stravaData && !isStravaExpired(cookies.stravaData)) {
      console.log('Strava token is authenticated and not expired.');
    } else {
      console.log('Strava token is either not present or expired.');
  
      // Refresh the token only if it's expired
      if (stravaData && cookies.stravaData && isStravaExpired(cookies.stravaData)) {
        if (stravaData.refresh_token) {
          console.log('Attempting to refresh Strava token...');
          const newAccessToken = await refreshStravaToken(stravaData.refresh_token);
  
          if (newAccessToken) {
            stravaData.access_token = newAccessToken;
            res.setHeader('Set-Cookie', `stravaData=${JSON.stringify(stravaData)}`);
            console.log('Strava token refreshed.');
  
            const newExpirationDate = new Date(Date.now() + stravaData.expires_in * 1000);
            console.log(`New Strava token expiration date: ${newExpirationDate.toString()}`);
          } else {
            console.log('Failed to refresh Strava token.');
          }
        }
      }
    }
  
    res.status(200).json({ isStravaAuthed: !!cookies.stravaData });
  }