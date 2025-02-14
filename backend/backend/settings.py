import os
from pathlib import Path

# Base du projet
BASE_DIR = Path(__file__).resolve(strict=True).parent.parent

# Clé secrète, à ne jamais exposer en production
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'votre_clé_secrète')

# Mode debug pour le développement
DEBUG = True  # Passez à False en production

# Hôtes autorisés
ALLOWED_HOSTS = ['*']

# URL du projet principal
ROOT_URLCONF = 'backend.urls'

# Applications installées
INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "rest_framework",  # Django Rest Framework
    "rest_framework_simplejwt",  # Authentification JWT
    "corsheaders",  # Middleware CORS
    "chatbot",  # Application chatbot
    "diagnosis",  # Application de diagnostic
    "recommendations",  # Application de recommandations
    "authentication",  # Application d'authentification
]

# Middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS - Autoriser les requêtes provenant de n'importe quel frontend
CORS_ALLOW_ALL_ORIGINS = True

# Base de données MongoDB via Djongo
DATABASES = {
    'default': {
        'ENGINE': 'djongo',
        'NAME': 'tomate_db',
        'ENFORCE_SCHEMA': False,
        'CLIENT': {
            'host': 'mongodb://localhost:27017',
            'username': os.getenv('MONGO_USER', ''),  # Utilisez des variables d'environnement
            'password': os.getenv('MONGO_PASSWORD', ''),
            'authSource': 'admin',  # Dépend de votre configuration MongoDB
        }
    }
}

# Fichiers statiques (collecte, gestion)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

# Configuration de l'API REST avec les permissions globales
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # Permet à tout le monde d'accéder aux API
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',  # Authentification JWT
    ],
}

# Internationalisation et fuseau horaire
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Sécurisation de la clé secrète de Django en environnement de production
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'votre_clé_secrète')

# Model d'authentification personnalisé
AUTH_USER_MODEL = 'authentication.CustomUser'
