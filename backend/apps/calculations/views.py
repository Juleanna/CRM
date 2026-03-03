from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from apps.accounts.permissions import HasModulePermission
from .models import Calculation
from .serializers import CalculationSerializer


class CalculationViewSet(viewsets.ModelViewSet):
    queryset = Calculation.objects.select_related(
        'order', 'contract', 'created_by'
    ).prefetch_related('items')
    serializer_class = CalculationSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'orders'
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filterset_fields = ['order', 'contract']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
