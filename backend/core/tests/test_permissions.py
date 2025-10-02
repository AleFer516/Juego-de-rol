# tests/test_permissions.py
import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from model_bakery import baker
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import Usuario, Personaje, Raza, Poder, Equipamiento


# ---------------------------
# Helpers
# ---------------------------
def token_for(user: Usuario) -> str:
    """Genera un access token SimpleJWT para el usuario dado."""
    return str(RefreshToken.for_user(user).access_token)


def auth_client(user: Usuario) -> APIClient:
    """Devuelve un APIClient autenticado con el usuario dado."""
    c = APIClient()
    c.credentials(HTTP_AUTHORIZATION=f"Bearer {token_for(user)}")
    return c


# ---------------------------
# Casos de prueba
# ---------------------------

@pytest.mark.django_db
def test_catalogo_solo_gm_puede_listar_razas():
    """
    EsGM: endpoints de catálogo (ej. /razas/) deben permitir solo a GM.
    - Jugador -> 403
    - GM -> 200
    """
    gm = Usuario.objects.create_user(username="gm1", password="Passw0rd!", rol="GM")
    jug = Usuario.objects.create_user(username="jug1", password="Passw0rd!", rol="JUGADOR")

    # Creamos un registro por si el viewset lista algo
    baker.make(Raza, nombre="Humano")

    # Jugador intentando listar /razas/
    c_jug = auth_client(jug)
    url_razas = reverse("raza-list")  # router.register("razas", RazaViewSet)
    r_jug = c_jug.get(url_razas)
    assert r_jug.status_code in (401, 403), r_jug.content

    # GM puede listar /razas/
    c_gm = auth_client(gm)
    r_gm = c_gm.get(url_razas)
    assert r_gm.status_code == 200, r_gm.content


@pytest.mark.django_db
def test_jugador_no_ve_personajes_de_otros_en_listado():
    """
    Menor privilegio (get_queryset por rol):
    - El jugador solo ve sus personajes en /personajes/ (no ve ajenos).
    """
    jug1 = Usuario.objects.create_user(username="jug1", password="Passw0rd!", rol="JUGADOR")
    jug2 = Usuario.objects.create_user(username="jug2", password="Passw0rd!", rol="JUGADOR")

    raza = baker.make(Raza)
    poder = baker.make(Poder)
    eq = baker.make(Equipamiento)

    # Personaje de jug2 (no debe aparecer a jug1)
    baker.make(Personaje, propietario=jug2, nombre="DeOtro",
               raza=raza, estado="VIVO", nivel=1, poder=poder, equipamiento=eq)

    c = auth_client(jug1)
    url_list = reverse("personaje-list")  # router.register("personajes", PersonajeViewSet)
    r = c.get(url_list)
    assert r.status_code == 200
    nombres = [x["nombre"] for x in r.json()]
    assert "DeOtro" not in nombres


@pytest.mark.django_db
def test_detalle_personaje_gm_y_propietario_ok_no_propietario_no():
    """
    EsPropietarioOGM en detalle:
    - Owner -> 200
    - GM -> 200
    - Otro jugador -> 404/403 (no debe poder acceder al objeto)
      (por el filtrado del queryset del viewset, normalmente retorna 404)
    """
    gm = Usuario.objects.create_user(username="gm1", password="Passw0rd!", rol="GM")
    owner = Usuario.objects.create_user(username="own", password="Passw0rd!", rol="JUGADOR")
    other = Usuario.objects.create_user(username="oth", password="Passw0rd!", rol="JUGADOR")

    raza = baker.make(Raza)
    poder = baker.make(Poder)
    eq = baker.make(Equipamiento)

    pj = baker.make(Personaje, propietario=owner, nombre="MiPJ",
                    raza=raza, estado="VIVO", nivel=1, poder=poder, equipamiento=eq)

    # Owner ve su personaje
    c_owner = auth_client(owner)
    url_det = reverse("personaje-detail", args=[pj.id])
    r_owner = c_owner.get(url_det)
    assert r_owner.status_code == 200, r_owner.content

    # GM ve cualquier personaje
    c_gm = auth_client(gm)
    r_gm = c_gm.get(url_det)
    assert r_gm.status_code == 200, r_gm.content

    # Otro jugador NO debe poder verlo (normalmente 404 por el get_queryset del viewset)
    c_other = auth_client(other)
    r_other = c_other.get(url_det)
    assert r_other.status_code in (403, 404), r_other.content
