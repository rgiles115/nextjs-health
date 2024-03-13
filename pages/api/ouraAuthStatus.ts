import { NextApiRequest, NextApiResponse } from 'next';
import cookie, { serialize } from 'cookie';
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
  console.log('Parsed cookies:', cookies);

  // Function to check if the Oura token has expired
  const isOuraExpired = (ouraData: OuraCookieData): boolean => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expired = currentTimestamp >= ouraData.expires_at;
    console.log('Checking if Oura token has expired:', expired);
    return expired;
  };

  // Function to refresh the Oura token
  const refreshOuraToken = async (ouraData: OuraCookieData): Promise<OuraCookieData | null> => {
    console.log("Attempting to refresh token for Oura");

    const params = new URLSearchParams();
    params.append('client_id', OURA_CLIENT_ID!);
    params.append('client_secret', OURA_CLIENT_SECRET!);
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', ouraData.refresh_token);

    try {
      const response = await axios.post('https://api.ouraring.com/oauth/token', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const data = response.data;
      console.log('Refresh token response:', data);

      const currentTimestamp = Math.floor(Date.now() / 1000);
      const expiresAt = currentTimestamp + data.expires_in;

      const refreshedData = {
        ...ouraData,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        expires_at: expiresAt,
      };

      console.log('Refreshed data:', refreshedData);

      const cookieString = serialize('ouraData', JSON.stringify(refreshedData), {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        expires: new Date(expiresAt * 1000),
        path: '/',
      });

      res.setHeader('Set-Cookie', cookieString);

      return refreshedData;
    } catch (error) {
      console.error('Error refreshing Oura token:', error);
      if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
        return null;
      }
      return null;
    }
  };

  let ouraData: OuraCookieData | null = cookies.ouraData ? JSON.parse(cookies.ouraData) : null;
  console.log('Initial ouraData:', ouraData);

  // Check if the Oura token is expired and attempt to refresh it
  if (ouraData && isOuraExpired(ouraData)) {
    console.log('Oura token has expired. Attempting to refresh.');
    const refreshedData = await refreshOuraToken(ouraData);
    if (refreshedData) {
        ouraData = refreshedData; // Successfully refreshed token
        console.log('Token successfully refreshed');
    } else {
        // Refresh failed, potentially requires re-authentication
        console.log('Token refresh failed. May require re-authentication.');
        return res.status(401).json({ error: 'reauthentication_required', message: 'Please re-authenticate.' });
    }
  }

  const isOuraAuthed = ouraData && !isOuraExpired(ouraData);
  console.log('Final isOuraAuthed status:', isOuraAuthed);
  res.status(200).json({ isOuraAuthed });
}
