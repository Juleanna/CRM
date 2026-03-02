from rest_framework import serializers
from .models import User, Department, PermissionGroup, ModulePermission


class ModulePermissionSerializer(serializers.ModelSerializer):
    module_display = serializers.CharField(source='get_module_display', read_only=True)

    class Meta:
        model = ModulePermission
        fields = ['id', 'module', 'module_display', 'can_view', 'can_create', 'can_edit', 'can_delete']


class PermissionGroupListSerializer(serializers.ModelSerializer):
    users_count = serializers.IntegerField(source='users.count', read_only=True)

    class Meta:
        model = PermissionGroup
        fields = ['id', 'name', 'description', 'is_system', 'users_count', 'created_at']


class PermissionGroupDetailSerializer(serializers.ModelSerializer):
    module_permissions = ModulePermissionSerializer(many=True)
    users_count = serializers.IntegerField(source='users.count', read_only=True)

    class Meta:
        model = PermissionGroup
        fields = ['id', 'name', 'description', 'is_system', 'users_count', 'module_permissions', 'created_at', 'updated_at']

    def create(self, validated_data):
        permissions_data = validated_data.pop('module_permissions', [])
        group = PermissionGroup.objects.create(**validated_data)
        provided_modules = set()
        for perm_data in permissions_data:
            ModulePermission.objects.create(group=group, **perm_data)
            provided_modules.add(perm_data['module'])
        for module_choice, _ in ModulePermission.Module.choices:
            if module_choice not in provided_modules:
                ModulePermission.objects.create(group=group, module=module_choice)
        return group

    def update(self, instance, validated_data):
        permissions_data = validated_data.pop('module_permissions', None)
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.save()
        if permissions_data is not None:
            for perm_data in permissions_data:
                ModulePermission.objects.update_or_create(
                    group=instance,
                    module=perm_data['module'],
                    defaults={
                        'can_view': perm_data.get('can_view', False),
                        'can_create': perm_data.get('can_create', False),
                        'can_edit': perm_data.get('can_edit', False),
                        'can_delete': perm_data.get('can_delete', False),
                    }
                )
        return instance


class UserProfileSerializer(serializers.ModelSerializer):
    permission_group_detail = PermissionGroupDetailSerializer(source='permission_group', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'role', 'department', 'avatar', 'permission_group', 'permission_group_detail']
        read_only_fields = ['id', 'username', 'role', 'department', 'permission_group']


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Невірний поточний пароль')
        return value


class DepartmentSerializer(serializers.ModelSerializer):
    users_count = serializers.IntegerField(source='users.count', read_only=True)

    class Meta:
        model = Department
        fields = '__all__'


class UserAdminSerializer(serializers.ModelSerializer):
    permission_group_name = serializers.CharField(source='permission_group.name', read_only=True, default=None)
    department_name = serializers.CharField(source='department.name', read_only=True, default=None)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'role', 'department', 'department_name', 'permission_group', 'permission_group_name', 'is_active', 'date_joined']
        read_only_fields = ['id', 'username', 'date_joined']
