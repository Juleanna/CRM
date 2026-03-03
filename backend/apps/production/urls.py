from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FinishedProductViewSet, ArchivedProjectViewSet

router = DefaultRouter()
router.register('finished-products', FinishedProductViewSet)
router.register('archived-projects', ArchivedProjectViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
