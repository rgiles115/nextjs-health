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
        return Date.now() >= stravaData.expires_at * 1000;
      } catch (e) {
        console.error('Error parsing Strava cookie:', e);
        return true;
      }
    };
  
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
        console.error('Error refreshing Strava token:', error);
        return null;
      }
    };
  
    let stravaData: StravaCookieData | null = null;
    if (cookies.stravaData) {
      stravaData = JSON.parse(cookies.stravaData);
    }
    
    // Later in your code, when you call isStravaExpired and refreshStravaToken
    if (stravaData && cookies.stravaData) {
      if (!isStravaExpired(cookies.stravaData)) {
        console.log('Strava token is authenticated and not expired.');
      } else {
        console.log('Strava token is either not present or expired.');
        if (stravaData.refresh_token) {
          const refreshedStravaData = await refreshStravaToken(stravaData);
          if (refreshedStravaData) {
            res.setHeader('Set-Cookie', `stravaData=${JSON.stringify(refreshedStravaData)}; HttpOnly; Secure`);
            console.log('Strava token refreshed.');
          } else {
            console.log('Failed to refresh Strava token.');
          }
        }
      }
    }
    
    res.status(200).json({ isStravaAuthed: !!stravaData });

}