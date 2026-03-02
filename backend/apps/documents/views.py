from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Affiliation, TechnicalSpecification
from .serializers import AffiliationSerializer, TechnicalSpecificationSerializer


class AffiliationViewSet(viewsets.ModelViewSet):
    queryset = Affiliation.objects.all()
    serializer_class = AffiliationSerializer
    permission_classes = [IsAuthenticated]


class TechnicalSpecificationViewSet(viewsets.ModelViewSet):
    queryset = TechnicalSpecification.objects.select_related('affiliation', 'created_by').all()
    serializer_class = TechnicalSpecificationSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
