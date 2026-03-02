from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WarehouseViewSet, FabricTypeViewSet, FabricClassViewSet, SizeViewSet

router = DefaultRouter()
router.register('warehouses', WarehouseViewSet)
router.register('fabric-types', FabricTypeViewSet)
router.register('fabric-classes', FabricClassViewSet)
router.register('sizes', SizeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
