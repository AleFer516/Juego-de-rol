# backend/core/tests/conftest.py
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from model_bakery import baker
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

# ---------- Utilidades de autenticación ----------
def _access_token_for(user):
    """Genera un token de acceso (SimpleJWT) para un usuario dado."""
    return str(RefreshToken.for_user(user).access_token)

@pytest.fixture
def api_client():
    """Cliente API sin credenciales (útil para probar 401)."""
    return APIClient()

@pytest.fixture
def auth_client():
    """
    Fábrica de clientes autenticados.
    Uso: client = auth_client(user)
    """
    def _make(user):
        client = APIClient()
        token = _access_token_for(user)
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        return client
    return _make

# ---------- Usuarios de prueba ----------
@pytest.fixture
@pytest.mark.django_db
def password_valida():
    # Cumple validadores por defecto de Django (largo, no solo numérica, no común)
    return "Passw0rd!"

@pytest.fixture
@pytest.mark.django_db
def gm(password_valida):
    u = User.objects.create(username="gm_user", rol="GM")
    u.set_password(password_valida)
    u.save()
    return u

@pytest.fixture
@pytest.mark.django_db
def jugador(password_valida):
    u = User.objects.create(username="jugador_user", rol="JUGADOR")
    u.set_password(password_valida)
    u.save()
    return u

@pytest.fixture
@pytest.mark.django_db
def gm_client(auth_client, gm):
    """Cliente autenticado como GM."""
    return auth_client(gm)

@pytest.fixture
@pytest.mark.django_db
def jugador_client(auth_client, jugador):
    """Cliente autenticado como Jugador."""
    return auth_client(jugador)

# ---------- Catálogos base ----------
@pytest.fixture
@pytest.mark.django_db
def catalogos():
    """
    Crea algunos registros de catálogo y los retorna.
    """
    from core.models import Raza, Habilidad, Poder, Equipamiento

    razas = baker.make(Raza, nombre=baker.seq("Raza-"), _quantity=2)
    habilidades = baker.make(Habilidad, nombre=baker.seq("Hab-"), _quantity=3)
    poderes = baker.make(Poder, nombre=baker.seq("Poder-"), _quantity=2)
    equipos = baker.make(Equipamiento, nombre=baker.seq("Eq-"), _quantity=2)

    return {
        "razas": razas,
        "habilidades": habilidades,
        "poderes": poderes,
        "equipos": equipos,
    }

# ---------- Personajes de ejemplo ----------
@pytest.fixture
@pytest.mark.django_db
def personaje_en_pool(catalogos):
    """
    Personaje sin propietario (está 'disponible' para que un jugador lo elija).
    """
    from core.models import Personaje
    raza = catalogos["razas"][0]
    poder = catalogos["poderes"][0]
    equipo = catalogos["equipos"][0]
    pj = baker.make(
        Personaje,
        propietario=None,
        nombre=baker.seq("PJ-Pool-"),
        raza=raza,
        estado="VIVO",
        nivel=1,
        poder=poder,
        equipamiento=equipo,
    )
    return pj

@pytest.fixture
@pytest.mark.django_db
def personaje_de_jugador(catalogos, jugador):
    """
    Personaje ya asignado a un jugador.
    """
    from core.models import Personaje
    raza = catalogos["razas"][1]
    poder = catalogos["poderes"][1]
    equipo = catalogos["equipos"][1]
    pj = baker.make(
        Personaje,
        propietario=jugador,
        nombre=baker.seq("PJ-Jugador-"),
        raza=raza,
        estado="VIVO",
        nivel=1,
        poder=poder,
        equipamiento=equipo,
    )
    return pj
