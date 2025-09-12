from io import BytesIO
from django.http import JsonResponse, HttpResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework import status
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from .models import Trip
from .serializers import TripComputeRequestSerializer, TripSerializer
from utils.routing import geocode, compute_trip_with_ors, miles, hours, fuel_stops_every_1000, generate_daily_logs


@api_view(['POST'])
def compute_trip(request):
	serializer = TripComputeRequestSerializer(data=request.data)
	serializer.is_valid(raise_exception=True)
	payload = serializer.validated_data

	# Geocode
	curr = geocode(payload['current_address'])
	pick = geocode(payload['pickup_address'])
	drop = geocode(payload['dropoff_address'])

	# Route using ORS
	route = compute_trip_with_ors([curr[:2], pick[:2], drop[:2]])
	# route_geometry is lon,lat pairs; convert to [lat, lon] for frontend
	route_coords_latlon = [[lat, lon] for lon, lat in route['route_geometry']]
	total_miles = round(miles(route['distance_m']))
	driving_hours = hours(route['duration_s'])
	total_hours = driving_hours + 2

	fuel_stops = fuel_stops_every_1000(total_miles, route['route_geometry'])
	logs = generate_daily_logs(total_miles, driving_hours, payload['cycle_used_hours'])

	result = {
		'id': None,
		'route_geometry': route_coords_latlon,
		'total_miles': total_miles,
		'total_hours': round(total_hours, 1),
		'total_days': len(logs),
		'cycle_hours_remaining': round(max(0.0, 70 - payload['cycle_used_hours'] - total_hours), 1),
		'fuel_stops': fuel_stops,
		'daily_logs': logs,
		'current_location': {'display_name': payload['current_address'], 'lat': curr[0], 'lon': curr[1]},
		'pickup_location': {'display_name': payload['pickup_address'], 'lat': pick[0], 'lon': pick[1]},
		'dropoff_location': {'display_name': payload['dropoff_address'], 'lat': drop[0], 'lon': drop[1]},
	}

	trip = Trip.objects.create(
		current_address=payload['current_address'],
		pickup_address=payload['pickup_address'],
		dropoff_address=payload['dropoff_address'],
		cycle_used_hours=payload['cycle_used_hours'],
		result=result,
	)
	result['id'] = trip.id
	return JsonResponse(result, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_trip(request, pk: int):
	try:
		trip = Trip.objects.get(pk=pk)
	except Trip.DoesNotExist:
		raise Http404
	return JsonResponse(TripSerializer(trip).data)


@api_view(['GET'])
def download_logs_pdf(request, pk: int):
	try:
		trip = Trip.objects.get(pk=pk)
	except Trip.DoesNotExist:
		raise Http404

	buffer = BytesIO()
	p = canvas.Canvas(buffer, pagesize=letter)
	width, height = letter

	p.setFont('Helvetica-Bold', 16)
	p.drawString(72, height - 72, f"ELD Trip Logs - Trip {trip.id}")
	p.setFont('Helvetica', 10)
	p.drawString(72, height - 90, f"Current: {trip.current_address}")
	p.drawString(72, height - 105, f"Pickup: {trip.pickup_address}")
	p.drawString(72, height - 120, f"Drop-off: {trip.dropoff_address}")

	y = height - 150
	p.setFont('Helvetica', 12)
	p.drawString(72, y, 'Daily Logs:')
	y -= 18
	p.setFont('Helvetica', 9)
	for log in trip.result.get('daily_logs', [])[:40]:
		line = f"Day {log.get('day')}: Drive {log.get('drive_hours')}h, On-duty {log.get('on_duty_hours')}h, Off-duty {log.get('off_duty_hours')}h, Miles {log.get('miles')}"
		p.drawString(72, y, line)
		y -= 12
		if y < 72:
			p.showPage()
			y = height - 72

	p.showPage()
	p.save()
	buffer.seek(0)
	response = HttpResponse(buffer, content_type='application/pdf')
	response['Content-Disposition'] = f'attachment; filename="eld-logs-{pk}.pdf"'
	return response
