from django.db import models
from django.conf import settings


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        TASK_CREATED = 'task_created', 'Створено нове завдання'
        CHECKLIST_TAGGED = 'checklist_tagged', 'Вас відмічено у чек-лісті'
        ORDER_CREATED = 'order_created', 'Створено нове замовлення'
        PROJECT_CREATED = 'project_created', 'Створено новий проект'
        DAILY_REPORT_REMINDER = 'daily_report_reminder', 'Нагадування про щоденний звіт'
        SHIPMENT_DOCS_REMINDER = 'shipment_docs_reminder', 'Підготуйте документацію для відправки'
        PAYMENT_REMINDER = 'payment_reminder', 'Нагадування про оплату'
        REQUEST_CREATED = 'request_created', 'Створено новий запит'
        REQUEST_RESPONSE = 'request_response', 'Отримано відповідь на запит'
        STATUS_CHANGED = 'status_changed', 'Змінено статус'
        DOCUMENT_ADDED = 'document_added', 'Додано документ'
        TRANSFER_CREATED = 'transfer_created', 'Створено переміщення'
        TRANSFER_ACCEPTED = 'transfer_accepted', 'Переміщення прийнято'
        PURCHASE_CREATED = 'purchase_created', 'Створено закупівлю'

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name='Отримувач', related_name='notifications')
    title = models.CharField('Заголовок', max_length=255)
    message = models.TextField('Повідомлення')
    notification_type = models.CharField('Тип', max_length=30, choices=NotificationType.choices)
    link = models.CharField('Посилання', max_length=500, blank=True)
    is_read = models.BooleanField('Прочитано', default=False)
    created_at = models.DateTimeField('Створено', auto_now_add=True)

    class Meta:
        verbose_name = 'Сповіщення'
        verbose_name_plural = 'Сповіщення'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} -> {self.recipient}'
