from rest_framework.permissions import BasePermission


class IsCreatorRole(BasePermission):
    message = 'Only creators can create or manage sessions.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'creator'
        )


class IsSessionOwner(BasePermission):
    message = 'You can only manage sessions that you created.'

    def has_object_permission(self, request, view, obj):
        return bool(request.user and request.user.is_authenticated and obj.creator_id == request.user.id)


class IsUserRole(BasePermission):
    message = 'Only users can create and view bookings.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'user'
        )
