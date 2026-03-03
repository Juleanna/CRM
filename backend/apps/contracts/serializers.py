from rest_framework import serializers
from django.db.models import Sum
from .models import Contract, ProductionPlan, DailyProductionReport, Shipment


class ContractSerializer(serializers.ModelSerializer):
    order_title = serializers.CharField(source='order.title', read_only=True)
    produced_count = serializers.SerializerMethodField()

    class Meta:
        model = Contract
        fields = '__all__'

    def get_produced_count(self, obj):
        result = obj.finished_products.aggregate(total=Sum('quantity'))
        return result['total'] or 0


class ProductionPlanSerializer(serializers.ModelSerializer):
    contract_number = serializers.CharField(source='contract.contract_number', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = ProductionPlan
        fields = '__all__'


class DailyProductionReportSerializer(serializers.ModelSerializer):
    contract_number = serializers.CharField(source='contract.contract_number', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = DailyProductionReport
        fields = '__all__'


class ShipmentSerializer(serializers.ModelSerializer):
    contract_number = serializers.CharField(source='contract.contract_number', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Shipment
        fields = '__all__'
        read_only_fields = ['created_by']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
