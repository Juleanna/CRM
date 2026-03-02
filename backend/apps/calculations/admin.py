from django.contrib import admin
from .models import Calculation, CalculationItem


@admin.register(Calculation)
class CalculationAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'contract', 'version', 'created_by', 'created_at')
    list_filter = ('version',)


@admin.register(CalculationItem)
class CalculationItemAdmin(admin.ModelAdmin):
    list_display = ('material_name', 'calculation', 'unit', 'consumption_per_unit', 'total_per_unit', 'total_per_batch')
