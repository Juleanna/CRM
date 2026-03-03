from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WarehouseViewSet, FabricTypeViewSet, FabricClassViewSet, SizeViewSet,
    MaterialViewSet, PatternViewSet, MaterialTransferViewSet,
    ProductTransferViewSet, ReturnViewSet,
)

router = DefaultRouter()
router.register('warehouses', WarehouseViewSet)
router.register('fabric-types', FabricTypeViewSet)
router.register('fabric-classes', FabricClassViewSet)
router.register('sizes', SizeViewSet)
router.register('materials', MaterialViewSet)
router.register('patterns', PatternViewSet)
router.register('material-transfers', MaterialTransferViewSet)
router.register('product-transfers', ProductTransferViewSet)
router.register('returns', ReturnViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
