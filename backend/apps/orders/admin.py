from django.contrib import admin

from .models import Customer, Order


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'cooperation_form', 'phone', 'email')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('title', 'customer', 'status', 'priority', 'deadline', 'created_at')
    list_filter = ('status', 'priority')
    search_fields = ('title', 'customer__company_name')
