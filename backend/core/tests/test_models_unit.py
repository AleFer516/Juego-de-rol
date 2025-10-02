import pytest
from django.core.exceptions import ValidationError
from model_bakery import baker
from core.models import Personaje, Raza, Poder, Equipamiento, Usuario

@pytest.mark.django_db
def test_personaje_clean_nivel_minimo():
    r, p, e, u = baker.make(Raza), baker.make(Poder), baker.make(Equipamiento), baker.make(Usuario)
    pj = Personaje(propietario=u, nombre="Valido", raza=r, estado="VIVO", nivel=0, poder=p, equipamiento=e)
    with pytest.raises(ValidationError):
        pj.clean()

@pytest.mark.django_db
def test_personaje_puede_editar_en_muerto():
    r, p, e, u = baker.make(Raza), baker.make(Poder), baker.make(Equipamiento), baker.make(Usuario)
    pj = baker.make(Personaje, propietario=u, nombre="A", raza=r, estado="MUERTO", nivel=1, poder=p, equipamiento=e)
    assert not pj.puede_editar()

@pytest.mark.django_db
def test_personaje_puede_editar_en_vivo_o_congelado():
    r, p, e, u = baker.make(Raza), baker.make(Poder), baker.make(Equipamiento), baker.make(Usuario)
    pj_vivo = baker.make(Personaje, propietario=u, nombre="B", raza=r, estado="VIVO", nivel=1, poder=p, equipamiento=e)
    pj_cong = baker.make(Personaje, propietario=u, nombre="C", raza=r, estado="CONGELADO", nivel=1, poder=p, equipamiento=e)
    assert pj_vivo.puede_editar()
    assert pj_cong.puede_editar()
