from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.utils import timezone
from .models import Offer
from .serializers import (
    OfferSerializer,
    OfferListSerializer,
    OfferCreateUpdateSerializer
)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Custom permission to only allow admins to edit."""
    
    def has_permission(self, request, view):
        # Read permissions for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for admin
        return request.user and request.user.is_authenticated and hasattr(request.user, 'role') and request.user.role == 'admin'


class OfferListCreateView(generics.ListCreateAPIView):
    """List all active offers or create a new offer."""
    
    permission_classes = [IsAdminOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OfferCreateUpdateSerializer
        return OfferListSerializer
    
    def get_queryset(self):
        # Show only active and valid offers to public
        now = timezone.now()
        queryset = Offer.objects.filter(
            is_active=True,
            start_date__lte=now,
            end_date__gte=now
        ).prefetch_related(
            'products',
            'collections',
            'categories',
            'brands'
        ).order_by('-is_featured', '-created_at')
        
        # Admin can see all offers
        if self.request.user and self.request.user.is_authenticated and hasattr(self.request.user, 'role') and self.request.user.role == 'admin':
            queryset = Offer.objects.all().prefetch_related(
                'products',
                'collections',
                'categories',
                'brands'
            ).order_by('-is_featured', '-created_at')
            
            # Filter by active status
            is_active = self.request.query_params.get('is_active', None)
            if is_active is not None:
                queryset = queryset.filter(is_active=is_active.lower() == 'true')
            
            # Filter by featured status
            is_featured = self.request.query_params.get('is_featured', None)
            if is_featured is not None:
                queryset = queryset.filter(is_featured=is_featured.lower() == 'true')
        else:
            # Public can filter by featured
            is_featured = self.request.query_params.get('is_featured', None)
            if is_featured is not None:
                queryset = queryset.filter(is_featured=is_featured.lower() == 'true')
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    'error': {
                        'code': 'VALIDATION_ERROR',
                        'message': 'Invalid input data',
                        'details': serializer.errors
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        offer = serializer.save()
        
        return Response(
            {
                'offer': OfferSerializer(offer).data,
                'message': 'Offer created successfully'
            },
            status=status.HTTP_201_CREATED
        )


class OfferDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete offer detail."""
    
    queryset = Offer.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return OfferCreateUpdateSerializer
        return OfferSerializer
    
    def get_queryset(self):
        # Public can only see active and valid offers for GET requests
        if self.request.method == 'GET' and not (self.request.user and self.request.user.is_authenticated and hasattr(self.request.user, 'role') and self.request.user.role == 'admin'):
            now = timezone.now()
            return Offer.objects.filter(
                is_active=True,
                start_date__lte=now,
                end_date__gte=now
            ).prefetch_related(
                'products',
                'collections',
                'categories',
                'brands'
            )
        
        # Admin can see/modify all offers
        return Offer.objects.all().prefetch_related(
            'products',
            'collections',
            'categories',
            'brands'
        )
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if not serializer.is_valid():
            return Response(
                {
                    'error': {
                        'code': 'VALIDATION_ERROR',
                        'message': 'Invalid input data',
                        'details': serializer.errors
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        offer = serializer.save()
        
        return Response(
            {
                'offer': OfferSerializer(offer).data,
                'message': 'Offer updated successfully'
            },
            status=status.HTTP_200_OK
        )
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        
        return Response(
            {
                'message': 'Offer deleted successfully'
            },
            status=status.HTTP_200_OK
        )
