from django.urls import path
from .views import DashboardStatsView, AnalyticsOverviewView

urlpatterns = [
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('overview/', AnalyticsOverviewView.as_view(), name='analytics-overview'),
]
