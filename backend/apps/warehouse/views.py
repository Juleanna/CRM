import csv

from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from apps.accounts.permissions import HasModulePermission
from .models import Warehouse, FabricType, FabricClass, Size, Material, Pattern, MaterialTransfer, ProductTransfer, Return
from .serializers import (
    WarehouseSerializer, FabricTypeSerializer, FabricClassSerializer, SizeSerializer,
    MaterialSerializer, PatternSerializer, MaterialTransferSerializer,
    ProductTransferSerializer, ReturnSerializer,
)


class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'warehouse'


class FabricTypeViewSet(viewsets.ModelViewSet):
    queryset = FabricType.objects.all()
    serializer_class = FabricTypeSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'directories'


class FabricClassViewSet(viewsets.ModelViewSet):
    queryset = FabricClass.objects.all()
    serializer_class = FabricClassSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'directories'


class SizeViewSet(viewsets.ModelViewSet):
    queryset = Size.objects.all()
    serializer_class = SizeSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'directories'


class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.select_related('warehouse', 'supplier').order_by('-created_at')
    serializer_class = MaterialSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'warehouse'
    filterset_fields = ['warehouse', 'category', 'is_available', 'material_type']
    search_fields = ['name', 'article', 'color']
    ordering_fields = ['name', 'article', 'created_at']

    @action(detail=False, methods=['get'])
    def export(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="materials.csv"'
        response.write('\ufeff')  # BOM for Excel

        writer = csv.writer(response)
        writer.writerow(['Артикул', 'Назва', 'Тип', 'Категорія', 'Колір', 'Кількість', 'Одиниці', 'Ціна', 'Склад'])

        materials = self.get_queryset()
        for material in materials:
            writer.writerow([
                material.article, material.name, material.material_type,
                material.category, material.color, material.quantity,
                material.get_unit_display(), material.price_per_unit,
                material.warehouse.name,
            ])
        return response


class PatternViewSet(viewsets.ModelViewSet):
    queryset = Pattern.objects.order_by('-created_at')
    serializer_class = PatternSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'warehouse'
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filterset_fields = ['pattern_type', 'category']
    search_fields = ['name', 'article']
    ordering_fields = ['name', 'article', 'created_at']


class MaterialTransferViewSet(viewsets.ModelViewSet):
    queryset = MaterialTransfer.objects.select_related(
        'from_warehouse', 'to_warehouse', 'material', 'created_by', 'accepted_by'
    ).all()
    serializer_class = MaterialTransferSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'warehouse'
    filterset_fields = ['from_warehouse', 'to_warehouse', 'is_accepted']

    def perform_create(self, serializer):
        transfer = serializer.save(created_by=self.request.user)
        from apps.notifications.services import create_notification
        if transfer.to_warehouse.manager and transfer.to_warehouse.manager != self.request.user:
            create_notification(
                recipient=transfer.to_warehouse.manager,
                title='Нове переміщення матеріалу',
                message=f'Створено переміщення "{transfer.material}" на склад "{transfer.to_warehouse}"',
                notification_type='transfer_created',
                link='/warehouse',
            )

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        transfer = self.get_object()
        transfer.is_accepted = True
        transfer.accepted_by = request.user
        transfer.save()
        from apps.notifications.services import create_notification
        if transfer.created_by and transfer.created_by != request.user:
            create_notification(
                recipient=transfer.created_by,
                title='Переміщення прийнято',
                message=f'Переміщення "{transfer.material}" на склад "{transfer.to_warehouse}" прийнято',
                notification_type='transfer_accepted',
                link='/warehouse',
            )
        serializer = self.get_serializer(transfer)
        return Response(serializer.data)


class ProductTransferViewSet(viewsets.ModelViewSet):
    queryset = ProductTransfer.objects.select_related(
        'from_warehouse', 'to_warehouse', 'contract', 'created_by', 'accepted_by'
    ).all()
    serializer_class = ProductTransferSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'warehouse'
    filterset_fields = ['contract', 'is_accepted']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        transfer = self.get_object()
        transfer.is_accepted = True
        transfer.accepted_by = request.user
        transfer.save()
        serializer = self.get_serializer(transfer)
        return Response(serializer.data)


class ReturnViewSet(viewsets.ModelViewSet):
    queryset = Return.objects.select_related('material', 'created_by').all()
    serializer_class = ReturnSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'warehouse'
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filterset_fields = ['return_type']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
