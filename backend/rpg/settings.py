"""
Django settings for rpg project.
"""
from pathlib import Path
import os
from datetime import timedelta

# Carga de .env (opcional, útil en desarrollo local)
try:
    from dotenv import load_dotenv  # pip install python-dotenv
    load_dotenv()
except Exception:
    pass

BASE_DIR = Path(__file__).resolve().parent.parent

# === Seguridad / Entorno ===
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-secret-unsafe")
DEBUG = os.environ.get("DJANGO_DEBUG", "True").strip().lower() == "true"

# Lista separada por comas: "localhost,127.0.0.1,mi-dominio.com"
_allowed = os.environ.get("DJANGO_ALLOWED_HOSTS", "*")
ALLOWED_HOSTS = [h.strip() for h in _allowed.split(",") if h.strip()]

# CORS: si CORS_ALLOWED_ORIGINS no está definido, permite todo en dev
CORS_ALLOWED_ORIGINS = [
    o.strip() for o in os.environ.get("CORS_ALLOWED_ORIGINS", "").split(",") if o.strip()
]
CORS_ALLOW_ALL_ORIGINS = not bool(CORS_ALLOWED_ORIGINS)

# CSRF (útil si usas cookies en producción)
CSRF_TRUSTED_ORIGINS = [
    o.strip() for o in os.environ.get("CSRF_TRUSTED_ORIGINS", "").split(",") if o.strip()
]

# === Apps ===
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "core",
    "axes",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "axes.middleware.AxesMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "rpg.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "rpg.wsgi.application"
ASGI_APPLICATION = "rpg.asgi.application"

# === Base de datos (SQLite por defecto; DATABASE_URL opcional) ===
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}
# Si defines DATABASE_URL (Postgres, etc.), úsalo automáticamente.
# Requiere: pip install dj-database-url
if os.environ.get("DATABASE_URL"):
    try:
        import dj_database_url
        DATABASES["default"] = dj_database_url.config(
            default=os.environ["DATABASE_URL"],
            conn_max_age=600,
            ssl_require=False,
        )
    except Exception:
        # Si no está instalado o falla, sigue con SQLite
        pass

# === Password validators ===
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},  # min 8 por defecto
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# === I18N / TZ ===
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# === Archivos estáticos ===
STATIC_URL = "static/"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "core.Usuario"
# --- Seguridad extra en producción ---
# Usa DEBUG=False en prod para que estos apliquen. Control por env.
if not DEBUG:
    # Forzar HTTPS
    SECURE_SSL_REDIRECT = True
    # Strict-Transport-Security (HSTS)
    SECURE_HSTS_SECONDS = int(os.environ.get("SECURE_HSTS_SECONDS", "31536000"))  # 1 año
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    # Cookies sólo por HTTPS
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    # SameSite: protege contra CSRF básico
    CSRF_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SAMESITE = "Lax"


# === DRF / JWT ===
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

# --- Límite de tasa (throttling) para mitigar abuso de API ---
REST_FRAMEWORK.setdefault("DEFAULT_THROTTLE_CLASSES", [
    "rest_framework.throttling.AnonRateThrottle",
    "rest_framework.throttling.UserRateThrottle",
])
# Límites por defecto (ajústalos por env si quieres)
REST_FRAMEWORK.setdefault("DEFAULT_THROTTLE_RATES", {
    "anon": os.environ.get("DRF_THROTTLE_ANON", "60/min"),
    "user": os.environ.get("DRF_THROTTLE_USER", "120/min"),
})

# Tiempos de vida de tokens configurables por env
# JWT_ACCESS_MINUTES=60, JWT_REFRESH_DAYS=7, por ejemplo
AXES_FAILURE_LIMIT = 5
AXES_COOLOFF_TIME = 10  # en minutos
AXES_ONLY_USER_FAILURES = True  # bloquea por usuario (no IP completa)

ACCESS_MIN = int(os.environ.get("JWT_ACCESS_MINUTES", "60"))
REFRESH_DAYS = int(os.environ.get("JWT_REFRESH_DAYS", "7"))

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=ACCESS_MIN),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=REFRESH_DAYS),
}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "file": {
            "level": "INFO",
            "class": "logging.FileHandler",
            "filename": BASE_DIR / "audit.log",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["file"],
            "level": "INFO",
            "propagate": True,
        },
    },
}
