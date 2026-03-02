from django.db import models
from django.conf import settings


class FinishedProduct(models.Model):
    class Category(models.TextChoices):
        JACKET = 'jacket', 'Куртка'
        TSHIRT = 'tshirt', 'Футболка'
        PANTS = 'pants', 'Штани'
        SUIT = 'suit', 'Костюм'
        OTHER = 'other', 'Інше'

    class ProductType(models.TextChoices):
        MALE = 'male', 'Чоловіче'
        FEMALE = 'female', 'Жіноче'
        UNISEX = 'unisex', 'Унісекс'

    contract = models.ForeignKey('contracts.Contract', on_delete=models.CASCADE, verbose_name='Договір', related_name='finished_products')
    name = models.CharField('Назва виробу', max_length=255)
    category = models.CharField('Категорія', max_length=20, choices=Category.choices, default=Category.OTHER)
    product_type = models.CharField('Тип', max_length=20, choices=ProductType.choices, default=ProductType.UNISEX)
    price_per_unit = models.DecimalField('Вартість 1 виробу', max_digits=10, decimal_places=2, default=0)
    currency = models.CharField('Валюта', max_length=10, default='UAH')
    production_date = models.DateField('Дата виготовлення')
    quantity = models.PositiveIntegerField('Кількість виготовлених')
    department = models.ForeignKey('accounts.Department', on_delete=models.CASCADE, verbose_name='Виробничий підрозділ', related_name='finished_products')
    transferred_to_main = models.BooleanField('Передано на головний склад', default=False)
    transfer_date = models.DateField('Дата переміщення', null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name='Створив')
    created_at = models.DateTimeField('Створено', auto_now_add=True)

    class Meta:
        verbose_name = 'Готовий виріб'
        verbose_name_plural = 'Готові вироби'
        ordering = ['-production_date']

    def __str__(self):
        return f'{self.name} - {self.quantity} шт. ({self.production_date})'


class ArchivedProject(models.Model):
    class Status(models.TextChoices):
        COMPLETED = 'completed', 'Завершений успішно'
        CANCELLED = 'cancelled', 'Скасований'
        FROZEN = 'frozen', 'Заморожений'

    contract = models.OneToOneField('contracts.Contract', on_delete=models.CASCADE, verbose_name='Договір', related_name='archived_project')
    status = models.CharField('Статус', max_length=20, choices=Status.choices)
    duration_days = models.PositiveIntegerField('Тривалість (днів)', default=0)
    total_cost = models.DecimalField('Загальна вартість', max_digits=14, decimal_places=2, default=0)
    total_produced = models.PositiveIntegerField('Загальна кількість виробів', default=0)
    archived_at = models.DateTimeField('Архівовано', auto_now_add=True)

    class Meta:
        verbose_name = 'Архівований проект'
        verbose_name_plural = 'Архівовані проекти'
        ordering = ['-archived_at']

    def __str__(self):
        return f'{self.contract} - {self.get_status_display()}'
