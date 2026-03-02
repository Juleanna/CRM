from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProfileView, ChangePasswordView, DepartmentViewSet, PermissionGroupViewSet, UserViewSet

router = DefaultRouter()
router.register('departments', DepartmentViewSet)
router.register('permission-groups', PermissionGroupViewSet)
router.register('users', UserViewSet)

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('', include(router.urls)),
]
