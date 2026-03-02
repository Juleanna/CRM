from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class Document(models.Model):
    title = models.CharField('Назва', max_length=255)
    description = models.TextField('Опис', blank=True)
    file = models.FileField('Файл', upload_to='documents/')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, verbose_name='Тип обʼєкта')
    object_id = models.PositiveIntegerField('ID обʼєкта')
    content_object = GenericForeignKey('content_type', 'object_id')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name='Завантажив')
    uploaded_at = models.DateTimeField('Завантажено', auto_now_add=True)

    class Meta:
        verbose_name = 'Документ'
        verbose_name_plural = 'Документи'
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
        ]

    def __str__(self):
        return self.title


class Affiliation(models.Model):
    """Довідник приналежностей для технічних специфікацій"""
    name = models.CharField('Назва', max_length=255, unique=True)
    description = models.TextField('Опис', blank=True)
    created_at = models.DateTimeField('Створено', auto_now_add=True)

    class Meta:
        verbose_name = 'Приналежність'
        verbose_name_plural = 'Приналежності'
        ordering = ['name']

    def __str__(self):
        return self.name


class TechnicalSpecification(models.Model):
    """Реєстр технічних специфікацій"""
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Чернетка'
        ACTIVE = 'active', 'Діючий'
        EXPIRED = 'expired', 'Недіючий'
        CANCELLED = 'cancelled', 'Скасований'

    title = models.CharField('Назва', max_length=255)
    number = models.CharField('Номер документа', max_length=100, blank=True)
    affiliation = models.ForeignKey(Affiliation, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Приналежність', related_name='specifications')
    description = models.TextField('Опис', blank=True)
    effective_date = models.DateField('Дата введення в дію', null=True, blank=True)
    expiry_date = models.DateField('Дата закінчення дії', null=True, blank=True)
    status = models.CharField('Статус', max_length=20, choices=Status.choices, default=Status.DRAFT)
    file = models.FileField('Документ', upload_to='tech_specs/', blank=True, null=True)
    notes = models.TextField('Примітки', blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name='Створив', related_name='created_tech_specs')
    created_at = models.DateTimeField('Створено', auto_now_add=True)
    updated_at = models.DateTimeField('Оновлено', auto_now=True)

    class Meta:
        verbose_name = 'Технічна специфікація'
        verbose_name_plural = 'Технічні специфікації'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} ({self.number})'
