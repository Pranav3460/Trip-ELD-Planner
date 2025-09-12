from django.db import models


class Trip(models.Model):
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	current_address = models.CharField(max_length=255)
	pickup_address = models.CharField(max_length=255)
	dropoff_address = models.CharField(max_length=255)
	cycle_used_hours = models.FloatField(default=0)

	# Store computed results as JSON
	result = models.JSONField(default=dict, blank=True)

	def __str__(self) -> str:  # pragma: no cover
		return f"Trip {self.id}: {self.current_address} -> {self.pickup_address} -> {self.dropoff_address}"
