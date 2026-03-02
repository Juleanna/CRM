from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, Department, PermissionGroup, ModulePermission


class ModulePermissionInline(admin.TabularInline):
    model = ModulePermission
    extra = 0


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'permission_group', 'department', 'is_active')
    list_filter = ('role', 'permission_group', 'department', 'is_active')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Додаткові дані', {'fields': ('role', 'phone', 'department', 'avatar', 'permission_group')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Додаткові дані', {'fields': ('role', 'phone', 'department', 'permission_group')}),
    )


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    pass


@admin.register(PermissionGroup)
class PermissionGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_system', 'description', 'created_at')
    list_filter = ('is_system',)
    inlines = [ModulePermissionInline]
