from django.db import models
from django.conf import settings


class Customer(models.Model):
    class CooperationForm(models.TextChoices):
        TENDER = 'tender', 'Тендер'
        DIRECT_ORDER = 'direct_order', 'Пряме замовлення'
        AGREEMENT = 'agreement', 'Угода'

    class CustomerType(models.TextChoices):
        CUSTOMER = 'customer', 'Замовник'
        SUPPLIER = 'supplier', 'Постачальник'
        CONTRACTOR = 'contractor', 'Підрядник'
        OWN_COMPANY = 'own_company', 'Наша фірма'
        RECIPIENT = 'recipient', 'Одержувач'

    company_name = models.CharField('Назва підприємства', max_length=255)
    cooperation_forms = models.JSONField('Форми співпраці', default=list, blank=True)
    customer_types = models.JSONField('Типи контрагента', default=list, blank=True)
    address = models.TextField('Адреса', blank=True)
    phone = models.CharField('Телефон', max_length=50, blank=True)
    email = models.EmailField('Email', blank=True)
    contact_persons = models.JSONField('Контактні особи', default=list, blank=True)
    cooperation_history = models.TextField('Історія співпраці', blank=True)

    class Meta:
        verbose_name = 'Замовник'
        verbose_name_plural = 'Замовники'

    def __str__(self):
        return self.company_name


class Order(models.Model):
    class Status(models.TextChoices):
        NEW = 'new', 'Нове'
        DOCUMENT_COLLECTION = 'document_collection', 'Збір документації'
        BIDDING = 'bidding', 'В процесі торгів'
        APPROVED = 'approved', 'Погоджено'
        WON = 'won', 'Перемога'
        LOST = 'lost', 'Програш'
        FROZEN = 'frozen', 'Заморожене'
        REJECTED = 'rejected', 'Відхилено'

    class Priority(models.TextChoices):
        HIGH = 'high', 'Важливий'
        MEDIUM = 'medium', 'Середній'
        LOW = 'low', 'Мінімальний'

    title = models.CharField('Назва', max_length=255)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, verbose_name='Замовник', related_name='orders')
    source = models.CharField('Джерело', max_length=255, blank=True)
    description = models.TextField('Опис', blank=True)
    quantity = models.PositiveIntegerField('Кількість одиниць', default=0)
    payment_amount = models.DecimalField('Сума оплати', max_digits=12, decimal_places=2, null=True, blank=True)
    notes = models.TextField('Примітки', blank=True)
    deadline = models.DateField('Кінцевий термін подачі', null=True, blank=True)
    execution_period = models.CharField('Терміни виконання', max_length=255, blank=True)
    priority = models.CharField('Пріоритет', max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField('Статус', max_length=30, choices=Status.choices, default=Status.NEW)
    proposed_price = models.DecimalField('Пропонована вартість', max_digits=12, decimal_places=2, null=True, blank=True)
    proposed_term = models.CharField('Пропонований термін', max_length=255, blank=True)
    rejection_reason = models.TextField('Причина відхилення', blank=True)
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, verbose_name='Учасники', related_name='participating_orders', blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name='Створив', related_name='created_orders')
    created_at = models.DateTimeField('Створено', auto_now_add=True)
    updated_at = models.DateTimeField('Оновлено', auto_now=True)

    class Meta:
        verbose_name = 'Замовлення'
        verbose_name_plural = 'Замовлення'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} ({self.get_status_display()})'
