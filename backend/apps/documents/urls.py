from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AffiliationViewSet, TechnicalSpecificationViewSet

router = DefaultRouter()
router.register('affiliations', AffiliationViewSet)
router.register('tech-specs', TechnicalSpecificationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
