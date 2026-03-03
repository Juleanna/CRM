from rest_framework import serializers
from .models import Supplier, Purchase, PurchaseItem, DeliverySchedule


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'


class PurchaseItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseItem
        fields = '__all__'


class PurchaseSerializer(serializers.ModelSerializer):
    items = PurchaseItemSerializer(many=True, read_only=True)
    supplier_name = serializers.CharField(source='supplier.company_name', read_only=True, default='')
    contract_number = serializers.CharField(source='contract.contract_number', read_only=True, default='')
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True, default='')

    class Meta:
        model = Purchase
        fields = '__all__'

    def create(self, validated_data):
        items_data = self.context['request'].data.get('items', [])
        purchase = Purchase.objects.create(**validated_data)
        for item_data in items_data:
            item_data.pop('purchase', None)
            PurchaseItem.objects.create(purchase=purchase, **item_data)
        return purchase


class DeliveryScheduleSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.company_name', read_only=True, default='')
    contract_number = serializers.CharField(source='contract.contract_number', read_only=True, default='')

    class Meta:
        model = DeliverySchedule
        fields = '__all__'
