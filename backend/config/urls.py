from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT Auth
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # API endpoints
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/proposals/', include('apps.proposals.urls')),
    path('api/contracts/', include('apps.contracts.urls')),
    path('api/warehouse/', include('apps.warehouse.urls')),
    path('api/procurement/', include('apps.procurement.urls')),
    path('api/production/', include('apps.production.urls')),
    path('api/calculations/', include('apps.calculations.urls')),
    path('api/tasks/', include('apps.tasks.urls')),
    path('api/requests/', include('apps.requests.urls')),
    path('api/communications/', include('apps.communications.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/documents/', include('apps.documents.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
