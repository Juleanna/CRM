from django.db import models
from django.conf import settings


class Contract(models.Model):
    class Status(models.TextChoices):
        PLANNING = 'planning', 'Планування'
        PRODUCTION = 'production', 'Виробництво'
        COMPLETED = 'completed', 'Завершений'
        FROZEN = 'frozen', 'Заморожений / скасований'

    order = models.OneToOneField('orders.Order', on_delete=models.CASCADE, verbose_name='Замовлення', related_name='contract')
    contract_number = models.CharField('Номер договору', max_length=100, unique=True)
    status = models.CharField('Статус', max_length=20, choices=Status.choices, default=Status.PLANNING)
    start_date = models.DateField('Дата початку', null=True, blank=True)
    end_date = models.DateField('Кінцевий термін', null=True, blank=True)
    total_quantity = models.PositiveIntegerField('Загальна кількість виробів', default=0)
    specification = models.TextField('Специфікація', blank=True)
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, verbose_name='Учасники', related_name='participating_contracts', blank=True)
    created_at = models.DateTimeField('Створено', auto_now_add=True)
    updated_at = models.DateTimeField('Оновлено', auto_now=True)

    class Meta:
        verbose_name = 'Актуальний договір'
        verbose_name_plural = 'Актуальні договори'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.contract_number} ({self.get_status_display()})'


class ProductionPlan(models.Model):
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, verbose_name='Договір', related_name='production_plans')
    department = models.ForeignKey('accounts.Department', on_delete=models.CASCADE, verbose_name='Підрозділ', related_name='production_plans')
    volume = models.PositiveIntegerField('Обсяг виробів', default=0)
    schedule_file = models.FileField('Файл графіку', upload_to='production_plans/', blank=True, null=True)
    created_at = models.DateTimeField('Створено', auto_now_add=True)

    class Meta:
        verbose_name = 'План виробництва'
        verbose_name_plural = 'Плани виробництва'

    def __str__(self):
        return f'План: {self.contract} - {self.department}'


class DailyProductionReport(models.Model):
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, verbose_name='Договір', related_name='daily_reports')
    product_name = models.CharField('Назва виробу', max_length=255)
    department = models.ForeignKey('accounts.Department', on_delete=models.CASCADE, verbose_name='Підрозділ', related_name='daily_reports')
    quantity = models.PositiveIntegerField('Кількість виробів')
    date = models.DateField('Дата')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name='Створив')
    created_at = models.DateTimeField('Створено', auto_now_add=True)

    class Meta:
        verbose_name = 'Щоденний звіт виробництва'
        verbose_name_plural = 'Щоденні звіти виробництва'
        ordering = ['-date']

    def __str__(self):
        return f'{self.contract} - {self.date} - {self.quantity} шт.'


class Shipment(models.Model):
    class Status(models.TextChoices):
        NEW = 'new', 'Нова'
        IN_TRANSIT = 'in_transit', 'В транзиті'
        PAID = 'paid', 'Оплачено'
        COMPLETED = 'completed', 'Завершено'

    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, verbose_name='Договір', related_name='shipments')
    product_name = models.CharField('Назва виробу', max_length=255)
    quantity = models.PositiveIntegerField('Кількість')
    ship_date = models.DateField('Дата відправки')
    status = models.CharField('Статус', max_length=20, choices=Status.choices, default=Status.NEW)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name='Створив')
    created_at = models.DateTimeField('Створено', auto_now_add=True)
    updated_at = models.DateTimeField('Оновлено', auto_now=True)

    class Meta:
        verbose_name = 'Відправка'
        verbose_name_plural = 'Відправки'
        ordering = ['-ship_date']

    def __str__(self):
        return f'Відправка {self.contract} - {self.ship_date}'
