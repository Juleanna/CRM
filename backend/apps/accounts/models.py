from django.contrib.auth.models import AbstractUser
from django.db import models


class Department(models.Model):
    class DepartmentType(models.TextChoices):
        MAIN_WAREHOUSE = 'main_warehouse', 'Головний склад'
        PRODUCTION_UNIT = 'production_unit', 'Виробничий підрозділ'
        OFFICE = 'office', 'Офіс'

    name = models.CharField('Назва', max_length=255)
    address = models.TextField('Адреса', blank=True)
    contact_info = models.TextField('Контактна інформація', blank=True)
    department_type = models.CharField('Тип підрозділу', max_length=30, choices=DepartmentType.choices)

    class Meta:
        verbose_name = 'Підрозділ'
        verbose_name_plural = 'Підрозділи'

    def __str__(self):
        return self.name


class PermissionGroup(models.Model):
    name = models.CharField('Назва', max_length=100, unique=True)
    description = models.TextField('Опис', blank=True)
    is_system = models.BooleanField('Системна група', default=False)
    created_at = models.DateTimeField('Створено', auto_now_add=True)
    updated_at = models.DateTimeField('Оновлено', auto_now=True)

    class Meta:
        verbose_name = 'Група дозволів'
        verbose_name_plural = 'Групи дозволів'
        ordering = ['name']

    def __str__(self):
        return self.name


class ModulePermission(models.Model):
    class Module(models.TextChoices):
        DASHBOARD = 'dashboard', 'Дашборд'
        ORDERS = 'orders', 'Замовлення'
        CONTRACTS = 'contracts', 'Договори'
        WAREHOUSE = 'warehouse', 'Склад'
        PROCUREMENT = 'procurement', 'Закупівлі'
        PRODUCTION = 'production', 'Виробництво'
        TASKS = 'tasks', 'Завдання'
        REQUESTS = 'requests', 'Запити'
        CHAT = 'chat', 'Чат'
        NOTIFICATIONS = 'notifications', 'Сповіщення'
        ANALYTICS = 'analytics', 'Аналітика'
        USERS = 'users', 'Користувачі'
        DIRECTORIES = 'directories', 'Довідники'
        TECH_SPECS = 'tech_specs', 'Тех. специфікації'

    group = models.ForeignKey(PermissionGroup, on_delete=models.CASCADE, related_name='module_permissions', verbose_name='Група')
    module = models.CharField('Модуль', max_length=30, choices=Module.choices)
    can_view = models.BooleanField('Перегляд', default=False)
    can_create = models.BooleanField('Створення', default=False)
    can_edit = models.BooleanField('Редагування', default=False)
    can_delete = models.BooleanField('Видалення', default=False)

    class Meta:
        verbose_name = 'Дозвіл модуля'
        verbose_name_plural = 'Дозволи модулів'
        unique_together = [('group', 'module')]
        ordering = ['module']

    def __str__(self):
        return f'{self.group.name} - {self.get_module_display()}'


class User(AbstractUser):
    class Role(models.TextChoices):
        SUPERADMIN = 'superadmin', 'Суперадмін'
        ADMIN = 'admin', 'Адмін'
        TENDER_MANAGER = 'tender_manager', 'Тендерний менеджер'
        TECHNOLOGIST = 'technologist', 'Технолог'
        WAREHOUSE_MANAGER = 'warehouse_manager', 'Завскладу'
        PROCUREMENT_MANAGER = 'procurement_manager', 'Менеджер з закупівель'
        ACCOUNTANT = 'accountant', 'Бухгалтер'

    email = models.EmailField('Email', unique=True)
    phone = models.CharField('Телефон', max_length=20, blank=True)
    role = models.CharField('Роль', max_length=30, choices=Role.choices, default=Role.ADMIN)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Підрозділ', related_name='users')
    avatar = models.ImageField('Аватар', upload_to='avatars/', blank=True, null=True)
    permission_group = models.ForeignKey(PermissionGroup, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Група дозволів', related_name='users')

    class Meta:
        verbose_name = 'Користувач'
        verbose_name_plural = 'Користувачі'

    def __str__(self):
        return f'{self.get_full_name()} ({self.get_role_display()})'
