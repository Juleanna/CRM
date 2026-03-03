from rest_framework import serializers
from .models import Calculation, CalculationItem


class CalculationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalculationItem
        fields = '__all__'


class CalculationSerializer(serializers.ModelSerializer):
    items = CalculationItemSerializer(many=True, read_only=True)
    order_title = serializers.CharField(source='order.title', default='', read_only=True)
    contract_number = serializers.CharField(source='contract.contract_number', default='', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', default='', read_only=True)

    class Meta:
        model = Calculation
        fields = '__all__'
        read_only_fields = ['created_by']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
