import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { start_date, end_date } = req.query;

    // Validate required parameters.
    if (!start_date || !end_date) {
        return res.status(400).json({ error: 'Start and end dates are required' });
    }

    // Attempt to retrieve the Strava token from cookies.
    const cookies = new Cookies(req, res);
    const encodedStravaCookie = cookies.get('stravaData');
    if (!encodedStravaCookie) {
        return res.status(400).json({ error: 'Strava cookie not found' });
    }

    const stravaData = JSON.parse(decodeURIComponent(encodedStravaCookie));
    const accessToken = stravaData.access_token;

    // Function to get stream data for an activity
    const getActivityStream = async (activityId: number) => {
        const url = `https://www.strava.com/api/v3/activities/${activityId}/streams?keys=watts,heartrate&key_by_type=true`;
        try {
            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching stream for activity ID ${activityId}:`, error);
            return null;
        }
    };

    // Function to condense stream data
    const condenseStreamData = (streamData: any) => {
        const condensedData: any = {};

        if (streamData.watts) {
            const wattsData = streamData.watts.data;
            const totalWatts = wattsData.reduce((acc: number, val: number) => acc + val, 0);
            condensedData.averageWatts = totalWatts / wattsData.length;
            condensedData.maxWatts = Math.max(...wattsData);
            condensedData.minWatts = Math.min(...wattsData);
        }

        if (streamData.heartrate) {
            const heartrateData = streamData.heartrate.data;
            const totalHeartrate = heartrateData.reduce((acc: number, val: number) => acc + val, 0);
            condensedData.averageHeartrate = totalHeartrate / heartrateData.length;
            condensedData.maxHeartrate = Math.max(...heartrateData);
            condensedData.minHeartrate = Math.min(...heartrateData);
        }

        return condensedData;
    };

    // Function to format activity data
    const formatActivityData = (activity: any, condensedStream: any) => {
        return {
            name: activity.name,
            distance_km: activity.distance / 1000,
            moving_time_sec: activity.moving_time,
            total_elevation_gain_m: activity.total_elevation_gain,
            average_speed_kmh: activity.average_speed * 3.6,
            max_speed_kmh: activity.max_speed * 3.6,
            average_cadence_rpm: activity.average_cadence,
            average_watts: activity.average_watts,
            max_watts: activity.max_watts,
            weighted_average_watts: activity.weighted_average_watts,
            kilojoules: activity.kilojoules,
            average_heart_rate_bpm: activity.average_heartrate,
            max_heart_rate_bpm: activity.max_heartrate,
            suffer_score: activity.suffer_score,
            stream_summary: condensedStream,
        };
    };

    // Proceed with fetching activities using the access token.
    try {
        const allActivities = [];
        let page = 1;
        const perPage = 200;

        while (true) {
            const response = await axios.get(`https://www.strava.com/api/v3/athlete/activities?before=${end_date}&after=${start_date}&per_page=${perPage}&page=${page}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (response.status !== 200 || response.data.length === 0) {
                break; // Exit if response is not OK or no more activities.
            }

            allActivities.push(...response.data);
            page++;
        }

        // Fetch and condense stream data for each activity
        const activitiesWithStreams = [];
        const formattedActivities = [];
        for (const activity of allActivities) {
            const stream = await getActivityStream(activity.id);
            if (stream) {
                const condensedStream = condenseStreamData(stream);
                const formattedActivity = formatActivityData(activity, condensedStream);
                activitiesWithStreams.push({
                    ...activity,
                    stream, // Include the full stream data for graphing
                });
                formattedActivities.push(formattedActivity);
            }
        }

        // Optionally fetch YTD ride totals if needed.
        const statsResponse = await axios.get(`https://www.strava.com/api/v3/athletes/${stravaData.athlete.id}/stats`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        res.status(200).json({
            activities: activitiesWithStreams,
            ytdRideTotals: statsResponse.data.ytd_ride_totals,
            formattedActivities, // Add the formatted activities for analysis
        });
        // console.log('Activities with condensed streams:', JSON.stringify(formattedActivities, null, 2));
    } catch (error) {
        console.error('Error fetching Strava activity data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
