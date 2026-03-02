from django.db import migrations


ROLE_GROUPS = {
    'superadmin': {
        'name': 'Суперадмін',
        'description': 'Повний доступ до всіх модулів',
        'permissions': {m: {'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': True}
                        for m in ['dashboard', 'orders', 'contracts', 'warehouse', 'procurement',
                                  'production', 'tasks', 'requests', 'chat', 'notifications',
                                  'analytics', 'users', 'directories', 'tech_specs']},
    },
    'admin': {
        'name': 'Адмін',
        'description': 'Повний доступ до всіх модулів',
        'permissions': {m: {'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': True}
                        for m in ['dashboard', 'orders', 'contracts', 'warehouse', 'procurement',
                                  'production', 'tasks', 'requests', 'chat', 'notifications',
                                  'analytics', 'users', 'directories', 'tech_specs']},
    },
    'tender_manager': {
        'name': 'Тендерний менеджер',
        'description': 'Управління замовленнями, договорами та запитами',
        'permissions': {
            'dashboard': {'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'orders': {'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': True},
            'contracts': {'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': True},
            'warehouse': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'procurement': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'production': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'tasks': {'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': False},
            'requests': {'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': True},
            'chat': {'can_view': True, 'can_create': True, 'can_edit': False, 'can_delete': False},
            'notifications': {'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'analytics': {'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'users': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'directories': {'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'tech_specs': {'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': False},
        },
    },
    'technologist': {
        'name': 'Технолог',
        'description': 'Виробництво, тех. специфікації, завдання',
        'permissions': {
            'dashboard': {'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'orders': {'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'contracts': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'warehouse': {'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'procurement': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'production': {'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': True},
            'tasks': {'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': False},
            'requests': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'chat': {'can_view': True, 'can_create': True, 'can_edit': False, 'can_delete': False},
            'notifications': {'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'analytics': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'users': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'directories': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'tech_specs': {'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': True},
        },
    },
    'warehouse_manager': {
        'name': 'Завскладу',
        'description': 'Управління складом, переміщеннями, запитами',
        'permissions': {
            'dashboard': {'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'orders': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'contracts': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'warehouse': {'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': True},
            'procurement': {'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'production': {'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'tasks': {'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': False},
            'requests': {'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': True},
            'chat': {'can_view': True, 'can_create': True, 'can_edit': False, 'can_delete': False},
            'notifications': {'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'analytics': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'users': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'directories': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'tech_specs': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
        },
    },
    'procurement_manager': {
        'name': 'Менеджер з закупівель',
        'description': 'Управління закупівлями, постачальниками, запитами',
        'permissions': {
            'dashboard': {'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'orders': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'contracts': {'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'warehouse': {'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'procurement': {'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': True},
            'production': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'tasks': {'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': False},
            'requests': {'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': True},
            'chat': {'can_view': True, 'can_create': True, 'can_edit': False, 'can_delete': False},
            'notifications': {'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'analytics': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'users': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'directories': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'tech_specs': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
        },
    },
    'accountant': {
        'name': 'Бухгалтер',
        'description': 'Аналітика, договори, замовлення (перегляд)',
        'permissions': {
            'dashboard': {'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'orders': {'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'contracts': {'can_view': True, 'can_create': False, 'can_edit': True, 'can_delete': False},
            'warehouse': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'procurement': {'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'production': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'tasks': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'requests': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'chat': {'can_view': True, 'can_create': True, 'can_edit': False, 'can_delete': False},
            'notifications': {'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'analytics': {'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': False},
            'users': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'directories': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
            'tech_specs': {'can_view': False, 'can_create': False, 'can_edit': False, 'can_delete': False},
        },
    },
}


def create_default_groups(apps, schema_editor):
    PermissionGroup = apps.get_model('accounts', 'PermissionGroup')
    ModulePermission = apps.get_model('accounts', 'ModulePermission')
    User = apps.get_model('accounts', 'User')

    role_to_group = {}
    for role_key, config in ROLE_GROUPS.items():
        group, _ = PermissionGroup.objects.get_or_create(
            name=config['name'],
            defaults={'description': config['description'], 'is_system': True},
        )
        role_to_group[role_key] = group

        for module, perms in config['permissions'].items():
            ModulePermission.objects.get_or_create(
                group=group,
                module=module,
                defaults=perms,
            )

    for user in User.objects.all():
        if user.role in role_to_group:
            user.permission_group = role_to_group[user.role]
            user.save(update_fields=['permission_group'])


def reverse_migration(apps, schema_editor):
    PermissionGroup = apps.get_model('accounts', 'PermissionGroup')
    PermissionGroup.objects.filter(is_system=True).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_permissiongroup_user_permission_group_and_more'),
    ]

    operations = [
        migrations.RunPython(create_default_groups, reverse_migration),
    ]
