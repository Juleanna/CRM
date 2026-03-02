from django.contrib import admin
from .models import Task, Checklist, ChecklistItem


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'assignee', 'status', 'due_date', 'order', 'contract', 'created_at')
    list_filter = ('status',)
    search_fields = ('title',)


@admin.register(Checklist)
class ChecklistAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'contract', 'created_by', 'created_at')


@admin.register(ChecklistItem)
class ChecklistItemAdmin(admin.ModelAdmin):
    list_display = ('text', 'checklist', 'assignee', 'is_done', 'completed_at')
