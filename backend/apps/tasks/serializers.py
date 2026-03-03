from rest_framework import serializers
from .models import Task, Checklist, ChecklistItem


class TaskSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source='assignee.get_full_name', read_only=True, default='')
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True, default='')
    order_title = serializers.CharField(source='order.title', read_only=True, default='')
    contract_number = serializers.CharField(source='contract.contract_number', read_only=True, default='')

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['created_by']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class ChecklistItemSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source='assignee.get_full_name', read_only=True, default='')

    class Meta:
        model = ChecklistItem
        fields = '__all__'


class ChecklistSerializer(serializers.ModelSerializer):
    items = ChecklistItemSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True, default='')
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Checklist
        fields = '__all__'
        read_only_fields = ['created_by']

    def get_progress(self, obj):
        items = obj.items.all()
        total = items.count()
        done = items.filter(is_done=True).count()
        return {'done': done, 'total': total}

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
