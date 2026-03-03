from rest_framework import serializers
from .models import Chat, ChatParticipant, Message, MessageAttachment


class MessageAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageAttachment
        fields = '__all__'


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', default='', read_only=True)
    attachments = MessageAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Message
        fields = '__all__'


class ChatParticipantSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', default='', read_only=True)

    class Meta:
        model = ChatParticipant
        fields = ['id', 'user', 'user_name', 'joined_at']


class ChatListSerializer(serializers.ModelSerializer):
    contract_number = serializers.CharField(source='contract.contract_number', default='', read_only=True)
    participants_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ['id', 'name', 'chat_type', 'contract', 'contract_number', 'created_by', 'participants_count', 'last_message', 'unread_count']

    def get_participants_count(self, obj):
        return obj.participants.count()

    def get_last_message(self, obj):
        last = obj.messages.order_by('-created_at').first()
        if last:
            return {
                'text': last.text,
                'sender_name': last.sender.get_full_name() if last.sender else '',
                'created_at': last.created_at,
            }
        return None

    def get_unread_count(self, obj):
        return 0


class ChatDetailSerializer(serializers.ModelSerializer):
    participants = ChatParticipantSerializer(many=True, read_only=True)

    class Meta:
        model = Chat
        fields = '__all__'
