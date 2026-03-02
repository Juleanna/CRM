from rest_framework.permissions import BasePermission


class HasModulePermission(BasePermission):
    """
    Checks module-level permissions based on user's PermissionGroup.
    Set `module = 'orders'` on the ViewSet class to use.

    Action mapping:
        list/retrieve -> can_view
        create -> can_create
        update/partial_update -> can_edit
        destroy -> can_delete
    """
    ACTION_MAP = {
        'list': 'can_view',
        'retrieve': 'can_view',
        'create': 'can_create',
        'update': 'can_edit',
        'partial_update': 'can_edit',
        'destroy': 'can_delete',
    }

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        if user.role == 'superadmin':
            return True

        module = getattr(view, 'module', None)
        if module is None:
            return True

        action = getattr(view, 'action', None)
        perm_field = self.ACTION_MAP.get(action, 'can_view')

        if not user.permission_group:
            return False

        try:
            mp = user.permission_group.module_permissions.get(module=module)
            return getattr(mp, perm_field, False)
        except Exception:
            return False
