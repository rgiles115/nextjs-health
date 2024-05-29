import axios from 'axios';

// Assuming you have a type definition for StravaActivity
export interface StravaActivity {
    // ... define the structure of a Strava activity
}

export interface StravaData {
    access_token: string;
    expires_at: number;
    refresh_token: string;
    // ... other fields as per your Strava data structure
}

// Function to check if Strava token is expired
const isStravaExpired = (stravaData: StravaData): boolean => {
    return Date.now() >= stravaData.expires_at * 1000;
};

// Function to refresh Strava token
const refreshStravaToken = async (stravaData: StravaData): Promise<StravaData> => {
    // console.log("Refreshing Strava token...");

    const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
    const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

    const response = await axios.post('https://www.strava.com/api/v3/oauth/token', {
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: stravaData.refresh_token,
    });

    // console.log("Strava token refreshed.");

    return {
        ...stravaData,
        access_token: response.data.access_token,
        expires_at: Math.floor(Date.now() / 1000) + response.data.expires_in,
        refresh_token: response.data.refresh_token,
    };
};

// Function to fetch Strava activities
export const fetchStravaActivities = async (
    accessToken: string, // Accept the token directly as an argument
    startDate: string,
    endDate: string
): Promise<StravaActivity[]> => {
    // console.log(`Fetching Strava activities from ${startDate} to ${endDate}...`);

    let page = 1;
    const perPage = 30;
    const allActivities: StravaActivity[] = [];

    while (true) {
        // console.log(`Fetching page ${page}...`);
        const stravaApiUrl = `https://www.strava.com/api/v3/athlete/activities?before=${endDate}&after=${startDate}&per_page=${perPage}&page=${page}`;
        const response = await axios.get(stravaApiUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.status !== 200) {
            console.error("Error response from Strava API:", response.statusText);
            throw new Error(`Error from Strava API: ${response.statusText}`);
        }

        const activities: StravaActivity[] = response.data;
        if (activities.length === 0) {
            // console.log("No more activities to fetch.");
            break; // No more activities to fetch
        }

        // console.log(`Fetched ${activities.length} activities on page ${page}.`);
        allActivities.push(...activities);
        page++;
    }

    // console.log(`Fetched a total of ${allActivities.length} activities.`);
    return allActivities;
};
