from django.contrib import admin
from .models import Document, Affiliation, TechnicalSpecification


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'content_type', 'object_id', 'uploaded_by', 'uploaded_at')
    search_fields = ('title',)


@admin.register(Affiliation)
class AffiliationAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name',)


@admin.register(TechnicalSpecification)
class TechnicalSpecificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'number', 'affiliation', 'status', 'effective_date', 'expiry_date', 'created_by')
    list_filter = ('status', 'affiliation')
    search_fields = ('title', 'number')
