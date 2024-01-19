// In ActivityInterfaces.ts
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
    startDate: Date;
    endDate: Date;
}
