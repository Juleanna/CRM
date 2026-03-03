from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.accounts.permissions import HasModulePermission
from .models import Task, Checklist, ChecklistItem
from .serializers import TaskSerializer, ChecklistSerializer, ChecklistItemSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.select_related('assignee', 'order', 'contract', 'created_by')
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'tasks'
    filterset_fields = ['status', 'assignee', 'order', 'contract']
    search_fields = ['title', 'description']

    def perform_create(self, serializer):
        task = serializer.save(created_by=self.request.user)
        from apps.notifications.services import create_notification
        if task.assignee and task.assignee != self.request.user:
            create_notification(
                recipient=task.assignee,
                title='Нове завдання',
                message=f'Вам призначено завдання "{task.title}"',
                notification_type='task_created',
                link='/tasks',
            )


class ChecklistViewSet(viewsets.ModelViewSet):
    queryset = Checklist.objects.select_related(
        'order', 'contract', 'created_by'
    ).prefetch_related('items', 'items__assignee')
    serializer_class = ChecklistSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'tasks'
    filterset_fields = ['order', 'contract']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ChecklistItemViewSet(viewsets.ModelViewSet):
    queryset = ChecklistItem.objects.select_related('checklist', 'assignee')
    serializer_class = ChecklistItemSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'tasks'

    @action(detail=True, methods=['post'])
    def toggle(self, request, pk=None):
        item = self.get_object()
        item.is_done = not item.is_done
        item.completed_at = timezone.now() if item.is_done else None
        item.save()
        serializer = self.get_serializer(item)
        return Response(serializer.data)
