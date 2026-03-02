from django.db import models
from django.conf import settings


class Supplier(models.Model):
    class Category(models.TextChoices):
        MANUFACTURER = 'manufacturer', 'Виробник'
        RETAILER = 'retailer', 'Рітейлер'
        BOTH = 'both', 'Виробник і рітейлер'

    company_name = models.CharField('Назва підприємства', max_length=255)
    category = models.CharField('Категорія', max_length=20, choices=Category.choices)
    details = models.TextField('Деталі підприємства', blank=True)
    location = models.CharField('Локація', max_length=255, blank=True)
    work_schedule = models.CharField('Графік роботи', max_length=255, blank=True)
    phone = models.CharField('Телефон', max_length=50, blank=True)
    email = models.EmailField('Email', blank=True)
    contact_person = models.CharField('Контактна особа', max_length=255, blank=True)
    contact_person_phone = models.CharField('Телефон контактної особи', max_length=50, blank=True)
    catalog_url = models.URLField('Каталог (посилання)', blank=True)
    comments = models.TextField('Коментарі', blank=True)
    created_at = models.DateTimeField('Створено', auto_now_add=True)
    updated_at = models.DateTimeField('Оновлено', auto_now=True)

    class Meta:
        verbose_name = 'Постачальник'
        verbose_name_plural = 'Постачальники'

    def __str__(self):
        return self.company_name


class Purchase(models.Model):
    class Status(models.TextChoices):
        NEW = 'new', 'Нове'
        CONFIRMED = 'confirmed', 'Підтверджено'
        IN_TRANSIT = 'in_transit', 'В транзиті'
        RECEIVED = 'received', 'Отримано'
        DELAYED = 'delayed', 'Затримується'

    class PaymentStatus(models.TextChoices):
        NOT_PAID = 'not_paid', 'Не оплачено'
        PARTIALLY_PAID = 'partially_paid', 'Частково оплачено'
        PAID = 'paid', 'Оплачено'

    contract = models.ForeignKey('contracts.Contract', on_delete=models.CASCADE, verbose_name='Договір', related_name='purchases')
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, verbose_name='Постачальник', related_name='purchases')
    status = models.CharField('Статус', max_length=20, choices=Status.choices, default=Status.NEW)
    total_amount = models.DecimalField('Загальна сума', max_digits=12, decimal_places=2, default=0)
    delivery_cost = models.DecimalField('Вартість доставки', max_digits=10, decimal_places=2, default=0)
    payment_status = models.CharField('Статус оплати', max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.NOT_PAID)
    expected_delivery_date = models.DateField('Прогнозована дата доставки', null=True, blank=True)
    actual_delivery_date = models.DateField('Фактична дата доставки', null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name='Створив', related_name='created_purchases')
    created_at = models.DateTimeField('Створено', auto_now_add=True)
    updated_at = models.DateTimeField('Оновлено', auto_now=True)

    class Meta:
        verbose_name = 'Закупівля'
        verbose_name_plural = 'Закупівлі'
        ordering = ['-created_at']

    def __str__(self):
        return f'Закупівля #{self.pk} - {self.supplier} ({self.get_status_display()})'


class PurchaseItem(models.Model):
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE, verbose_name='Закупівля', related_name='items')
    material_name = models.CharField('Назва матеріалу', max_length=255)
    material_type = models.CharField('Тип', max_length=100, blank=True)
    category = models.CharField('Категорія', max_length=100, blank=True)
    article = models.CharField('Артикул', max_length=100, blank=True)
    unit = models.CharField('Одиниці виміру', max_length=20, blank=True)
    quantity = models.DecimalField('Кількість', max_digits=10, decimal_places=2)
    price_per_unit = models.DecimalField('Ціна за одиницю', max_digits=10, decimal_places=2)
    total_price = models.DecimalField('Загальна ціна', max_digits=12, decimal_places=2)

    class Meta:
        verbose_name = 'Позиція закупівлі'
        verbose_name_plural = 'Позиції закупівлі'

    def __str__(self):
        return f'{self.material_name} ({self.article})'


class DeliverySchedule(models.Model):
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE, verbose_name='Закупівля', related_name='delivery_schedules', null=True, blank=True)
    contract = models.ForeignKey('contracts.Contract', on_delete=models.CASCADE, verbose_name='Договір', related_name='delivery_schedules')
    article = models.CharField('Артикул', max_length=100, blank=True)
    material_name = models.CharField('Назва матеріалу', max_length=255)
    material_type = models.CharField('Тип', max_length=100, blank=True)
    category = models.CharField('Категорія', max_length=100, blank=True)
    color = models.CharField('Колір', max_length=100, blank=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Постачальник')
    ttn = models.CharField('ТТН', max_length=255, blank=True)
    expected_date = models.DateField('Планована дата поставки')
    actual_date = models.DateField('Фактична дата поставки', null=True, blank=True)
    status = models.CharField('Статус', max_length=20, choices=Purchase.Status.choices, default=Purchase.Status.NEW)

    class Meta:
        verbose_name = 'Графік поставки'
        verbose_name_plural = 'Графік поставок'
        ordering = ['expected_date']

    def __str__(self):
        return f'{self.material_name} - {self.expected_date}'
