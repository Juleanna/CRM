from django.contrib import admin
from .models import FinishedProduct, ArchivedProject


@admin.register(FinishedProduct)
class FinishedProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'contract', 'category', 'quantity', 'production_date', 'department', 'transferred_to_main')
    list_filter = ('category', 'product_type', 'transferred_to_main')


@admin.register(ArchivedProject)
class ArchivedProjectAdmin(admin.ModelAdmin):
    list_display = ('contract', 'status', 'duration_days', 'total_cost', 'total_produced', 'archived_at')
    list_filter = ('status',)
