import os
import dj_database_url
from pathlib import Path
from dotenv import load_dotenv
import logging

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# Configure logging for debugging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.info("Django settings loading...")

SECRET_KEY = os.environ.get('SECRET_KEY', 'fallback-secret-key')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# Debug logging
logger.info(f"DEBUG: {DEBUG}")
logger.info(f"ALLOWED_HOSTS: {ALLOWED_HOSTS}")
logger.info(f"PORT: {os.environ.get('PORT', 'Not set')}")

INSTALLED_APPS = [
	'django.contrib.admin',
	'django.contrib.auth',
	'django.contrib.contenttypes',
	'django.contrib.sessions',
	'django.contrib.messages',
	'django.contrib.staticfiles',
	'rest_framework',
	'corsheaders',
	'trips',
]

MIDDLEWARE = [
	'corsheaders.middleware.CorsMiddleware',
	'django.middleware.security.SecurityMiddleware',
	'django.contrib.sessions.middleware.SessionMiddleware',
	'django.middleware.common.CommonMiddleware',
	'django.middleware.csrf.CsrfViewMiddleware',
	'django.contrib.auth.middleware.AuthenticationMiddleware',
	'django.contrib.messages.middleware.MessageMiddleware',
	'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
	{
		'BACKEND': 'django.template.backends.django.DjangoTemplates',
		'DIRS': [],
		'APP_DIRS': True,
		'OPTIONS': {
			'context_processors': [
				'django.template.context_processors.debug',
				'django.template.context_processors.request',
				'django.contrib.auth.context_processors.auth',
				'django.contrib.messages.context_processors.messages',
			],
		},
	},
]

WSGI_APPLICATION = 'core.wsgi.application'
ASGI_APPLICATION = 'core.asgi.application'

DATABASES = {
	'default': dj_database_url.config(
		default=os.environ.get('DATABASE_URL', f'sqlite:///{BASE_DIR / "db.sqlite3"}')
	)
}

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK = {
	'DEFAULT_RENDERER_CLASSES': (
		'rest_framework.renderers.JSONRenderer',
	),
}

ORS_API_KEY = os.getenv('ORS_API_KEY', '')
GRAPHHOPPER_API_KEY = os.getenv('GRAPHHOPPER_API_KEY', '')
