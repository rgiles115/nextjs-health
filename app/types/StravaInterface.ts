export interface AthleteProfile {
  badge_type_id: number;
  bio: string;
  city: string;
  country: string;
  created_at: string; // ISO 8601 date string
  firstname: string;
  follower: number | null; // Assuming this could be a specific type when not null
  friend: number | null; // Assuming this could be a specific type when not null
  id: number;
  lastname: string;
  premium: boolean;
  profile: string; // URL string
  profile_medium: string; // URL string
  resource_state: number;
  sex: "M" | "F"; // Assuming 'M' for male, 'F' for female. Adjust if there are more options
  state: string;
  summit: boolean;
  updated_at: string; // ISO 8601 date string
  username: string;
  weight: number;
}

export interface StravaData {
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
      friend: null;
      follower: null;
    };
  }
  

// Replace 'any' with a more detailed structure of Strava activities if known
export interface StravaActivity {
    resource_state: number;
    athlete: {
        id: number;
        resource_state: number;
    };
    name: string;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    total_elevation_gain: number;
    type: string;
    sport_type: string;
    id: number;
    start_date: string;
    start_date_local: string;
    timezone: string;
    utc_offset: number;
    location_city: string | null;
    location_state: string | null;
    location_country: string;
    achievement_count: number;
    kudos_count: number;
    comment_count: number;
    athlete_count: number;
    photo_count: number;
    map: {
        id: string;
        summary_polyline: string;
        resource_state: number;
    };
    trainer: boolean;
    commute: boolean;
    manual: boolean;
    private: boolean;
    visibility: string;
    flagged: boolean;
    gear_id: string;
    start_latlng: number[];
    end_latlng: number[];
    average_speed: number;
    max_speed: number;
    average_cadence: number;
    average_watts: number;
    max_watts: number;
    weighted_average_watts: number;
    kilojoules: number;
    device_watts: boolean;
    has_heartrate: boolean;
    average_heartrate: number;
    max_heartrate: number;
    heartrate_opt_out: boolean;
    display_hide_heartrate_option: boolean;
    elev_high: number;
    elev_low: number;
    upload_id: number;
    upload_id_str: string;
    external_id: string;
    from_accepted_tag: boolean;
    pr_count: number;
    total_photo_count: number;
    has_kudoed: boolean;
    suffer_score: number;
}

export interface YtdRideTotals {
    distance: number; // in meters
    moving_time: number; // in seconds
    elevation_gain: number; // in meters
    // Add any other relevant fields
  }
  