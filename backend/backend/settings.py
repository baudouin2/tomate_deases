import os
from pathlib import Path

# Définir la base du projet
BASE_DIR = Path(__file__).resolve(strict=True).parent.parent
SECRET_KEY = 'lh(5$$%wf+tf%m7%58x6o!52@x%n9y1)p5heq0(sp4sj@ro7ne'

# Mode debug pour le développement
DEBUG = True  # Passez à False en production

# Hôtes autorisés
ALLOWED_HOSTS = ['localhost', '127.0.0.1']  # Ajoutez votre IP ou nom de domaine en production

# Applications installées
INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "rest_framework",
    "corsheaders",  # Middleware CORS
    "django.contrib.sessions",  # Gestion des sessions utilisateur
    "chatbot",  # Application chatbot
    "diagnosis",  # Application de diagnostic
    "recommendations",  # Application de recommandations
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

# Autoriser les requêtes du frontend (CORS)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Pour le frontend React
    "http://127.0.0.1:3000",
    "exp://127.0.0.1:19000",  # Pour Expo (React Native)
    "http://localhost:19006",  # URL du serveur Expo en développement
    "http://172.20.10.12",
]

# Configuration de la base de données MongoDB avec Djongo
DATABASES = {
    'default': {
        'ENGINE': 'djongo',
        'NAME': 'tomate_db',
        'ENFORCE_SCHEMA': False,
        'CLIENT': {
            'host': 'mongodb://localhost:27017',
            'username': os.getenv('MONGO_USER', ''),  # Utilisez des variables d'environnement si nécessaire
            'password': os.getenv('MONGO_PASSWORD', ''),
            'authSource': 'admin',  # Dépend de votre configuration MongoDB
        }
    }
}

# Configuration des fichiers statiques
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

# Configuration de l'API REST
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ]
}

# Internationalisation
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Clé secrète pour Django (à sécuriser en production)
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'votre_clé_secrète')

