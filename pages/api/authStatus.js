// pages/api/authStatus.js

import cookie from 'cookie';

export default function handler(req, res) {
  // Parse the cookies from the request
  const cookies = cookie.parse(req.headers.cookie || '');

  // Function to check if the Strava cookie is expired
  const isStravaExpired = (stravaCookie) => {
    try {
      const stravaData = JSON.parse(stravaCookie);
      return Date.now() >= (stravaData.expires_at * 1000); // Convert to milliseconds
    } catch (e) {
      return true; // If there's an error parsing, assume expired
    }
  };

  // Function to check if the Oura cookie is expired
  const isOuraExpired = (ouraCookie) => {
    try {
      const ouraData = JSON.parse(ouraCookie);
      // Assuming the time of cookie creation is not stored, we cannot accurately determine the expiration
      // This is a limitation without additional data
      return false; // Unable to determine, returning false for now
    } catch (e) {
      return true; // If there's an error parsing, assume expired
    }
  };

  // Check if Strava and Oura cookies are present and not expired
  const isStravaAuthed = Boolean(cookies.stravaData) && !isStravaExpired(cookies.stravaData);
  const isOuraAuthed = Boolean(cookies.ouraData) && !isOuraExpired(cookies.ouraData);

  // Respond with the authentication status
  res.status(200).json({ isStravaAuthed, isOuraAuthed });
}
