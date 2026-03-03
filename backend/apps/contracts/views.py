from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from apps.accounts.permissions import HasModulePermission
from .models import Contract, ProductionPlan, DailyProductionReport, Shipment
from .serializers import (
    ContractSerializer,
    ProductionPlanSerializer,
    DailyProductionReportSerializer,
    ShipmentSerializer,
)


class ContractViewSet(viewsets.ModelViewSet):
    queryset = Contract.objects.select_related('order')
    serializer_class = ContractSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'contracts'
    filterset_fields = ['status']
    search_fields = ['contract_number', 'order__title']
    ordering_fields = ['created_at', 'start_date', 'end_date']


class ProductionPlanViewSet(viewsets.ModelViewSet):
    queryset = ProductionPlan.objects.select_related('contract', 'department')
    serializer_class = ProductionPlanSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'contracts'
    filterset_fields = ['contract']
    parser_classes = [MultiPartParser, FormParser, JSONParser]


class DailyProductionReportViewSet(viewsets.ModelViewSet):
    queryset = DailyProductionReport.objects.select_related('contract', 'department', 'created_by')
    serializer_class = DailyProductionReportSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'contracts'
    filterset_fields = ['contract', 'department', 'date']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ShipmentViewSet(viewsets.ModelViewSet):
    queryset = Shipment.objects.select_related('contract', 'created_by')
    serializer_class = ShipmentSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'contracts'
    filterset_fields = ['contract', 'status']
