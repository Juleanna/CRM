from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ContractViewSet,
    ProductionPlanViewSet,
    DailyProductionReportViewSet,
    ShipmentViewSet,
)

router = DefaultRouter()
router.register('contracts', ContractViewSet)
router.register('production-plans', ProductionPlanViewSet)
router.register('daily-reports', DailyProductionReportViewSet)
router.register('shipments', ShipmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
