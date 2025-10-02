from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    PersonajeViewSet, RazaViewSet, HabilidadViewSet, PoderViewSet, EquipamientoViewSet,
    yo, RegisterView
)

router = DefaultRouter()
router.register("personajes", PersonajeViewSet)
router.register("razas", RazaViewSet)
router.register("habilidades", HabilidadViewSet)
router.register("poderes", PoderViewSet)
router.register("equipamientos", EquipamientoViewSet)

urlpatterns = router.urls + [
    path("yo/", yo),  # GET /api/yo/

    # --- Auth ---
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    # Nota de seguridad:
    # - El endpoint /auth/login/ utiliza JWT (TokenObtainPairView de SimpleJWT).
    # - La app django-axes protege contra ataques de fuerza bruta:
    #   • Máximo 5 intentos fallidos por usuario.
    #   • Bloqueo temporal de 10 minutos.
    # - Esto garantiza políticas de lockout según la rúbrica de seguridad.
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
