from django.contrib import admin

from .models import Contract, ProductionPlan, DailyProductionReport, Shipment


@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ('contract_number', 'order', 'status', 'start_date', 'end_date', 'total_quantity')
    list_filter = ('status',)
    search_fields = ('contract_number',)


@admin.register(ProductionPlan)
class ProductionPlanAdmin(admin.ModelAdmin):
    list_display = ('contract', 'department', 'volume')


@admin.register(DailyProductionReport)
class DailyProductionReportAdmin(admin.ModelAdmin):
    list_display = ('contract', 'product_name', 'department', 'quantity', 'date')
    list_filter = ('date', 'department')


@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ('contract', 'product_name', 'quantity', 'ship_date', 'status')
    list_filter = ('status',)
