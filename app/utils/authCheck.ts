import { AthleteProfile } from '../types/StravaInterface';

interface CheckAuthStatusesParams {
  setIsStravaAuthed: (value: boolean) => void;
  setIsOuraAuthed: (value: boolean) => void;
  setIsAuthCheckLoading: (value: boolean) => void;
  setAthleteProfile: (value: AthleteProfile | null) => void;
}

export const checkAuthStatuses = async ({
  setIsStravaAuthed,
  setIsOuraAuthed,
  setIsAuthCheckLoading,
  setAthleteProfile,
}: CheckAuthStatusesParams) => {
  setIsAuthCheckLoading(true);

  try {
    const stravaResponse = await fetch('/api/stravaAuthStatus');
    if (!stravaResponse.ok) throw new Error('Failed to fetch Strava auth status');
    const stravaData = await stravaResponse.json();
    console.log('Strava auth status response:', stravaData);

    const isStravaAuthed = !!stravaData.isStravaAuthed;
    setIsStravaAuthed(isStravaAuthed);

    if (isStravaAuthed && stravaData.athlete) {
      setAthleteProfile(stravaData.athlete);
    } else {
      setAthleteProfile(null);
    }
  } catch (error) {
    console.error('Error fetching Strava authentication status:', error);
    setIsStravaAuthed(false);
    setAthleteProfile(null);
  }

  try {
    const ouraResponse = await fetch('/api/ouraAuthStatus');
    if (!ouraResponse.ok) throw new Error('Failed to fetch Oura auth status');
    const ouraData = await ouraResponse.json();
    console.log('Oura auth status response:', ouraData);

    const isOuraAuthed = !!ouraData.isOuraAuthed;
    setIsOuraAuthed(isOuraAuthed);
  } catch (error) {
    console.error('Error fetching Oura authentication status:', error);
    setIsOuraAuthed(false);
  }

  setIsAuthCheckLoading(false);
};
''