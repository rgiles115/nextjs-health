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
      return currentTimestamp >= ouraData.expires_at;
  };

  // Function to refresh the Oura token
  const refreshOuraToken = async (ouraData: OuraCookieData): Promise<OuraCookieData | null> => {
      try {
          const response = await axios.post('https://api.ouraring.com/oauth/token', {
              client_id: OURA_CLIENT_ID,
              client_secret: OURA_CLIENT_SECRET,
              grant_type: 'refresh_token',
              refresh_token: ouraData.refresh_token,
          });

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

  let ouraData: OuraCookieData | null = cookies.ouraData ? JSON.parse(cookies.ouraData) : null;

  // Check if the Oura token is expired and attempt to refresh it
  if (ouraData && isOuraExpired(ouraData)) {
      const refreshedData = await refreshOuraToken(ouraData);
      if (refreshedData) {
          ouraData = refreshedData; // Update ouraData with the refreshed token data
          res.setHeader('Set-Cookie', `ouraData=${JSON.stringify(refreshedData)}; HttpOnly; Secure`);
      } else {
          console.log('Failed to refresh Oura token.');
      }
  }

  // Determine the authentication status after any refresh attempt
  const isOuraAuthed = ouraData && !isOuraExpired(ouraData);

  // Respond with the authentication status
  res.status(200).json({ isOuraAuthed });
}
