// pages/api/getActivityData.ts

import Cookies from 'cookies';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { start_date, end_date } = req.query;

    // Check if start and end dates are provided
    if (!start_date || !end_date) {
        res.status(400).json({ error: 'Start and end dates are required' });
        return;
    }

    console.log("Start Date:", start_date);
    console.log("End Date:", end_date);


    // Retrieve the access token from the cookie
    const cookies = new Cookies(req, res);
    const encodedOuraCookie = cookies.get('ouraData'); // Replace with your actual cookie name

    if (!encodedOuraCookie) {
        res.status(400).json({ error: 'Oura cookie not found' });
        return;
    }

    const decodedOuraCookie = decodeURIComponent(encodedOuraCookie);
    const ouraData: OuraData = JSON.parse(decodedOuraCookie); // Assuming OuraData is an appropriate type
    const token = ouraData.access_token;
    const ouraApiUrl = `https://api.ouraring.com/v2/usercollection/daily_activity?start_date=${start_date}&end_date=${end_date}`;

    try {
        const response = await fetch(ouraApiUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            // Send a response if the API call was not successful
            res.status(response.status).json({ error: `Error from Oura API: ${response.statusText}` });
            return;
        }

        const data = await response.json();
        // console.log("Activity Data", JSON.stringify(data));
        // Process and return the data
        res.status(200).json(processActivityData(data));

    } catch (error) {
        console.error('Error fetching activity data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }
}

function processActivityData(data: ActivityData): ActivityData {
    data.data.forEach(entry => {
        // Convert the main timestamp to UTC
        entry.timestamp = convertToUTC(entry.timestamp);

        // Check if MetData exists and convert its timestamp to UTC
        if (entry.met && entry.met.timestamp) {
            entry.met.timestamp = convertToUTC(entry.met.timestamp);
        }

        // Perform any other processing on the entry as needed
    });

    // console.log("Activity Data:", JSON.stringify(data));
    return data;
}

function convertToUTC(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString(); // Converts to UTC and formats as an ISO string
}


// Define types if necessary
interface OuraData {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
}

interface ActivityData {
    data: ActivityEntry[];
    next_token: string | null;
}

interface ActivityEntry {
    id: string;
    class_5_min: string;
    score: number;
    active_calories: number;
    average_met_minutes: number;
    contributors: Contributors;
    equivalent_walking_distance: number;
    high_activity_met_minutes: number;
    high_activity_time: number;
    inactivity_alerts: number;
    low_activity_met_minutes: number;
    low_activity_time: number;
    medium_activity_met_minutes: number;
    medium_activity_time: number;
    met: Met;
    meters_to_target: number;
    non_wear_time: number;
    resting_time: number;
    sedentary_met_minutes: number;
    sedentary_time: number;
    steps: number;
    target_calories: number;
    target_meters: number;
    total_calories: number;
    day: string;
    timestamp: string;
}

interface Contributors {
    meet_daily_targets: number;
    move_every_hour: number;
    recovery_time: number;
    stay_active: number;
    training_frequency: number;
    training_volume: number;
}

interface Met {
    interval: number;
    items: number[];
    timestamp: string;
}
