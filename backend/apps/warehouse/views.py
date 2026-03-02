from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Warehouse, FabricType, FabricClass, Size
from .serializers import WarehouseSerializer, FabricTypeSerializer, FabricClassSerializer, SizeSerializer


class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [IsAuthenticated]


class FabricTypeViewSet(viewsets.ModelViewSet):
    queryset = FabricType.objects.all()
    serializer_class = FabricTypeSerializer
    permission_classes = [IsAuthenticated]


class FabricClassViewSet(viewsets.ModelViewSet):
    queryset = FabricClass.objects.all()
    serializer_class = FabricClassSerializer
    permission_classes = [IsAuthenticated]


class SizeViewSet(viewsets.ModelViewSet):
    queryset = Size.objects.all()
    serializer_class = SizeSerializer
    permission_classes = [IsAuthenticated]
