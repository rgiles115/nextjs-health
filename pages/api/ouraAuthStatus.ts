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
  // Define Oura-specific cookie data structure here
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Function to check if the Oura cookie is expired
  const isOuraExpired = (ouraCookie: OuraCookieData): boolean => {
    const currentTimestamp = Math.floor(Date.now() / 1000); // Convert to seconds
    return currentTimestamp >= ouraCookie.expires_at;
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

  // Parse the cookies from the request
  const cookies = cookie.parse(req.headers.cookie || '');

  if ('ouraData' in cookies) {
    try {
      const ouraData: OuraCookieData = JSON.parse(cookies['ouraData']);

      if (!isOuraExpired(ouraData)) {
        // Check if the token is not expired
        console.log('Oura token is authenticated and not expired.');

        // Respond with the authentication status for Oura
        return res.status(200).json({ isOuraAuthed: true });
      } else {
        console.log('Oura token has expired.');
        
        const newAccessToken = await refreshOuraToken(ouraData.refresh_token);

        if (newAccessToken) {
          // Update the access token in the cookie
          ouraData.access_token = newAccessToken;
          res.setHeader('Set-Cookie', `ouraData=${JSON.stringify(ouraData)}`);
          console.log('Oura token refreshed.');
        } else {
          console.log('Failed to refresh Oura token.');
        }

        // Respond with the authentication status for Oura
        return res.status(200).json({ isOuraAuthed: true });
      }
    } catch (error) {
      // If there's an error parsing the cookie, assume the session is not valid
      console.log('Error parsing cookie:', error);
    }
  }

  // If the cookie is not present or has expired
  console.log('Oura token is either not present or expired.');
  return res.status(200).json({ isOuraAuthed: false });
}
