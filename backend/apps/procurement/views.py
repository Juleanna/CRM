import csv

from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import HasModulePermission
from .models import Purchase, DeliverySchedule
from .serializers import PurchaseSerializer, DeliveryScheduleSerializer


class PurchaseViewSet(viewsets.ModelViewSet):
    queryset = Purchase.objects.select_related(
        'contract', 'supplier', 'created_by'
    ).prefetch_related('items').all()
    serializer_class = PurchaseSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'procurement'
    filterset_fields = ['status', 'payment_status', 'supplier', 'contract']
    search_fields = ['supplier__company_name']

    def perform_create(self, serializer):
        purchase = serializer.save(created_by=self.request.user)
        from apps.notifications.services import create_notification
        create_notification(
            recipient=self.request.user,
            title='Нова закупівля',
            message=f'Створено закупівлю #{purchase.pk} у постачальника "{purchase.supplier}"',
            notification_type='purchase_created',
            link='/procurement',
        )

    @action(detail=False, methods=['get'])
    def export(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="purchases.csv"'
        response.write('\ufeff')  # BOM for Excel

        writer = csv.writer(response)
        writer.writerow(['ID', 'Договір', 'Постачальник', 'Статус', 'Сума', 'Оплата', 'Дата доставки'])

        purchases = self.get_queryset()
        for purchase in purchases:
            writer.writerow([
                purchase.id, str(purchase.contract), purchase.supplier.company_name,
                purchase.get_status_display(), purchase.total_amount,
                purchase.get_payment_status_display(),
                purchase.expected_delivery_date or '',
            ])
        return response


class DeliveryScheduleViewSet(viewsets.ModelViewSet):
    queryset = DeliverySchedule.objects.select_related(
        'purchase', 'contract', 'supplier'
    ).all()
    serializer_class = DeliveryScheduleSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'procurement'
    filterset_fields = ['contract', 'supplier', 'status']
    ordering_fields = ['expected_date']
