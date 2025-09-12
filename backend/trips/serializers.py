from rest_framework import serializers
from .models import Trip


class TripComputeRequestSerializer(serializers.Serializer):
	current_address = serializers.CharField()
	pickup_address = serializers.CharField()
	dropoff_address = serializers.CharField()
	cycle_used_hours = serializers.FloatField(min_value=0, max_value=70)


class TripSerializer(serializers.ModelSerializer):
	class Meta:
		model = Trip
		fields = ['id', 'created_at', 'updated_at', 'current_address', 'pickup_address', 'dropoff_address', 'cycle_used_hours', 'result']
