export interface Address {
  display_name: string;
  lat: number;
  lon: number;
}

export interface TripRequest {
  current_address: string;
  pickup_address: string;
  dropoff_address: string;
  cycle_used_hours: number;
}

export interface FuelStop {
  id: string;
  lat: number;
  lon: number;
  distance_from_start: number;
  address: string;
}

export interface DailyLog {
  day: number;
  date: string;
  drive_hours: number;
  on_duty_hours: number;
  off_duty_hours: number;
  miles: number;
  notes: string[];
  is_rest_day: boolean;
}

export interface TripResponse {
  id: string;
  route_geometry: number[][];
  total_miles: number;
  total_hours: number;
  total_days: number;
  cycle_hours_remaining: number;
  fuel_stops: FuelStop[];
  daily_logs: DailyLog[];
  current_location: Address;
  pickup_location: Address;
  dropoff_location: Address;
}

export interface ValidationErrors {
  current_address?: string;
  pickup_address?: string;
  dropoff_address?: string;
  cycle_used_hours?: string;
}