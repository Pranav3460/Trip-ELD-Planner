import os
import json
import math
from typing import Dict, List, Tuple
import requests

ORS_API_KEY = os.getenv('ORS_API_KEY', '')
GH_API_KEY = os.getenv('GRAPHHOPPER_API_KEY', '')


def geocode_ors(query: str) -> Tuple[float, float, str]:
	url = 'https://api.openrouteservice.org/geocode/search'
	headers = {'Authorization': ORS_API_KEY}
	params = {'text': query, 'size': 1}
	r = requests.get(url, headers=headers, params=params, timeout=20)
	r.raise_for_status()
	data = r.json()
	features = data.get('features', [])
	if not features:
		raise ValueError('No geocode results')
	coord = features[0]['geometry']['coordinates']  # lon, lat
	props = features[0].get('properties', {})
	name = props.get('label', query)
	return float(coord[1]), float(coord[0]), name


def geocode_fallback(query: str) -> Tuple[float, float, str]:
	if not GH_API_KEY:
		raise ValueError('No fallback key')
	url = 'https://graphhopper.com/api/1/geocode'
	params = {'q': query, 'limit': 1, 'key': GH_API_KEY}
	r = requests.get(url, params=params, timeout=20)
	r.raise_for_status()
	data = r.json()
	hits = data.get('hits', [])
	if not hits:
		raise ValueError('No fallback results')
	h = hits[0]
	return float(h['point']['lat']), float(h['point']['lng']), h.get('name', query)


def geocode(query: str) -> Tuple[float, float, str]:
	try:
		return geocode_ors(query)
	except Exception:
		return geocode_fallback(query)


def route_ors(points: List[Tuple[float, float]]) -> Dict:
	url = 'https://api.openrouteservice.org/v2/directions/driving-hgv'
	headers = {'Authorization': ORS_API_KEY, 'Content-Type': 'application/json'}
	# ORS expects lon,lat pairs
	coords = [[lon, lat] for lat, lon in points]
	payload = {'coordinates': coords, 'instructions': False}
	r = requests.post(url, headers=headers, data=json.dumps(payload), timeout=30)
	r.raise_for_status()
	return r.json()


def compute_trip_with_ors(points: List[Tuple[float, float]]) -> Dict:
	data = route_ors(points)
	feat = data['features'][0]
	geom = feat['geometry']
	summary = feat['properties']['summary']
	distance_m = float(summary['distance'])
	time_s = float(summary['duration'])
	return {
		'route_geometry': geom['coordinates'],  # lon, lat pairs
		'distance_m': distance_m,
		'duration_s': time_s,
	}


def miles(meters: float) -> float:
	return meters / 1609.34


def hours(seconds: float) -> float:
	return seconds / 3600.0


def fuel_stops_every_1000(total_miles: float, route_coords: List[Tuple[float, float]]):
	stops = []
	if total_miles <= 0 or not route_coords:
		return stops
	n = math.floor(total_miles / 1000)
	for i in range(1, n + 1):
		idx = math.floor(len(route_coords) * (i / (n + 1)))
		lat, lon = route_coords[idx][1], route_coords[idx][0]  # convert to lat,lon for frontend
		stops.append({
			'id': f'fuel-{i}',
			'lat': lat,
			'lon': lon,
			'distance_from_start': i * 1000,
			'address': f'Fuel Stop {i} - Mile {i * 1000}',
		})
	return stops


def generate_daily_logs(total_miles: float, driving_hours: float, cycle_used_hours: float):
	logs = []
	MAX_DAILY_DRIVING = 11
	MAX_SHIFT_HOURS = 14
	MAX_CYCLE_HOURS = 70
	PRE_POST_TRIP = 1

	rem_miles = total_miles
	rem_hours = driving_hours
	cycle_rem = max(0, MAX_CYCLE_HOURS - cycle_used_hours)
	day = 1

	while (rem_miles > 0 or rem_hours > 0) and day <= 30:
		if cycle_rem < 1:
			logs.append({'day': day, 'date': '', 'drive_hours': 0, 'on_duty_hours': 0, 'off_duty_hours': 24, 'miles': 0, 'notes': ['34-hour restart'], 'is_rest_day': True})
			cycle_rem = MAX_CYCLE_HOURS
			day += 1
			continue
		drive_today = min(MAX_DAILY_DRIVING, rem_hours)
		breaks = 0.5 if drive_today >= 8 else 0
		on_duty = min(MAX_SHIFT_HOURS, PRE_POST_TRIP + drive_today + breaks, cycle_rem)
		final_drive = max(0, on_duty - PRE_POST_TRIP - breaks)
		day_miles = min(rem_miles, (rem_miles / max(rem_hours, 1)) * final_drive)
		logs.append({'day': day, 'date': '', 'drive_hours': round(final_drive, 1), 'on_duty_hours': round(on_duty, 1), 'off_duty_hours': round(max(0, 24 - on_duty), 1), 'miles': int(round(day_miles)), 'notes': ['30-min break'] if breaks else [], 'is_rest_day': False})
		rem_miles -= day_miles
		rem_hours -= final_drive
		cycle_rem -= on_duty
		day += 1
	return logs
