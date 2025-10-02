from rest_framework.permissions import BasePermission

class EsGM(BasePermission):
    """
    Permiso personalizado:
    - Solo permite acceso a usuarios con rol GM.
    - Se usa en catálogos y acciones exclusivas del GM.
    """

    def has_permission(self, request, view):
        return getattr(request.user, "rol", None) == "GM"

class EsPropietarioOGM(BasePermission):
    """
    Permiso personalizado:
    - Permite acceso si el usuario es GM o propietario del objeto.
    - Protege endpoints de Personaje para que solo el dueño o el GM los gestionen.
    """

    def has_object_permission(self, request, view, obj):
        usuario = request.user
        return (getattr(usuario, "rol", None) == "GM") or (obj.propietario_id == usuario.id)
