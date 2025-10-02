from rest_framework import serializers
from .models import Personaje, Raza, Habilidad, Poder, Equipamiento
from django.contrib.auth import get_user_model
from rest_framework import serializers as drf_serializers 

# --------- Catálogos ---------
class RazaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Raza
        fields = ["id", "nombre"]

    def validate_nombre(self, value):
        if not value.strip():
            raise serializers.ValidationError("El nombre no puede estar vacío.")
        if any(c in value for c in ["<", ">", "{", "}", ";"]):
            raise serializers.ValidationError("Nombre inválido: contiene caracteres peligrosos.")
        return value.strip()

class HabilidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habilidad
        fields = ["id", "nombre"]

    def validate_nombre(self, value):
        if not value.strip():
            raise serializers.ValidationError("El nombre no puede estar vacío.")
        if any(c in value for c in ["<", ">", "{", "}", ";"]):
            raise serializers.ValidationError("Nombre inválido: contiene caracteres peligrosos.")
        return value.strip()
        
class PoderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Poder
        fields = ["id", "nombre"]

    def validate_nombre(self, value):
        if not value.strip():
            raise serializers.ValidationError("El nombre no puede estar vacío.")
        if any(c in value for c in ["<", ">", "{", "}", ";"]):
            raise serializers.ValidationError("Nombre inválido: contiene caracteres peligrosos.")
        return value.strip()        

class EquipamientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipamiento
        fields = ["id", "nombre"]

    def validate_nombre(self, value):
        if not value.strip():
            raise serializers.ValidationError("El nombre no puede estar vacío.")
        if any(c in value for c in ["<", ">", "{", "}", ";"]):
            raise serializers.ValidationError("Nombre inválido: contiene caracteres peligrosos.")
        return value.strip()        


# --------- Personajes (CRUD base) ---------
class PersonajeSerializer(serializers.ModelSerializer):
    """
    NOTA: Ya no se maneja M2M 'habilidades' en el serializer.
    El GM crea/edita personaje (sin habilidades).
    Las opciones (3) y selección (2) se gestionan en endpoints dedicados.

    Serializer para creación/edición de Personaje.
    - Valida que los nombres tengan longitud mínima.
    - Bloquea caracteres peligrosos para prevenir inyecciones.
    """
    class Meta:
        model = Personaje
        fields = ["id", "propietario", "nombre", "raza", "estado", "nivel", "poder", "equipamiento"]
        read_only_fields = ["propietario", "nivel", "estado"]

    def create(self, validados):
        req = self.context.get("request")
        usuario = getattr(req, "user", None)
        propietario = None if getattr(usuario, "rol", None) == "GM" else usuario
        pj = Personaje.objects.create(propietario=propietario, **validados)
        return pj
    
    def validate_nombre(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("El nombre debe tener al menos 3 caracteres.")
        if any(c in value for c in ["<", ">", "{", "}", ";"]):
            raise serializers.ValidationError("El nombre contiene caracteres no permitidos.")
        return value



class PersonajeActualizarSerializer(PersonajeSerializer):
    class Meta(PersonajeSerializer.Meta):
        # El jugador NO puede tocar estos campos por este serializer
        read_only_fields = ["propietario", "nivel", "estado", "raza", "poder", "equipamiento"]


# --------- Listado (para GM y Jugador) ---------
class PersonajeListaSerializer(serializers.ModelSerializer):
    raza_nombre = serializers.CharField(source="raza.nombre", read_only=True)
    poder_nombre = serializers.CharField(source="poder.nombre", read_only=True)
    equipamiento_nombre = serializers.CharField(source="equipamiento.nombre", read_only=True)
    propietario_username = serializers.CharField(source="propietario.username", read_only=True)

    opciones = serializers.SerializerMethodField()
    seleccion = serializers.SerializerMethodField()

    class Meta:
        model = Personaje
        fields = [
            "id", "nombre", "nivel", "estado",
            "raza_nombre", "poder_nombre", "equipamiento_nombre",
            "propietario_username",
            "opciones", "seleccion",
        ]

    def get_opciones(self, obj):
        ops = [obj.opcion_hab1, obj.opcion_hab2, obj.opcion_hab3]
        return [{"id": h.id, "nombre": h.nombre} for h in ops if h]

    def get_seleccion(self, obj):
        sel = [obj.habilidad1, obj.habilidad2]
        return [{"id": h.id, "nombre": h.nombre} for h in sel if h]


# --------- Acciones específicas ---------
class ElegirHabilidadesSerializer(serializers.Serializer):
    habilidades = serializers.ListField(
        child=serializers.IntegerField(), allow_empty=False, min_length=2, max_length=2
    )

    def validate(self, data):
        personaje = self.context["personaje"]
        opciones_ids = {
            h.id for h in [personaje.opcion_hab1, personaje.opcion_hab2, personaje.opcion_hab3] if h
        }
        elegidas = set(map(int, data["habilidades"]))
        if len(elegidas) != 2:
            raise serializers.ValidationError("Debes elegir exactamente 2 habilidades distintas.")
        if not elegidas.issubset(opciones_ids):
            raise serializers.ValidationError("Las habilidades elegidas deben estar dentro de las opciones del personaje.")
        return {"habilidades": list(elegidas)}

    def save(self, **kwargs):
        personaje = self.context["personaje"]
        ids = list(self.validated_data["habilidades"])
        personaje.habilidad1 = Habilidad.objects.get(id=ids[0])
        personaje.habilidad2 = Habilidad.objects.get(id=ids[1])
        personaje.save(update_fields=["habilidad1", "habilidad2"])
        return personaje


class PersonajeOpcionesSerializer(serializers.ModelSerializer):
    """
    GM fija las 3 opciones de habilidades por personaje.
    Acepta enteros o null (porque los FK tienen null=True).
    """
    class Meta:
        model = Personaje
        fields = ["opcion_hab1", "opcion_hab2", "opcion_hab3"]

# --- Registro de usuarios (auth) ---
User = get_user_model()

class RegisterSerializer(drf_serializers.ModelSerializer):
    password = drf_serializers.CharField(write_only=True, min_length=6)
    password2 = drf_serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("username", "email", "password", "password2")

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise drf_serializers.ValidationError("Ese usuario ya existe.")
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email__iexact=value).exists():
            raise drf_serializers.ValidationError("Ese email ya está en uso.")
        return value

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise drf_serializers.ValidationError({"password2": "Las contraseñas no coinciden."})
        return data

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)

        # Forzamos rol por defecto a "JUGADOR" (enum de Usuario)
        if hasattr(user, "rol") and not getattr(user, "rol", None):
            user.rol = User.Rol.JUGADOR  # <-- consistente con models.py
        user.save()
        return user
