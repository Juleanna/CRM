from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Q
from apps.orders.models import Order
from apps.contracts.models import Contract
from apps.procurement.models import Purchase
from apps.tasks.models import Task
from apps.notifications.models import Notification
from apps.production.models import FinishedProduct
from apps.warehouse.models import Material


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = {
            'active_orders': Order.objects.exclude(status__in=['won', 'lost', 'rejected']).count(),
            'contracts_in_production': Contract.objects.filter(status='production').count(),
            'pending_purchases': Purchase.objects.exclude(status='received').count(),
            'open_tasks': Task.objects.exclude(status='completed').count(),
            'unread_notifications': Notification.objects.filter(recipient=request.user, is_read=False).count(),
        }
        return Response(data)


class AnalyticsOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models.functions import TruncMonth
        from datetime import date

        # Production by department
        production_by_dept = (
            FinishedProduct.objects
            .values('department__name')
            .annotate(total=Sum('quantity'))
            .order_by('-total')
        )

        # Orders by status
        orders_by_status = (
            Order.objects
            .values('status')
            .annotate(count=Count('id'))
            .order_by('status')
        )

        # Total materials value
        materials_value = Material.objects.aggregate(total=Sum('total_price'))

        # Active contracts with progress
        contracts = Contract.objects.filter(status__in=['planning', 'production']).select_related('order')
        contracts_data = []
        for c in contracts[:10]:
            produced = FinishedProduct.objects.filter(contract=c).aggregate(total=Sum('quantity'))['total'] or 0
            contracts_data.append({
                'id': c.id,
                'contract_number': c.contract_number,
                'order_title': c.order.title if c.order else '',
                'total_quantity': c.total_quantity,
                'produced': produced,
                'status': c.status,
            })

        data = {
            'production_by_department': list(production_by_dept),
            'orders_by_status': list(orders_by_status),
            'materials_total_value': materials_value['total'] or 0,
            'active_contracts': contracts_data,
        }
        return Response(data)
