# Backend (Django + DRF)

Django REST backend for the Trip & ELD Planner.

## Quick Start

1. **Create and activate virtual environment**
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Setup environment variables**
```bash
cp env.example .env
# Edit .env with your API keys
```

Required environment variables:
- `SECRET_KEY`: Django secret key
- `DEBUG`: Set to `true` for development
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `ORS_API_KEY`: OpenRouteService API key (get free at openrouteservice.org)
- `GRAPHHOPPER_API_KEY`: Optional GraphHopper API key for fallback

4. **Run migrations and start server**
```bash
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

## API Endpoints

- `GET /healthz` → Health check
- `POST /api/trips/compute` → Compute and save a trip
  - Input: `{ current_address, pickup_address, dropoff_address, cycle_used_hours }`
  - Output: Trip with route geometry, fuel stops, ELD logs
- `GET /api/trips/{id}` → Retrieve saved trip
- `GET /api/trips/{id}/download_log.pdf` → Download logs as PDF

## Development

### Database
- Development: SQLite (`db.sqlite3`)
- Production: PostgreSQL (set `DATABASE_URL`)

### Admin Interface
```bash
python manage.py createsuperuser
python manage.py runserver
# Visit http://localhost:8000/admin
```

### Testing
```bash
python manage.py test
```

## Deployment

### Render/Heroku
- Procfile is included: `web: gunicorn core.wsgi`
- Set environment variables in your hosting platform
- Add PostgreSQL database for production

### Environment Variables for Production
```env
SECRET_KEY=your-secure-secret-key
DEBUG=false
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
ORS_API_KEY=your_openrouteservice_key
DATABASE_URL=postgresql://user:pass@host:port/dbname
```

## Architecture

- **Models**: `Trip` model stores trip requests and computed results
- **Views**: REST API endpoints with DRF serializers
- **Utils**: Routing utilities using OpenRouteService with GraphHopper fallback
- **Settings**: Environment-based configuration with CORS enabled
