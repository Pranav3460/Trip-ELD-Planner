from django.contrib import admin
from .models import Trip

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
	list_display = ('id', 'current_address', 'pickup_address', 'dropoff_address', 'created_at')
	search_fields = ('current_address', 'pickup_address', 'dropoff_address')
