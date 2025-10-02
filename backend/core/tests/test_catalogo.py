import pytest
from types import SimpleNamespace
from django.contrib.auth import get_user_model
from core.serializers import (
    RazaSerializer, HabilidadSerializer, PoderSerializer, EquipamientoSerializer,
    PersonajeSerializer, RegisterSerializer
)
from core.models import Raza, Habilidad, Poder, Equipamiento, Personaje

User = get_user_model()

@pytest.mark.django_db
def test_catalogo_validadores_nombre_ok():
    for S in (RazaSerializer, HabilidadSerializer, PoderSerializer, EquipamientoSerializer):
        ser = S(data={"nombre": "Nombre Valido"})
        assert ser.is_valid(), ser.errors
        obj = ser.save()
        assert obj.nombre == "Nombre Valido"

@pytest.mark.django_db
def test_catalogo_validadores_nombre_invalido():
    for S in (RazaSerializer, HabilidadSerializer, PoderSerializer, EquipamientoSerializer):
        ser = S(data={"nombre": "Malo<script>"})
        assert not ser.is_valid()
        assert "nombre" in ser.errors

@pytest.mark.django_db
def test_personaje_serializer_valida_nombre_peligroso(catalogos, jugador):
    data = {
        "nombre": "Pepe<script>",
        "raza": catalogos["razas"][0].id,
        "poder": catalogos["poderes"][0].id,
        "equipamiento": catalogos["equipos"][0].id,
    }
    req = SimpleNamespace(user=jugador)
    ser = PersonajeSerializer(data=data, context={"request": req})
    assert not ser.is_valid()
    assert "nombre" in ser.errors

@pytest.mark.django_db
def test_personaje_create_propietario_segun_rol_gm(catalogos, gm):
    data = {
        "nombre": "Thrall",
        "raza": catalogos["razas"][0].id,
        "poder": catalogos["poderes"][0].id,
        "equipamiento": catalogos["equipos"][0].id,
    }
    req = SimpleNamespace(user=gm)
    ser = PersonajeSerializer(data=data, context={"request": req})
    ser.is_valid(raise_exception=True)
    pj = ser.save()
    assert pj.propietario is None  # GM crea al pool

@pytest.mark.django_db
def test_personaje_create_propietario_segun_rol_jugador(catalogos, jugador):
    data = {
        "nombre": "MiPj",
        "raza": catalogos["razas"][0].id,
        "poder": catalogos["poderes"][0].id,
        "equipamiento": catalogos["equipos"][0].id,
    }
    req = SimpleNamespace(user=jugador)
    ser = PersonajeSerializer(data=data, context={"request": req})
    ser.is_valid(raise_exception=True)
    pj = ser.save()
    assert pj.propietario_id == jugador.id

@pytest.mark.django_db
def test_register_serializer_valida_passwords_y_rol_por_defecto():
    ser = RegisterSerializer(data={
        "username": "nuevo",
        "email": "n@x.com",
        "password": "Passw0rd!",
        "password2": "Passw0rd!",
    })
    ser.is_valid(raise_exception=True)
    user = ser.save()
    assert user.rol == User.Rol.JUGADOR

@pytest.mark.django_db
def test_register_serializer_password_mismatch():
    ser = RegisterSerializer(data={
        "username": "otro",
        "email": "",
        "password": "abc12345",
        "password2": "zzz12345",
    })
    assert not ser.is_valid()
    assert "password2" in ser.errors or "non_field_errors" in ser.errors
