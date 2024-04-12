import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { code } = req.query;

    if (!code) {
      res.status(400).send('Code is required');
      return;
    }

    try {
      // console.log('Adding Oura cookie.');

      // Prepare the request body for application/x-www-form-urlencoded
      const params = new URLSearchParams();
      params.append('client_id', process.env.OURA_CLIENT_ID!);
      params.append('client_secret', process.env.OURA_CLIENT_SECRET!);
      params.append('code', code as string);
      params.append('grant_type', 'authorization_code');
      params.append('redirect_uri', process.env.OURA_REDIRECT_URI!); // Add your redirect URI here

      // Exchange the code for an access token
      const response = await fetch('https://api.ouraring.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      const data = await response.json();

      // Calculate the expires_at timestamp (Unix time in seconds)
      // Assuming data.expires_in is for the access token and data.refresh_expires_in is for the refresh token
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const accessExpiresAt = currentTimestamp + data.expires_in; // Access token expiration
  
      // Set a long arbitrary expiration time for the refresh token (e.g., 1 year)
      const refreshExpiresAt = currentTimestamp + 31536000; // 1 year = 31,536,000 seconds
  
      const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          path: '/',
          expires: new Date(refreshExpiresAt * 1000)
      };
  
      const cookie = serialize('ouraData', JSON.stringify(data), cookieOptions);
  
      res.setHeader('Set-Cookie', cookie);

      res.writeHead(302, { Location: '/' }); // Redirect to the success page
      res.end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}