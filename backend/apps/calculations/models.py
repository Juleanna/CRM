from django.db import models
from django.conf import settings


class Calculation(models.Model):
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, verbose_name='Замовлення', related_name='calculations', null=True, blank=True)
    contract = models.ForeignKey('contracts.Contract', on_delete=models.CASCADE, verbose_name='Договір', related_name='calculations', null=True, blank=True)
    file = models.FileField('Файл калькуляції', upload_to='calculations/', blank=True, null=True)
    version = models.PositiveIntegerField('Версія', default=1)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name='Створив')
    created_at = models.DateTimeField('Створено', auto_now_add=True)
    updated_at = models.DateTimeField('Оновлено', auto_now=True)

    class Meta:
        verbose_name = 'Калькуляція'
        verbose_name_plural = 'Калькуляції'
        ordering = ['-created_at']

    def __str__(self):
        target = self.contract or self.order
        return f'Калькуляція v{self.version} - {target}'


class CalculationItem(models.Model):
    calculation = models.ForeignKey(Calculation, on_delete=models.CASCADE, verbose_name='Калькуляція', related_name='items')
    material_name = models.CharField('Назва матеріалу', max_length=255)
    color = models.CharField('Колір', max_length=100, blank=True)
    unit = models.CharField('Одиниці виміру', max_length=20, blank=True)
    consumption_per_unit = models.DecimalField('Розхід на одиницю', max_digits=10, decimal_places=4, default=0)
    multiplication_coefficient = models.DecimalField('Коефіцієнт збільшення', max_digits=6, decimal_places=4, default=1)
    total_per_unit = models.DecimalField('Сума на одиницю', max_digits=10, decimal_places=2, default=0)
    total_per_batch = models.DecimalField('Сума на партію', max_digits=12, decimal_places=2, default=0)
    price_with_vat_unit = models.DecimalField('Ціна за одиницю з ПДВ', max_digits=10, decimal_places=2, default=0)
    price_with_vat_batch = models.DecimalField('Ціна за партію з ПДВ', max_digits=12, decimal_places=2, default=0)
    shipment_date = models.DateField('Дата відгрузки', null=True, blank=True)
    comments = models.TextField('Коментарі', blank=True)

    class Meta:
        verbose_name = 'Позиція калькуляції'
        verbose_name_plural = 'Позиції калькуляції'

    def __str__(self):
        return f'{self.material_name} - {self.calculation}'
