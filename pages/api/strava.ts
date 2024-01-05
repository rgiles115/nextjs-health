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
      // Exchange the code for an access token
      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.STRAVA_CLIENT_ID,
          client_secret: process.env.STRAVA_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
        }),
      });

      const data = await response.json();

      // Serialize the data and set it as a cookie
      const cookie = serialize('stravaData', JSON.stringify(data), {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 60 * 60 * 24, // Example: 1 day expiration
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
