export interface OuraData {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    expires_at: number;
}
  


  export interface ReadinessData {
    dates: string[];
    restingHeartRate: number[];
    hrvBalance: number[];
    bodyTemperature: number[];
}

export interface ReadinessEntry {
    day: string;
    contributors: {
        resting_heart_rate: number;
        hrv_balance: number;
        body_temperature: number; 
    };
}

export interface OuraReadinessData {
    data: OuraReadinessEntry[];
    next_token?: string;
}

// Interface for individual readiness entries in the summary data
export interface OuraReadinessEntry {
    id: string;
    contributors: ReadinessContributors;
    day: string;
    score: number;
    temperature_deviation: number;
    temperature_trend_deviation: number;
    timestamp: string;
    detailedData?: DetailedReadinessData; // Optional field to store detailed data
}

// Interface for the contributors in a readiness entry
export interface ReadinessContributors {
    activity_balance: number;
    body_temperature: number;
    hrv_balance: number;
    previous_day_activity: number;
    previous_night: number;
    recovery_index: number;
    resting_heart_rate: number;
    sleep_balance: number;
}

// Interface for detailed readiness data fetched using a document ID
export interface DetailedReadinessData {
    id: string;
    contributors: ReadinessContributors;
    day: string;
    score: number;
    temperature_deviation: number;
    temperature_trend_deviation: number;
    timestamp: string;
}

export interface SleepData {
    data: SleepEntry[];
    next_token: string | null;
}

export interface ActivityData {
    data: ActivityEntry[];
    next_token: string | null;
}

export interface ActivityEntry {
    id: string;
    class_5_min: string;
    score: number;
    active_calories: number;
    average_met_minutes: number;
    contributors: ActivityContributors;
    equivalent_walking_distance: number;
    high_activity_met_minutes: number;
    high_activity_time: number;
    inactivity_alerts: number;
    low_activity_met_minutes: number;
    low_activity_time: number;
    medium_activity_met_minutes: number;
    medium_activity_time: number;
    met: MetData;
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

export interface ActivityContributors {
    meet_daily_targets: number;
    move_every_hour: number;
    recovery_time: number;
    stay_active: number;
    training_frequency: number;
    training_volume: number;
}

export interface MetData {
    interval: number;
    items: number[];
    timestamp: string;
}

export interface ActivityChartProps {
    activityData: ActivityData | null;
  }

export interface DailySleepData {
    data: DailySleepEntry[];
    next_token: string | null;
}

export interface DailySleepEntry {
    id: string;
    contributors: DailySleepContributors;
    day: string;
    score: number;
    timestamp: string;
    detailedSleepData?: any;
}

export interface DailySleepContributors {
    deep_sleep: number;
    efficiency: number;
    latency: number;
    rem_sleep: number;
    restfulness: number;
    timing: number;
    total_sleep: number;
}

export interface Contributors {
    deep_sleep: number;
    efficiency: number;
    latency: number;
    rem_sleep: number;
    restfulness: number;
    timing: number;
    total_sleep: number;
}

export interface SleepEntry {
    id: string;
    average_breath: number;
    average_heart_rate: number;
    average_hrv: number | null;
    awake_time: number;
    bedtime_end: string;
    bedtime_start: string;
    day: string;
    deep_sleep_duration: number;
    efficiency: number;
    heart_rate: HeartRateData;
    hrv: HRVData;
    latency: number;
    light_sleep_duration: number;
    low_battery_alert: boolean;
    lowest_heart_rate: number;
    movement_30_sec: string;
    period: number;
    readiness: ReadinessData;
    readiness_score_delta: number | null;
    rem_sleep_duration: number;
    restless_periods: number;
    sleep_phase_5_min: string;
    sleep_score_delta: number | null;
    sleep_algorithm_version: string;
    time_in_bed: number;
    total_sleep_duration: number;
    type: string;
    detailedSleepData: DetailedSleepData;
    hrv_values?: number[]; 
}

export interface HeartRateData {
    interval: number;
    items: (number | null)[];
    timestamp: string;
}

export interface HRVData {
    interval: number;
    items: (number | null)[];
    timestamp: string;
}

type DetailedSleepData = SleepEntry;


export interface transformedHrvData {
    date: string;
    averageSleepHRV: number | null;
}

export interface EnhancedTagData {
    id: string;
    tag_type_code: string;
    start_time: string; // Assuming all dates are strings, could also be Date depending on usage
    end_time: string | null; // Could be null based on your example
    start_day: string;
    end_day: string | null; // Could be null based on your example
    comment: string;
  }
  
  export interface DailyReadinessData {
    data: DailyReadinessEntry[];
    next_token: string | null;
}

export interface DailyReadinessEntry {
    id: string;
    contributors: DailyContributors;
    day: string;
    score: number;
    temperature_deviation: number;
    temperature_trend_deviation: number | null;
    timestamp: string;
    sleepData?: any;
}

export interface DailyContributors {
    activity_balance: number | null;
    body_temperature: number;
    hrv_balance: number;
    previous_day_activity: number | null;
    previous_night: number;
    recovery_index: number;
    resting_heart_rate: number;
    sleep_balance: number;
}