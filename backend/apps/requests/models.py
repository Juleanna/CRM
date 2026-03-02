from django.db import models
from django.conf import settings


class Request(models.Model):
    class RequestType(models.TextChoices):
        WAREHOUSE = 'warehouse', 'Запит на склад'
        PATTERNS = 'patterns', 'Запит на лекала'
        CALCULATION = 'calculation', 'Запит на прорахунок'
        PROCUREMENT = 'procurement', 'Запит на закупівлю'

    class Status(models.TextChoices):
        OPEN = 'open', 'Відкритий'
        CLOSED = 'closed', 'Закритий'

    title = models.CharField('Назва', max_length=255)
    request_type = models.CharField('Тип запиту', max_length=20, choices=RequestType.choices)
    description = models.TextField('Опис', blank=True)
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, verbose_name='Замовлення', related_name='requests', null=True, blank=True)
    contract = models.ForeignKey('contracts.Contract', on_delete=models.CASCADE, verbose_name='Договір', related_name='requests', null=True, blank=True)
    deadline = models.DateField('Термін виконання', null=True, blank=True)
    status = models.CharField('Статус', max_length=10, choices=Status.choices, default=Status.OPEN)
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Виконавець', related_name='assigned_requests')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name='Створив', related_name='created_requests')
    created_at = models.DateTimeField('Створено', auto_now_add=True)
    updated_at = models.DateTimeField('Оновлено', auto_now=True)

    class Meta:
        verbose_name = 'Запит'
        verbose_name_plural = 'Запити'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} ({self.get_request_type_display()})'


class RequestParticipant(models.Model):
    request = models.ForeignKey(Request, on_delete=models.CASCADE, verbose_name='Запит', related_name='participants')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name='Користувач')

    class Meta:
        verbose_name = 'Учасник запиту'
        verbose_name_plural = 'Учасники запиту'
        unique_together = ('request', 'user')

    def __str__(self):
        return f'{self.user} - {self.request}'


class RequestResponse(models.Model):
    request = models.ForeignKey(Request, on_delete=models.CASCADE, verbose_name='Запит', related_name='responses')
    response_text = models.TextField('Текст відповіді', blank=True)
    data = models.JSONField('Дані', default=dict, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name='Створив')
    created_at = models.DateTimeField('Створено', auto_now_add=True)

    class Meta:
        verbose_name = 'Відповідь на запит'
        verbose_name_plural = 'Відповіді на запити'
        ordering = ['-created_at']

    def __str__(self):
        return f'Відповідь на {self.request}'
