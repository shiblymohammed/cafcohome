from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions
from .models import PromotionSettings
from .serializers import PromotionSettingsSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (
            request.user and request.user.is_authenticated
            and hasattr(request.user, 'role') and request.user.role == 'admin'
        )


class PromotionSettingsView(APIView):
    """GET /api/v1/settings/promotions/ — read or update the singleton promotion settings."""

    permission_classes = [IsAdminOrReadOnly]

    def get(self, request):
        settings = PromotionSettings.get()
        serializer = PromotionSettingsSerializer(settings)
        return Response(serializer.data)

    def patch(self, request):
        settings = PromotionSettings.get()
        serializer = PromotionSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
