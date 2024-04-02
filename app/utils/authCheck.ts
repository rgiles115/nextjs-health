// utils/authCheck.ts

// Imports the AthleteProfile type from the StravaInterface file for type checking.
import { AthleteProfile } from '../types/StravaInterface';

// Defines an interface for the parameters accepted by the checkAuthStatuses function. 
// This helps in type checking and ensuring the correct format of the passed arguments.
interface CheckAuthStatusesParams {
  // Function to set the authentication status of Strava.
  setIsStravaAuthed: (value: boolean | undefined) => void;
  // Function to set the authentication status of Oura.
  setIsOuraAuthed: (value: boolean | undefined) => void;
  // Function to control the loading state during the authentication status check.
  setIsAuthCheckLoading: (value: boolean) => void;
  // Function to set the athlete's profile data retrieved from Strava.
  setAthleteProfile: (value: AthleteProfile | null) => void;
}

// Asynchronously checks the authentication statuses for Strava and Oura.
export const checkAuthStatuses = async ({
  setIsStravaAuthed,
  setIsOuraAuthed,
  setIsAuthCheckLoading,
  setAthleteProfile,
}: CheckAuthStatusesParams) => {
  // Initially sets the loading state to true to indicate that the auth check is in progress.
  setIsAuthCheckLoading(true);

  try {
    // Fetches the Strava authentication status from the server-side API endpoint.
    const stravaResponse = await fetch('/api/stravaAuthStatus');
    // Throws an error if the fetch request was unsuccessful.
    if (!stravaResponse.ok) throw new Error('Failed to fetch Strava auth status');
    // Parses the JSON response to retrieve the authentication status and athlete data.
    const stravaData = await stravaResponse.json();
    // Sets the Strava authentication status.
    setIsStravaAuthed(stravaData.isStravaAuthed);
    // If the user is authenticated and athlete data is present, set the athlete profile.
    if (stravaData.isStravaAuthed && stravaData.athlete) {
      setAthleteProfile(stravaData.athlete);
    }
  } catch (error) {
    // Logs any error encountered during the fetch operation and sets Strava auth status to false.
    console.error('Error fetching Strava authentication status:', error);
    setIsStravaAuthed(false);
  }

  try {
    // Similar process for fetching Oura authentication status.
    const ouraResponse = await fetch('/api/ouraAuthStatus');
    if (!ouraResponse.ok) throw new Error('Failed to fetch Oura auth status');
    const ouraData = await ouraResponse.json();
    setIsOuraAuthed(ouraData.isOuraAuthed);
  } catch (error) {
    // Logs any error encountered and sets Oura auth status to false.
    console.error('Error fetching Oura authentication status:', error);
    setIsOuraAuthed(false);
  }

  // Once both checks are complete, sets the loading state to false.
  setIsAuthCheckLoading(false);
};
