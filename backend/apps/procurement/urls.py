from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupplierViewSet, PurchaseViewSet, DeliveryScheduleViewSet

router = DefaultRouter()
router.register('suppliers', SupplierViewSet)
router.register('purchases', PurchaseViewSet)
router.register('delivery-schedules', DeliveryScheduleViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
