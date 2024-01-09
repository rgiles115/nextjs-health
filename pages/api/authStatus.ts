// pages/api/authStatus.ts

import { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';

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
    friend: null; // Adjust if there's a specific type
    follower: null; // Adjust if there's a specific type
  };
}


interface OuraCookieData {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}


export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Parse the cookies from the request
  const cookies = cookie.parse(req.headers.cookie || '');

  // Function to check if the Strava cookie is expired
  const isStravaExpired = (stravaCookie: string): boolean => {
    try {
      const stravaData: StravaCookieData = JSON.parse(stravaCookie);
      return Date.now() >= (stravaData.expires_at * 1000); // Convert to milliseconds
    } catch (e) {
      return true; // If there's an error parsing, assume expired
    }
  };

  // Function to check if the Oura cookie is expired
  const isOuraExpired = (ouraCookie: string): boolean => {
    try {
      const ouraData: OuraCookieData = JSON.parse(ouraCookie);
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
