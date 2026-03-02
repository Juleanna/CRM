from django.db import models
from django.conf import settings


class Task(models.Model):
    class Status(models.TextChoices):
        NEW = 'new', 'Нове'
        IN_PROGRESS = 'in_progress', 'В роботі'
        COMPLETED = 'completed', 'Виконане'

    title = models.CharField('Заголовок', max_length=255)
    description = models.TextField('Опис', blank=True)
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Виконавець', related_name='assigned_tasks')
    due_date = models.DateField('Дедлайн', null=True, blank=True)
    status = models.CharField('Статус', max_length=20, choices=Status.choices, default=Status.NEW)
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, null=True, blank=True, verbose_name='Замовлення', related_name='tasks')
    contract = models.ForeignKey('contracts.Contract', on_delete=models.CASCADE, null=True, blank=True, verbose_name='Договір', related_name='tasks')
    comments = models.TextField('Коментарі', blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name='Створив', related_name='created_tasks')
    created_at = models.DateTimeField('Створено', auto_now_add=True)
    updated_at = models.DateTimeField('Оновлено', auto_now=True)

    class Meta:
        verbose_name = 'Завдання'
        verbose_name_plural = 'Завдання'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Checklist(models.Model):
    title = models.CharField('Назва', max_length=255)
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, null=True, blank=True, verbose_name='Замовлення', related_name='checklists')
    contract = models.ForeignKey('contracts.Contract', on_delete=models.CASCADE, null=True, blank=True, verbose_name='Договір', related_name='checklists')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name='Створив', related_name='created_checklists')
    created_at = models.DateTimeField('Створено', auto_now_add=True)
    updated_at = models.DateTimeField('Оновлено', auto_now=True)

    class Meta:
        verbose_name = 'Чек-ліст'
        verbose_name_plural = 'Чек-лісти'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class ChecklistItem(models.Model):
    checklist = models.ForeignKey(Checklist, on_delete=models.CASCADE, verbose_name='Чек-ліст', related_name='items')
    text = models.CharField('Текст', max_length=500)
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Виконавець', related_name='checklist_items')
    is_done = models.BooleanField('Виконано', default=False)
    completed_at = models.DateTimeField('Дата виконання', null=True, blank=True)

    class Meta:
        verbose_name = 'Пункт чек-лісту'
        verbose_name_plural = 'Пункти чек-лісту'

    def __str__(self):
        status = '✓' if self.is_done else '○'
        return f'{status} {self.text}'
