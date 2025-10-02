import pytest
from django.core.exceptions import ValidationError
from model_bakery import baker
from core.models import Personaje, Raza, Poder, Equipamiento, Usuario

@pytest.mark.django_db
def test_personaje_nombre_rechaza_caracteres_peligrosos():
    raza = baker.make(Raza)
    poder = baker.make(Poder)
    eq = baker.make(Equipamiento)
    u = baker.make(Usuario)
    p = Personaje(
        propietario=u, nombre="Pepe<script>", raza=raza,
        estado="VIVO", nivel=1, poder=poder, equipamiento=eq
    )
    with pytest.raises(ValidationError):
        p.clean()

@pytest.mark.django_db
def test_personaje_nivel_minimo():
    raza = baker.make(Raza)
    poder = baker.make(Poder)
    eq = baker.make(Equipamiento)
    u = baker.make(Usuario)
    p = Personaje(
        propietario=u, nombre="Valido", raza=raza,
        estado="VIVO", nivel=0, poder=poder, equipamiento=eq
    )
    with pytest.raises(ValidationError):
        p.clean()
