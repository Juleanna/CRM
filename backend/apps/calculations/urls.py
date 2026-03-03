from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CalculationViewSet

router = DefaultRouter()
router.register('calculations', CalculationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
