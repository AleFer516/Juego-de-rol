from django.shortcuts import get_object_or_404

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer
from .models import AuditLog

from .permissions import EsGM, EsPropietarioOGM
from .models import Personaje, Raza, Habilidad, Poder, Equipamiento
from .serializers import (
    PersonajeSerializer,
    PersonajeActualizarSerializer,
    PersonajeListaSerializer,
    PersonajeOpcionesSerializer,
    ElegirHabilidadesSerializer,
    RazaSerializer,
    HabilidadSerializer,
    PoderSerializer,
    EquipamientoSerializer,
)


class PersonajeViewSet(viewsets.ModelViewSet):
    
    """
    ViewSet para CRUD de Personajes y acciones específicas.
    Seguridad:
    - Permisos globales: IsAuthenticated + EsPropietarioOGM
    - GM puede ver/editar todos los personajes.
    - Jugador solo ve y modifica sus propios personajes.
    - Endpoints adicionales tienen validación extra (no elegir muerto, etc.).


    - list/retrieve:
        GM: ve todos
        Jugador: ve solo los suyos
    - /disponibles/: lista el pool (sin propietario) para que el jugador elija
    - /{id}/elegir/ (POST): jugador toma un personaje del pool
    - /{id}/set-opciones/ (PATCH): GM define 3 opciones de habilidades
    - /{id}/elegir-habilidades/ (POST): jugador elige 2 entre las 3 opciones
    - /{id}/subir_nivel/ (POST), /{id}/cambiar_estado/ (POST), /{id}/liberar/ (POST): acciones GM
    """
    permission_classes = [IsAuthenticated, EsPropietarioOGM]
    queryset = (
        Personaje.objects
        .select_related("raza", "poder", "equipamiento")
    )

    # ---------- Serializers por acción ----------
    def get_serializer_class(self):
        usuario = self.request.user
        if self.action in ["list", "retrieve", "disponibles"]:
            return PersonajeListaSerializer
        if self.action == "set_opciones":
            return PersonajeOpcionesSerializer
        if self.action == "elegir_habilidades":
            return ElegirHabilidadesSerializer
        if self.action in ["update", "partial_update"] and getattr(usuario, "rol", None) != "GM":
            return PersonajeActualizarSerializer
        return PersonajeSerializer

    # ---------- Queryset por rol ----------
    def get_queryset(self):
        usuario = self.request.user
        if getattr(usuario, "rol", None) == "GM":
            return super().get_queryset()
        # Jugador: por defecto lista SOLO sus personajes
        return super().get_queryset().filter(propietario=usuario)

    # ---------- Update seguro ----------
    def perform_update(self, serializer):
        personaje = self.get_object()
        if hasattr(personaje, "puede_editar") and not personaje.puede_editar():
            raise ValidationError({"detalle": "No editable: el personaje está muerto."})
        serializer.save()

    # ---------- Pool de disponibles (sin filtro por propietario) ----------
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def disponibles(self, request):
        """Lista de personajes sin propietario (pool)."""
        qs = (
            Personaje.objects
            .select_related("raza", "poder", "equipamiento")
            .filter(propietario__isnull=True)
        )
        page = self.paginate_queryset(qs)
        ser = self.get_serializer(page or qs, many=True)
        return self.get_paginated_response(ser.data) if page is not None else Response(ser.data)

    # ---------- Jugador elige (toma) un personaje del pool ----------
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def elegir(self, request, pk=None):
        """Jugador elige un personaje disponible."""
        # ¡OJO! No usar self.get_object() porque el jugador aún no es propietario
        pj = get_object_or_404(
            Personaje.objects.select_related("raza", "poder", "equipamiento"),
            pk=pk
        )
        if pj.propietario_id is not None:
            raise ValidationError({"detalle": "Este personaje ya tiene propietario."})
        if getattr(pj, "Estado", None) and pj.estado == pj.Estado.MUERTO:
            raise ValidationError({"detalle": "No puedes elegir un personaje muerto."})

        pj.propietario = request.user
        pj.save(update_fields=["propietario"])
        return Response({"ok": True, "personaje": pj.id, "propietario": request.user.username})

    # ---------- GM define 3 opciones de habilidades ----------
    @action(detail=True, methods=["patch"], permission_classes=[IsAuthenticated, EsGM], url_path="set-opciones")
    def set_opciones(self, request, pk=None):
        pj = self.get_object()
        ser = self.get_serializer(pj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(PersonajeListaSerializer(pj).data, status=status.HTTP_200_OK)

    # ---------- Jugador elige 2 habilidades entre las 3 opciones ----------
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated], url_path="elegir-habilidades")
    def elegir_habilidades(self, request, pk=None):
        pj = self.get_object()  # aquí sí: ya debe ser propietario
        if pj.propietario_id != request.user.id:
            raise PermissionDenied("Solo el propietario del personaje puede elegir sus habilidades.")
        if getattr(pj, "Estado", None) and pj.estado == pj.Estado.MUERTO:
            raise ValidationError({"detalle": "No puedes modificar habilidades de un personaje muerto."})

        ser = self.get_serializer(data=request.data, context={"personaje": pj})
        ser.is_valid(raise_exception=True)
        pj = ser.save()  # fija habilidad1 y habilidad2
        return Response(PersonajeListaSerializer(pj).data, status=status.HTTP_200_OK)

    # ---------- Acciones GM existentes ----------
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, EsGM])
    def subir_nivel(self, request, pk=None):
        pj = self.get_object()
        if getattr(pj, "Estado", None) and pj.estado == pj.Estado.MUERTO:
            return Response({"detalle": "No puede subir de nivel si está muerto."}, status=400)
        pj.nivel = (pj.nivel or 0) + 1
        pj.save(update_fields=["nivel"])

        AuditLog.objects.create(
            usuario=request.user,
            accion="SUBIR_NIVEL",
            detalle=f"Subió a nivel {pj.nivel} el personaje {pj.nombre}"
    )
        return Response({"ok": True, "nivel": pj.nivel})

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, EsGM])
    def cambiar_estado(self, request, pk=None):
        pj = self.get_object()
        nuevo_estado = request.data.get("estado")
        validos = [v for v, _ in getattr(pj, "Estado").choices] if getattr(pj, "Estado", None) else []
        if nuevo_estado not in validos:
            return Response({"detalle": "Estado inválido."}, status=400)
        pj.estado = nuevo_estado
        pj.save(update_fields=["estado"])

        AuditLog.objects.create(
            usuario=request.user,
            accion="CAMBIAR_ESTADO",
            detalle=f"Nuevo estado={pj.estado} para personaje {pj.nombre}"
        )

        return Response({"ok": True, "estado": pj.estado})

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, EsGM])
    def liberar(self, request, pk=None):
        """Quita el propietario; el personaje vuelve al pool (disponible para jugadores)."""
        pj = self.get_object()
        pj.propietario = None
        pj.save(update_fields=["propietario"])

        AuditLog.objects.create(
        usuario=request.user,
        accion="LIBERAR_PERSONAJE",
        detalle=f"Liberó personaje {pj.nombre}"
)

        return Response({"ok": True})


