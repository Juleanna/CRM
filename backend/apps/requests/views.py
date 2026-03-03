from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.accounts.permissions import HasModulePermission
from .models import Request, RequestResponse
from .serializers import RequestSerializer, RequestResponseSerializer


class RequestViewSet(viewsets.ModelViewSet):
    queryset = Request.objects.select_related(
        'assignee', 'order', 'contract', 'created_by'
    ).prefetch_related('responses', 'responses__created_by', 'participants')
    serializer_class = RequestSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'requests'
    filterset_fields = ['request_type', 'status', 'assignee']
    search_fields = ['title', 'description']

    def perform_create(self, serializer):
        req_obj = serializer.save(created_by=self.request.user)
        from apps.notifications.services import create_notification
        if req_obj.assignee and req_obj.assignee != self.request.user:
            create_notification(
                recipient=req_obj.assignee,
                title='Новий запит',
                message=f'Вам призначено запит "{req_obj.title}"',
                notification_type='request_created',
                link='/requests',
            )

    @action(detail=True, methods=['post'], url_path='add-response')
    def add_response(self, request, pk=None):
        req_obj = self.get_object()
        response_text = request.data.get('response_text', '')
        data = request.data.get('data', {})
        resp = RequestResponse.objects.create(
            request=req_obj,
            response_text=response_text,
            data=data,
            created_by=request.user,
        )
        from apps.notifications.services import create_notification
        if req_obj.created_by and req_obj.created_by != request.user:
            create_notification(
                recipient=req_obj.created_by,
                title='Відповідь на запит',
                message=f'Отримано відповідь на запит "{req_obj.title}"',
                notification_type='request_response',
                link='/requests',
            )
        serializer = RequestResponseSerializer(resp)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
