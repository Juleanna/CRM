from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import HasModulePermission
from .models import Proposal
from .serializers import ProposalSerializer


class ProposalViewSet(viewsets.ModelViewSet):
    queryset = Proposal.objects.select_related('order', 'created_by')
    serializer_class = ProposalSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'orders'
    filterset_fields = ['status']
