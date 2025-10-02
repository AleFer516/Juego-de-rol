# backend/core/management/commands/seed_testdata.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Raza, Habilidad, Poder, Equipamiento, Personaje

User = get_user_model()

class Command(BaseCommand):
    help = "Carga datos de prueba (GM, Jugador, catálogos y personajes). SE USA EN E2E."

    def handle(self, *args, **options):
        password = "Passw0rd!"

        # Usuarios
        gm, _ = User.objects.get_or_create(username="gm", defaults={"rol": "GM"})
        gm.set_password(password); gm.save()

        jug, _ = User.objects.get_or_create(username="jugador", defaults={"rol": "JUGADOR"})
        jug.set_password(password); jug.save()

        # Catálogos
        Raza.objects.all().delete()
        Habilidad.objects.all().delete()
        Poder.objects.all().delete()
        Equipamiento.objects.all().delete()
        Personaje.objects.all().delete()

        humano = Raza.objects.create(nombre="Humano")
        elfo = Raza.objects.create(nombre="Elfo")

        sigilo = Habilidad.objects.create(nombre="Sigilo")
        fuerza = Habilidad.objects.create(nombre="Fuerza")
        sabiduria = Habilidad.objects.create(nombre="Sabiduría")

        fuego = Poder.objects.create(nombre="Fuego")
        hielo = Poder.objects.create(nombre="Hielo")

        espada = Equipamiento.objects.create(nombre="Espada")
        armadura = Equipamiento.objects.create(nombre="Armadura")

        # Personaje sin propietario (pool)
        pool = Personaje.objects.create(
            propietario=None, nombre="SinDueño",
            raza=humano, estado="VIVO", nivel=1,
            poder=fuego, equipamiento=espada
        )
        # Opciones de habilidades para que el jugador pueda elegir 2
        pool.opcion_hab1 = sigilo
        pool.opcion_hab2 = fuerza
        pool.opcion_hab3 = sabiduria
        pool.save()

        # Personaje del jugador (por si necesitas lista de “Mis personajes”)
        pj_jug = Personaje.objects.create(
            propietario=jug, nombre="MiPj",
            raza=elfo, estado="VIVO", nivel=1,
            poder=hielo, equipamiento=armadura
        )

        self.stdout.write(self.style.SUCCESS("Datos E2E sembrados. Usuarios: gm/jugador (Passw0rd!)"))
