from rest_framework import serializers
from .models import FinishedProduct, ArchivedProject


class FinishedProductSerializer(serializers.ModelSerializer):
    contract_number = serializers.CharField(source='contract.contract_number', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = FinishedProduct
        fields = '__all__'
        read_only_fields = ['created_by']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class ArchivedProjectSerializer(serializers.ModelSerializer):
    contract_number = serializers.CharField(source='contract.contract_number', read_only=True)

    class Meta:
        model = ArchivedProject
        fields = '__all__'
