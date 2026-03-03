from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, ChecklistViewSet, ChecklistItemViewSet

router = DefaultRouter()
router.register('tasks', TaskViewSet)
router.register('checklists', ChecklistViewSet)
router.register('checklist-items', ChecklistItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
