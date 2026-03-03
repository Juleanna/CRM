import csv

from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import HasModulePermission
from .models import FinishedProduct, ArchivedProject
from .serializers import FinishedProductSerializer, ArchivedProjectSerializer


class FinishedProductViewSet(viewsets.ModelViewSet):
    queryset = FinishedProduct.objects.select_related('contract', 'department', 'created_by')
    serializer_class = FinishedProductSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'production'
    filterset_fields = ['contract', 'category', 'product_type', 'transferred_to_main', 'department']
    search_fields = ['name']
    ordering_fields = ['production_date', 'quantity']

    @action(detail=False, methods=['get'])
    def export(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="finished_products.csv"'
        response.write('\ufeff')  # BOM for Excel

        writer = csv.writer(response)
        writer.writerow(['Договір', 'Назва', 'Категорія', 'Тип', 'Кількість', 'Дата', 'Підрозділ', 'Передано'])

        products = self.get_queryset()
        for product in products:
            writer.writerow([
                str(product.contract), product.name,
                product.get_category_display(), product.get_product_type_display(),
                product.quantity, product.production_date,
                product.department.name if product.department else '',
                'Так' if product.transferred_to_main else 'Ні',
            ])
        return response


class ArchivedProjectViewSet(viewsets.ModelViewSet):
    queryset = ArchivedProject.objects.select_related('contract')
    serializer_class = ArchivedProjectSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'production'
    filterset_fields = ['status']
