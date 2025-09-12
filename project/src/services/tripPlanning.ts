import { TripRequest, TripResponse, Address, FuelStop, DailyLog } from '../types';
import { addDays, format } from 'date-fns';

const API_KEY = (import.meta as any).env?.VITE_GRAPHHOPPER_API_KEY || '7cf5c887-fcb5-475c-8eca-470c44303042';
const GH_ROUTE_URL = 'https://graphhopper.com/api/1/route';

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3958.8; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Decode polyline to array of [lat, lon]. GraphHopper uses 1e5 precision by default.
// Minimal decoder to avoid extra deps
const decodePolyline = (str: string, precision = 1e5): number[][] => {
  let index = 0;
  const len = str.length;
  let lat = 0;
  let lng = 0;
  const coordinates: number[][] = [];

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;

    coordinates.push([lat / precision, lng / precision]);
  }

  return coordinates;
};

const routeWithGraphHopper = async (points: [number, number][]): Promise<{ coords: number[][]; distanceMiles: number; timeHours: number; }> => {
  const url = new URL(GH_ROUTE_URL);
  url.searchParams.set('key', API_KEY);
  url.searchParams.set('profile', 'car');
  url.searchParams.set('points_encoded', 'true');
  // Add points as query params: point=lat,lon
  points.forEach(([lat, lon]) => url.searchParams.append('point', `${lat},${lon}`));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Routing failed: ${res.status}`);
  const data = await res.json();
  const path = data.paths?.[0];
  if (!path) throw new Error('No route path');

  const distanceMeters: number = path.distance;
  const timeMs: number = path.time;
  const encoded: string = path.points;
  const coords = decodePolyline(encoded, 1e5);

  const distanceMiles = distanceMeters / 1609.34;
  const timeHours = timeMs / (1000 * 60 * 60);
  return { coords, distanceMiles, timeHours };
};

// Generate fuel stops roughly every ~250 miles (synthetic placement along route)
const generateFuelStops = (routeGeometry: number[][], totalMiles: number): FuelStop[] => {
  const fuelStops: FuelStop[] = [];
  const intervalMiles = 250;
  const numStops = Math.floor(totalMiles / intervalMiles);
  
  for (let i = 1; i <= numStops; i++) {
    const stopIndex = Math.floor((routeGeometry.length / (numStops + 1)) * i);
    const coord = routeGeometry[stopIndex];
    
    fuelStops.push({
      id: `fuel-${i}`,
      lat: coord[0],
      lon: coord[1],
      distance_from_start: i * intervalMiles,
      address: `Fuel Stop ${i} - Mile ${i * intervalMiles}`
    });
  }
  
  return fuelStops;
};

// Generate daily ELD logs with basic HOS rules: 11h driving, 14h shift, 30-min break per 8h driving, 70h/8-day cycle
const generateDailyLogs = (
  totalMiles: number,
  totalDrivingHours: number,
  cycleUsedHours: number
): DailyLog[] => {
  const logs: DailyLog[] = [];
  const MAX_DAILY_DRIVING = 11;
  const MAX_SHIFT_HOURS = 14;
  const MAX_CYCLE_HOURS = 70;
  const BREAK_THRESHOLD_DRIVING = 8; // 30-min break every 8 driving hours
  const PRE_POST_TRIP_HOURS = 1; // combined

  let remainingMiles = totalMiles;
  let remainingDrivingHours = totalDrivingHours;
  let cycleHoursRemaining = Math.max(0, MAX_CYCLE_HOURS - cycleUsedHours);
  let currentDate = new Date();
  let day = 1;

  while ((remainingMiles > 0 || remainingDrivingHours > 0) && day <= 30) {
    // If not enough cycle hours to run even minimal shift, insert 34-hour restart
    const minNeededForADay = Math.min(MAX_DAILY_DRIVING, remainingDrivingHours) + PRE_POST_TRIP_HOURS;
    if (cycleHoursRemaining < Math.min(minNeededForADay, MAX_SHIFT_HOURS)) {
      logs.push({
        day,
        date: format(currentDate, 'MMM dd, yyyy'),
        drive_hours: 0,
        on_duty_hours: 0,
        off_duty_hours: 24,
        miles: 0,
        notes: ['34-hour restart'],
        is_rest_day: true,
      });
      // After 34-hour restart, reset cycle
      cycleHoursRemaining = MAX_CYCLE_HOURS;
      day++;
      currentDate = addDays(currentDate, 1);
      continue;
    }

    // Driving hours we can do today
    const drivingToday = Math.min(MAX_DAILY_DRIVING, remainingDrivingHours);

    // Breaks required: for each full 8h driving span in the day, add 0.5h break
    const breaks = drivingToday >= BREAK_THRESHOLD_DRIVING ? 0.5 : 0;

    // On-duty total cannot exceed 14h
    let onDutyToday = PRE_POST_TRIP_HOURS + drivingToday + breaks;
    if (onDutyToday > MAX_SHIFT_HOURS) {
      // Reduce driving to respect 14h shift
      const reducible = onDutyToday - MAX_SHIFT_HOURS;
      const adjustedDriving = Math.max(0, drivingToday - reducible);
      onDutyToday = PRE_POST_TRIP_HOURS + adjustedDriving + (adjustedDriving >= BREAK_THRESHOLD_DRIVING ? 0.5 : 0);
    }

    // Respect cycle hours remaining
    if (onDutyToday > cycleHoursRemaining) {
      const delta = onDutyToday - cycleHoursRemaining;
      const adjustedDriving = Math.max(0, drivingToday - delta);
      onDutyToday = PRE_POST_TRIP_HOURS + adjustedDriving + (adjustedDriving >= BREAK_THRESHOLD_DRIVING ? 0.5 : 0);
    }

    // Final driving hours for the day
    const finalDriving = Math.min(drivingToday, Math.max(0, onDutyToday - PRE_POST_TRIP_HOURS - breaks));

    const dayMiles = Math.round((remainingMiles / Math.max(remainingDrivingHours, 1)) * finalDriving);

    const notes: string[] = [];
    if (day === 1 && remainingDrivingHours === totalDrivingHours) notes.push('Pickup');
    if (remainingMiles - dayMiles <= 0) notes.push('Delivery');
    if (breaks > 0) notes.push('30-min break');

    const offDuty = Math.max(0, 24 - onDutyToday);

    logs.push({
      day,
      date: format(currentDate, 'MMM dd, yyyy'),
      drive_hours: Math.round(finalDriving * 10) / 10,
      on_duty_hours: Math.round(onDutyToday * 10) / 10,
      off_duty_hours: Math.round(offDuty * 10) / 10,
      miles: Math.max(0, dayMiles),
      notes,
      is_rest_day: false,
    });

    remainingMiles = Math.max(0, remainingMiles - dayMiles);
    remainingDrivingHours = Math.max(0, remainingDrivingHours - finalDriving);
    cycleHoursRemaining = Math.max(0, cycleHoursRemaining - onDutyToday);

    day++;
    currentDate = addDays(currentDate, 1);
  }

  return logs;
};

export const computeTrip = async (request: TripRequest): Promise<TripResponse> => {
  // Prefer backend if configured
  const backendUrl = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:8000';
  try {
    const res = await fetch(`${backendUrl}/api/trips/compute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (res.ok) {
      const data = await res.json();
      return data as TripResponse;
    }
  } catch (e) {
    console.warn('Backend compute failed, using client fallback:', e);
  }

  // Fallback to client-side compute via GraphHopper
  const [currentLocation] = await import('./geocoding').then(m => m.geocodeAddress(request.current_address));
  const [pickupLocation] = await import('./geocoding').then(m => m.geocodeAddress(request.pickup_address));
  const [dropoffLocation] = await import('./geocoding').then(m => m.geocodeAddress(request.dropoff_address));

  let routeGeometry: number[][] = [];
  let totalMiles = 0;
  let drivingHours = 0;

  try {
    const leg1 = await routeWithGraphHopper([[currentLocation.lat, currentLocation.lon],[pickupLocation.lat, pickupLocation.lon],]);
    const leg2 = await routeWithGraphHopper([[pickupLocation.lat, pickupLocation.lon],[dropoffLocation.lat, dropoffLocation.lon],]);
    routeGeometry = [...leg1.coords, ...leg2.coords];
    totalMiles = Math.round(leg1.distanceMiles + leg2.distanceMiles);
    drivingHours = leg1.timeHours + leg2.timeHours;
  } catch (err) {
    const currentToPickup = calculateDistance(currentLocation.lat, currentLocation.lon, pickupLocation.lat, pickupLocation.lon);
    const pickupToDropoff = calculateDistance(pickupLocation.lat, pickupLocation.lon, dropoffLocation.lat, dropoffLocation.lon);
    totalMiles = Math.round(currentToPickup + pickupToDropoff);
    const averageSpeed = 55; 
    drivingHours = totalMiles / averageSpeed;
    routeGeometry = [[currentLocation.lat, currentLocation.lon],[pickupLocation.lat, pickupLocation.lon],[dropoffLocation.lat, dropoffLocation.lon],];
  }

  const totalHours = drivingHours + 2;
  const fuelStops = generateFuelStops(routeGeometry, totalMiles);
  const dailyLogs = generateDailyLogs(totalMiles, drivingHours, request.cycle_used_hours);
  const cycleHoursRemaining = Math.max(0, 70 - request.cycle_used_hours - totalHours);

  return {
    id: `trip-${Date.now()}`,
    route_geometry: routeGeometry,
    total_miles: totalMiles,
    total_hours: Math.round(totalHours * 10) / 10,
    total_days: dailyLogs.length,
    cycle_hours_remaining: Math.round(cycleHoursRemaining * 10) / 10,
    fuel_stops: fuelStops,
    daily_logs: dailyLogs,
    current_location: currentLocation,
    pickup_location: pickupLocation,
    dropoff_location: dropoffLocation
  };
};