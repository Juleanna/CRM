from rest_framework import serializers
from .models import Request, RequestResponse


class RequestResponseSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True, default='')

    class Meta:
        model = RequestResponse
        fields = '__all__'


class RequestSerializer(serializers.ModelSerializer):
    responses = RequestResponseSerializer(many=True, read_only=True)
    assignee_name = serializers.CharField(source='assignee.get_full_name', read_only=True, default='')
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True, default='')
    order_title = serializers.CharField(source='order.title', read_only=True, default='')
    contract_number = serializers.CharField(source='contract.contract_number', read_only=True, default='')

    class Meta:
        model = Request
        fields = '__all__'
        read_only_fields = ['created_by']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
