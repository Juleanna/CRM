from rest_framework import serializers
from .models import Warehouse, FabricType, FabricClass, Size


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
