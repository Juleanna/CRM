from rest_framework import serializers
from .models import Warehouse, FabricType, FabricClass, Size, Material, Pattern, MaterialTransfer, ProductTransfer, Return


class WarehouseSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.get_full_name', read_only=True, default='')

    class Meta:
        model = Warehouse
        fields = '__all__'


class FabricTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FabricType
        fields = '__all__'


class FabricClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = FabricClass
        fields = '__all__'


class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = '__all__'


class MaterialSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True, default='')
    supplier_name = serializers.CharField(source='supplier.company_name', read_only=True, default='')

    class Meta:
        model = Material
        fields = '__all__'


class PatternSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pattern
        fields = '__all__'


class MaterialTransferSerializer(serializers.ModelSerializer):
    from_warehouse_name = serializers.CharField(source='from_warehouse.name', read_only=True, default='')
    to_warehouse_name = serializers.CharField(source='to_warehouse.name', read_only=True, default='')
    material_name = serializers.CharField(source='material.name', read_only=True, default='')
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True, default='')
    accepted_by_name = serializers.CharField(source='accepted_by.get_full_name', read_only=True, default='')

    class Meta:
        model = MaterialTransfer
        fields = '__all__'


class ProductTransferSerializer(serializers.ModelSerializer):
    from_warehouse_name = serializers.CharField(source='from_warehouse.name', read_only=True, default='')
    to_warehouse_name = serializers.CharField(source='to_warehouse.name', read_only=True, default='')
    contract_number = serializers.CharField(source='contract.contract_number', read_only=True, default='')
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True, default='')
    accepted_by_name = serializers.CharField(source='accepted_by.get_full_name', read_only=True, default='')

    class Meta:
        model = ProductTransfer
        fields = '__all__'


class ReturnSerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(source='material.name', read_only=True, default='')
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True, default='')

    class Meta:
        model = Return
        fields = '__all__'
