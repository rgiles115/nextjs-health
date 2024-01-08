// pages/api/authStatus.js

import cookie from 'cookie';

export default function handler(req, res) {
  // Parse the cookies from the request
  const cookies = cookie.parse(req.headers.cookie || '');

  // Check if Strava and Oura cookies are present
  const isStravaAuthed = Boolean(cookies.stravaData);
  const isOuraAuthed = Boolean(cookies.ouraData);

  // Respond with the authentication status
  res.status(200).json({ isStravaAuthed, isOuraAuthed });
}
