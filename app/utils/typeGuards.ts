// utils/typeGuards.ts
import { StravaActivity, AthleteProfile, YtdRideTotals } from '../types/StravaInterface';

export function hasRequiredStravaData(
  isStravaAuthed: boolean | undefined,
  isStravaLoading: boolean,
  stravaActivities: StravaActivity[] | null,
  athleteProfile: AthleteProfile | null,
  ytdRideTotals: YtdRideTotals | null
): stravaActivities is StravaActivity[] {
  return (
    isStravaAuthed === true &&
    !isStravaLoading &&
    Array.isArray(stravaActivities) &&
    stravaActivities.length > 0 &&
    athleteProfile !== null &&
    ytdRideTotals !== null
  );
}
