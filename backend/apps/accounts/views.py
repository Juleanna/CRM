from rest_framework import generics, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import HasModulePermission
from .models import Department, User, PermissionGroup, ModulePermission
from .serializers import (
    UserProfileSerializer, ChangePasswordSerializer, DepartmentSerializer,
    PermissionGroupListSerializer, PermissionGroupDetailSerializer, UserAdminSerializer,
)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'detail': 'Пароль змінено'}, status=status.HTTP_200_OK)


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'users'


class PermissionGroupViewSet(viewsets.ModelViewSet):
    queryset = PermissionGroup.objects.prefetch_related('module_permissions').all()
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'users'

    def get_serializer_class(self):
        if self.action == 'list':
            return PermissionGroupListSerializer
        return PermissionGroupDetailSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.is_system:
            return Response({'detail': 'Системну групу не можна видалити'}, status=status.HTTP_400_BAD_REQUEST)
        if instance.users.exists():
            return Response({'detail': 'Не можна видалити групу, яка призначена користувачам'}, status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def modules(self, request):
        return Response([
            {'value': value, 'label': label}
            for value, label in ModulePermission.Module.choices
        ])


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.select_related('department', 'permission_group').all()
    serializer_class = UserAdminSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module = 'users'
