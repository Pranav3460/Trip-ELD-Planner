from django.urls import path
from .views import compute_trip, get_trip, download_logs_pdf

urlpatterns = [
	path('compute', compute_trip, name='compute-trip'),
	path('<int:pk>', get_trip, name='get-trip'),
	path('<int:pk>/download_log.pdf', download_logs_pdf, name='download-log'),
]
