from django.contrib import admin
from .models import Chat, ChatParticipant, Message, MessageAttachment


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ('name', 'chat_type', 'contract', 'created_by', 'created_at')
    list_filter = ('chat_type',)


@admin.register(ChatParticipant)
class ChatParticipantAdmin(admin.ModelAdmin):
    list_display = ('chat', 'user', 'joined_at')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('chat', 'sender', 'text_preview', 'created_at', 'is_edited')

    @admin.display(description='Текст')
    def text_preview(self, obj):
        return obj.text[:50]


@admin.register(MessageAttachment)
class MessageAttachmentAdmin(admin.ModelAdmin):
    list_display = ('message', 'file_name', 'uploaded_at')
