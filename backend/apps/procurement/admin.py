from django.contrib import admin
from .models import Supplier, Purchase, PurchaseItem, DeliverySchedule


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'category', 'location', 'phone', 'email', 'contact_person')


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'contract', 'supplier', 'status', 'payment_status', 'total_amount', 'expected_delivery_date')
    list_filter = ('status', 'payment_status')


@admin.register(PurchaseItem)
class PurchaseItemAdmin(admin.ModelAdmin):
    list_display = ('purchase', 'material_name', 'article', 'quantity', 'price_per_unit', 'total_price')


@admin.register(DeliverySchedule)
class DeliveryScheduleAdmin(admin.ModelAdmin):
    list_display = ('material_name', 'contract', 'supplier', 'expected_date', 'actual_date', 'status')
    list_filter = ('status',)
