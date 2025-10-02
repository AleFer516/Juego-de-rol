from django.contrib import admin
from .models import Usuario, Raza, Habilidad, Poder, Equipamiento, Personaje
from .models import AuditLog

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "rol", "is_superuser", "is_staff")
    list_filter = ("rol", "is_staff", "is_superuser")
    search_fields = ("username", "email")

@admin.register(Raza)
class RazaAdmin(admin.ModelAdmin):
    search_fields = ("nombre",)

@admin.register(Habilidad)
class HabilidadAdmin(admin.ModelAdmin):
    search_fields = ("nombre",)

@admin.register(Poder)
class PoderAdmin(admin.ModelAdmin):
    search_fields = ("nombre",)

@admin.register(Equipamiento)
class EquipamientoAdmin(admin.ModelAdmin):
    search_fields = ("nombre",)

@admin.register(Personaje)
class PersonajeAdmin(admin.ModelAdmin):
    list_display = ("nombre", "propietario", "raza", "estado", "nivel")
    list_filter = ("estado", "raza")
    search_fields = ("nombre", "propietario__username")
    filter_horizontal = ("habilidades",)

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("fecha", "usuario", "accion", "detalle")
    list_filter = ("accion", "fecha")
    search_fields = ("usuario__username", "detalle")