
# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError

class Usuario(AbstractUser):
    class Rol(models.TextChoices):
        JUGADOR = "JUGADOR", "Jugador"
        GM = "GM", "Maestro de Juego"
    rol = models.CharField(max_length=10, choices=Rol.choices, default=Rol.JUGADOR)

    def __str__(self):
        return f"{self.username} ({self.rol})"

class Raza(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    def __str__(self): return self.nombre

class Habilidad(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    def __str__(self): return self.nombre

class Poder(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    def __str__(self): return self.nombre

class Equipamiento(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    def __str__(self): return self.nombre

class Personaje(models.Model):
    class Estado(models.TextChoices):
        VIVO = "VIVO", "Vivo"
        MUERTO = "MUERTO", "Muerto"
        CONGELADO = "CONGELADO", "Congelado"

    propietario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="personajes", null=True, blank=True)
    nombre = models.CharField(max_length=50, unique=True)
    raza = models.ForeignKey(Raza, on_delete=models.PROTECT)
    estado = models.CharField(max_length=10, choices=Estado.choices, default=Estado.VIVO)
    nivel = models.PositiveIntegerField(default=1)
    habilidades = models.ManyToManyField(Habilidad, blank=False)
    poder = models.ForeignKey(Poder, on_delete=models.PROTECT)
    equipamiento = models.ForeignKey(Equipamiento, on_delete=models.PROTECT)
    # Personaje
    opcion_hab1 = models.ForeignKey(Habilidad, null=True, blank=True, related_name='opcion1', on_delete=models.SET_NULL)
    opcion_hab2 = models.ForeignKey(Habilidad, null=True, blank=True, related_name='opcion2', on_delete=models.SET_NULL)
    opcion_hab3 = models.ForeignKey(Habilidad, null=True, blank=True, related_name='opcion3', on_delete=models.SET_NULL)

    habilidad1 = models.ForeignKey(Habilidad, null=True, blank=True, related_name='seleccion1', on_delete=models.SET_NULL)
    habilidad2 = models.ForeignKey(Habilidad, null=True, blank=True, related_name='seleccion2', on_delete=models.SET_NULL)


    def clean(self):
        # Validar nivel
        if self.nivel < 1:
            raise ValidationError("El nivel debe ser mayor o igual a 1.")

        # Validar nombre contra inyecciones
        if any(c in self.nombre for c in ["<", ">", "{", "}", ";"]):
            raise ValidationError("El nombre del personaje contiene caracteres no permitidos.")

    def puede_editar(self):
        return self.estado != self.Estado.MUERTO

    def __str__(self):
        return f"{self.nombre} (nivel {self.nivel})"

class AuditLog(models.Model):
    """
    Registro de auditoría:
    - Guarda acciones relevantes de usuarios (especialmente GM).
    - Útil para trazabilidad y cumplimiento normativo.
    """
    usuario = models.ForeignKey(Usuario, null=True, on_delete=models.SET_NULL)
    accion = models.CharField(max_length=100)  # ej: "CREAR_PERSONAJE", "CAMBIAR_ESTADO"
    detalle = models.TextField(blank=True)
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.fecha} - {self.usuario} - {self.accion}"
