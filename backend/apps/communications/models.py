from django.db import models
from django.conf import settings


class Chat(models.Model):
    class ChatType(models.TextChoices):
        GROUP = 'group', 'Груповий'
        INDIVIDUAL = 'individual', 'Індивідуальний'

    name = models.CharField('Назва', max_length=255, blank=True)
    chat_type = models.CharField('Тип', max_length=20, choices=ChatType.choices)
    contract = models.ForeignKey('contracts.Contract', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Договір', related_name='chats')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name='Створив', related_name='created_chats')
    created_at = models.DateTimeField('Створено', auto_now_add=True)

    class Meta:
        verbose_name = 'Чат'
        verbose_name_plural = 'Чати'

    def __str__(self):
        return self.name or f'Чат #{self.pk}'


class ChatParticipant(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, verbose_name='Чат', related_name='participants')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name='Користувач')
    joined_at = models.DateTimeField('Приєднався', auto_now_add=True)

    class Meta:
        verbose_name = 'Учасник чату'
        verbose_name_plural = 'Учасники чату'
        unique_together = ('chat', 'user')

    def __str__(self):
        return f'{self.user} - {self.chat}'


class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, verbose_name='Чат', related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name='Відправник', related_name='sent_messages')
    text = models.TextField('Текст')
    is_edited = models.BooleanField('Відредаговано', default=False)
    created_at = models.DateTimeField('Створено', auto_now_add=True)
    updated_at = models.DateTimeField('Оновлено', auto_now=True)

    class Meta:
        verbose_name = 'Повідомлення'
        verbose_name_plural = 'Повідомлення'
        ordering = ['created_at']

    def __str__(self):
        return f'{self.sender}: {self.text[:50]}'


class MessageAttachment(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, verbose_name='Повідомлення', related_name='attachments')
    file = models.FileField('Файл', upload_to='chat_attachments/')
    file_name = models.CharField('Назва файлу', max_length=255)
    uploaded_at = models.DateTimeField('Завантажено', auto_now_add=True)

    class Meta:
        verbose_name = 'Вкладення'
        verbose_name_plural = 'Вкладення'

    def __str__(self):
        return self.file_name
