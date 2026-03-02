from django.db import models
from django.conf import settings


class Proposal(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Чернетка'
        READY = 'ready', 'Готова'
        SENT = 'sent', 'Надіслана'
        ACCEPTED = 'accepted', 'Прийнята'
        REJECTED = 'rejected', 'Відхилена'

    order = models.OneToOneField('orders.Order', on_delete=models.CASCADE, verbose_name='Замовлення', related_name='proposal')
    status = models.CharField('Статус', max_length=20, choices=Status.choices, default=Status.DRAFT)
    price = models.DecimalField('Ціна пропозиції', max_digits=12, decimal_places=2, null=True, blank=True)
    sent_at = models.DateTimeField('Дата відправки', null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name='Створив')
    created_at = models.DateTimeField('Створено', auto_now_add=True)
    updated_at = models.DateTimeField('Оновлено', auto_now=True)

    class Meta:
        verbose_name = 'Пропозиція'
        verbose_name_plural = 'Пропозиції'

    def __str__(self):
        return f'Пропозиція до {self.order.title}'
