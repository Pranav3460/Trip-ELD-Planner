from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def healthz(_request):
	return JsonResponse({'status': 'ok'})

urlpatterns = [
	path('admin/', admin.site.urls),
	path('healthz', healthz),
	path('api/trips/', include('trips.urls')),
]
