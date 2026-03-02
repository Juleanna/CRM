from django.contrib import admin
from .models import Request, RequestParticipant, RequestResponse


@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display = ('title', 'request_type', 'status', 'assignee', 'order', 'deadline', 'created_at')
    list_filter = ('request_type', 'status')
    search_fields = ('title',)


@admin.register(RequestParticipant)
class RequestParticipantAdmin(admin.ModelAdmin):
    list_display = ('request', 'user')


@admin.register(RequestResponse)
class RequestResponseAdmin(admin.ModelAdmin):
    list_display = ('request', 'created_by', 'created_at')
