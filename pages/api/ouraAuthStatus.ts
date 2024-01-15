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
    const isOuraExpired = (ouraCookie: string): boolean => {
        try {
          const ouraData: OuraCookieData = JSON.parse(ouraCookie);
          const currentTimestamp = Math.floor(Date.now() / 1000);
          
          // Debugging: Log the raw value of expires_at
          // console.log(`Raw expires_at value: ${ouraData.expires_at}`);
          const expirationDate = new Date(ouraData.expires_at * 1000);
          console.log(`Oura token expires at: ${expirationDate.toString()}`);
          
          return currentTimestamp >= ouraData.expires_at;
        } catch (e) {
          console.error('Error parsing Oura cookie:', e);
          return true;
        }
      };

  const refreshOuraToken = async (refreshToken: string): Promise<string | null> => {
    try {
      const response = await axios.post(
        'https://api.ouraring.com/oauth/token',
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

  const isOuraAuthed = (req: NextApiRequest): boolean => {
    const cookies = cookie.parse(req.headers.cookie || '');
    if ('ouraData' in cookies) {
      try {
        const ouraData: OuraCookieData = JSON.parse(cookies['ouraData']);
        return !isOuraExpired(cookies['ouraData']);
      } catch (error) {
        return false;
      }
    }
    return false;
  };

  if (isOuraAuthed(req)) {
    console.log('Oura token is authenticated and not expired.');
  } else {
    console.log('Oura token is either not present or expired.');
    const cookies = cookie.parse(req.headers.cookie || '');
    if ('ouraData' in cookies) {
      const ouraData: OuraCookieData = JSON.parse(cookies['ouraData']);
      if (isOuraExpired(cookies['ouraData'])) {
        const newAccessToken = await refreshOuraToken(ouraData.refresh_token);
        if (newAccessToken) {
          ouraData.access_token = newAccessToken;
          // Calculate the new expiration date
          const newExpirationDate = new Date(Date.now() + ouraData.expires_in * 1000);
          console.log(`New Oura token expiration date: ${newExpirationDate.toString()}`);
          res.setHeader('Set-Cookie', `ouraData=${JSON.stringify(ouraData)}`);
          console.log('Oura token refreshed.');
        } else {
          console.log('Failed to refresh Oura token.');
        }
      }
    }
  }

  res.status(200).json({ isOuraAuthed: isOuraAuthed(req) });
}
