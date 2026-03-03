from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from apps.accounts.permissions import HasModulePermission
from .models import Chat, ChatParticipant, Message
from .serializers import (
    ChatListSerializer,
    ChatDetailSerializer,
    MessageSerializer,
)


class MessagePagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100


class ChatViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'chat'

    def get_queryset(self):
        return (
            Chat.objects
            .filter(participants__user=self.request.user)
            .select_related('contract', 'created_by')
            .prefetch_related('participants', 'participants__user')
            .distinct()
        )

    def get_serializer_class(self):
        if self.action == 'list':
            return ChatListSerializer
        return ChatDetailSerializer

    def perform_create(self, serializer):
        chat = serializer.save(created_by=self.request.user)
        ChatParticipant.objects.get_or_create(chat=chat, user=self.request.user)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        chat = self.get_object()
        messages = Message.objects.filter(chat=chat).select_related('sender').prefetch_related('attachments').order_by('created_at')
        paginator = MessagePagination()
        page = paginator.paginate_queryset(messages, request)
        serializer = MessageSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @action(detail=True, methods=['post'], url_path='send-message')
    def send_message(self, request, pk=None):
        chat = self.get_object()
        text = request.data.get('text', '').strip()
        if not text:
            return Response({'detail': 'Text is required.'}, status=status.HTTP_400_BAD_REQUEST)
        message = Message.objects.create(
            chat=chat,
            sender=request.user,
            text=text,
        )
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
