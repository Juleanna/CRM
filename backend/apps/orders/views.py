import csv

from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import HasModulePermission
from .models import Customer, Order
from .serializers import CustomerSerializer, OrderSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'orders'


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related('customer', 'created_by').prefetch_related('participants')
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'orders'
    filterset_fields = ['status', 'priority', 'customer']
    search_fields = ['title', 'description', 'customer__company_name']
    ordering_fields = ['created_at', 'deadline', 'payment_amount']

    def perform_create(self, serializer):
        order = serializer.save(created_by=self.request.user)
        from apps.notifications.services import create_notification
        for participant in order.participants.all():
            if participant != self.request.user:
                create_notification(
                    recipient=participant,
                    title='Нове замовлення',
                    message=f'Створено замовлення "{order.title}"',
                    notification_type='order_created',
                    link='/orders',
                )

    @action(detail=False, methods=['get'])
    def export(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="orders.csv"'
        response.write('\ufeff')  # BOM for Excel

        writer = csv.writer(response)
        writer.writerow(['ID', 'Назва', 'Замовник', 'Статус', 'Пріоритет', 'Кількість', 'Сума', 'Дедлайн', 'Створено'])

        orders = self.get_queryset()
        for order in orders:
            writer.writerow([
                order.id, order.title, order.customer.company_name,
                order.get_status_display(), order.get_priority_display(),
                order.quantity, order.payment_amount or '',
                order.deadline or '', order.created_at.strftime('%Y-%m-%d'),
            ])
        return response
