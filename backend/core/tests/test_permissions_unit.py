import pytest
from types import SimpleNamespace
from model_bakery import baker
from core.permissions import EsGM, EsPropietarioOGM
from core.models import Personaje, Usuario, Raza, Poder, Equipamiento

@pytest.mark.django_db
def test_esgm_has_permission():
    gm = Usuario.objects.create_user(username="g", password="x", rol="GM")
    jug = Usuario.objects.create_user(username="j", password="x", rol="JUGADOR")
    req_gm = SimpleNamespace(user=gm)
    req_j = SimpleNamespace(user=jug)
    view = SimpleNamespace()  # no usado
    assert EsGM().has_permission(req_gm, view) is True
    assert EsGM().has_permission(req_j, view) is False

@pytest.mark.django_db
def test_espropietarioogm_has_object_permission():
    gm = Usuario.objects.create_user(username="g", password="x", rol="GM")
    owner = Usuario.objects.create_user(username="o", password="x", rol="JUGADOR")
    other = Usuario.objects.create_user(username="p", password="x", rol="JUGADOR")
    r, p, e = baker.make(Raza), baker.make(Poder), baker.make(Equipamiento)
    pj = baker.make(Personaje, propietario=owner, raza=r, estado="VIVO", nivel=1, poder=p, equipamiento=e)

    view = SimpleNamespace()

    assert EsPropietarioOGM().has_object_permission(SimpleNamespace(user=gm), view, pj) is True
    assert EsPropietarioOGM().has_object_permission(SimpleNamespace(user=owner), view, pj) is True
    assert EsPropietarioOGM().has_object_permission(SimpleNamespace(user=other), view, pj) is False