# --------- Catálogos (solo GM) ----------
class RazaViewSet(viewsets.ModelViewSet):
  queryset = Raza.objects.all()
  serializer_class = RazaSerializer
  permission_classes = [IsAuthenticated, EsGM]

class HabilidadViewSet(viewsets.ModelViewSet):
  queryset = Habilidad.objects.all()
  serializer_class = HabilidadSerializer
  permission_classes = [IsAuthenticated, EsGM]

class PoderViewSet(viewsets.ModelViewSet):
  queryset = Poder.objects.all()
  serializer_class = PoderSerializer
  permission_classes = [IsAuthenticated, EsGM]

class EquipamientoViewSet(viewsets.ModelViewSet):
  queryset = Equipamiento.objects.all()
  serializer_class = EquipamientoSerializer
  permission_classes = [IsAuthenticated, EsGM]


# === Rol del usuario autenticado ===
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def yo(request):
    u = request.user
    return Response({"id": u.id, "usuario": u.username, "rol": getattr(u, "rol", None)})

# --- Registro de usuarios (auth) ---
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()

        # Emitimos tokens para autologin
        refresh = RefreshToken.for_user(user)
        data = {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "rol": getattr(user, "rol", None),
            },
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
        }
        return Response(data, status=status.HTTP_201_CREATED)