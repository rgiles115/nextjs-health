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
      const currentTimestamp = Math.floor(Date.now() / 1000); // current time in seconds
      const expiresAt = currentTimestamp + data.expires_in; // calculate when the token will expire
      data.expires_at = expiresAt; // Add expires_at to the data object

      // Serialize the data and set it as a cookie with the calculated expiry date
      const cookie = serialize('ouraData', JSON.stringify(data), {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        expires: new Date(expiresAt * 1000), // Convert back to milliseconds for the cookie expiry
        path: '/',
      });

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
