from django.contrib import admin

from .models import (
    Warehouse, Material, Pattern, MaterialTransfer, ProductTransfer, Return,
    FabricType, FabricClass, Size,
)


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ('name', 'warehouse_type', 'address', 'manager')


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ('article', 'name', 'category', 'color', 'quantity', 'unit', 'price_per_unit', 'warehouse')
    list_filter = ('category', 'warehouse')
    search_fields = ('article', 'name')


@admin.register(Pattern)
class PatternAdmin(admin.ModelAdmin):
    list_display = ('name', 'article', 'category', 'pattern_type', 'size_range')
    search_fields = ('name', 'article')


@admin.register(MaterialTransfer)
class MaterialTransferAdmin(admin.ModelAdmin):
    list_display = ('material', 'from_warehouse', 'to_warehouse', 'quantity', 'date', 'is_accepted')


@admin.register(ProductTransfer)
class ProductTransferAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'from_warehouse', 'to_warehouse', 'quantity', 'date', 'is_accepted')


@admin.register(Return)
class ReturnAdmin(admin.ModelAdmin):
    list_display = ('return_type', 'material', 'product_name', 'quantity', 'created_at')


@admin.register(FabricType)
class FabricTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name',)


@admin.register(FabricClass)
class FabricClassAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name',)


@admin.register(Size)
class SizeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'sort_order', 'created_at')
    search_fields = ('name',)
