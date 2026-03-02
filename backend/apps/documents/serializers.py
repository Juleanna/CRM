from rest_framework import serializers
from .models import Affiliation, TechnicalSpecification


class AffiliationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Affiliation
        fields = '__all__'


class TechnicalSpecificationSerializer(serializers.ModelSerializer):
    affiliation_name = serializers.CharField(source='affiliation.name', read_only=True, default='')
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True, default='')

    class Meta:
        model = TechnicalSpecification
        fields = '__all__'
        read_only_fields = ['created_by']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
