from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Order, OrderItem, OrderTracking
from .serializers import (
    OrderSerializer,
    OrderCreateSerializer,
    OrderStageUpdateSerializer,
    OrderAssignmentSerializer
)


class IsAuthenticatedUser(permissions.BasePermission):
    """Custom permission for authenticated users."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class IsAdminOrStaff(permissions.BasePermission):
    """Custom permission for admin or staff."""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'role') and 
            request.user.role in ['admin', 'staff']
        )


class IsAdmin(permissions.BasePermission):
    """Custom permission for admin only."""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'role') and 
            request.user.role == 'admin'
        )


class OrderCreateView(generics.CreateAPIView):
    """Create a new order (checkout)."""
    
    serializer_class = OrderCreateSerializer
    permission_classes = [IsAuthenticatedUser]
    
    def create(self, request, *args, **kwargs):
        from .quotation import send_order_quotation
        import logging
        
        logger = logging.getLogger(__name__)
        
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
        
        try:
            order = serializer.save()
            
            # WhatsApp quotation disabled for now - will be implemented later
            # quotation_sent = send_order_quotation(order)
            message = 'Order created successfully. We will contact you shortly with your quotation.'
            
            return Response(
                {
                    'order': OrderSerializer(order).data,
                    'message': message
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            logger.error(f"Error creating order: {str(e)}")
            return Response(
                {
                    'error': {
                        'code': 'INTERNAL_ERROR',
                        'message': str(e)
                    }
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OrderListView(generics.ListAPIView):
    """List orders (filtered by user for customers, all for admin/staff)."""
    
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticatedUser]
    pagination_class = None  # Disable pagination for simpler response
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin/staff can see all orders
        if hasattr(user, 'role') and user.role in ['admin', 'staff']:
            queryset = Order.objects.all()
            
            # Filter by stage
            stage = self.request.query_params.get('stage', None)
            if stage:
                queryset = queryset.filter(stage=stage)
            
            # Filter by assigned staff
            assigned_to = self.request.query_params.get('assigned_to', None)
            if assigned_to:
                queryset = queryset.filter(assigned_to_id=assigned_to)
            
            # Filter by date range
            start_date = self.request.query_params.get('start_date', None)
            end_date = self.request.query_params.get('end_date', None)
            if start_date:
                queryset = queryset.filter(created_at__gte=start_date)
            if end_date:
                queryset = queryset.filter(created_at__lte=end_date)
            
            return queryset.select_related('user', 'assigned_to').prefetch_related('items', 'tracking_history').order_by('-created_at')
        
        # Customers can only see their own orders
        return Order.objects.filter(user=user).select_related('assigned_to').prefetch_related('items', 'tracking_history').order_by('-created_at')


class OrderDetailView(generics.RetrieveAPIView):
    """Retrieve order detail."""
    
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticatedUser]
    lookup_field = 'order_number'
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin/staff can see all orders
        if hasattr(user, 'role') and user.role in ['admin', 'staff']:
            return Order.objects.all().select_related('user', 'assigned_to').prefetch_related('items', 'tracking_history')
        
        # Customers can only see their own orders
        return Order.objects.filter(user=user).select_related('assigned_to').prefetch_related('items', 'tracking_history')


class OrderStageUpdateView(APIView):
    """Update order stage (admin/staff only)."""
    
    permission_classes = [IsAdminOrStaff]
    
    def patch(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response(
                {
                    'error': {
                        'code': 'NOT_FOUND',
                        'message': 'Order not found'
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = OrderStageUpdateSerializer(
            order,
            data=request.data,
            context={'request': request}
        )
        
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
        
        order = serializer.save()
        
        return Response(
            {
                'order': OrderSerializer(order).data,
                'message': 'Order stage updated successfully'
            },
            status=status.HTTP_200_OK
        )


class OrderAssignmentView(APIView):
    """Assign order to staff (admin only)."""
    
    permission_classes = [IsAdmin]
    
    def patch(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response(
                {
                    'error': {
                        'code': 'NOT_FOUND',
                        'message': 'Order not found'
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = OrderAssignmentSerializer(order, data=request.data)
        
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
        
        order = serializer.save()
        
        return Response(
            {
                'order': OrderSerializer(order).data,
                'message': 'Order assigned successfully'
            },
            status=status.HTTP_200_OK
        )


class QuotationSentView(APIView):
    """Log when a quotation is sent manually (admin/staff only)."""
    
    permission_classes = [IsAdminOrStaff]
    
    def post(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response(
                {
                    'error': {
                        'code': 'NOT_FOUND',
                        'message': 'Order not found'
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        from .models import QuotationLog
        
        # Get the staff member who sent the quotation
        staff_member = None
        if hasattr(request.user, 'role'):
            staff_member = request.user
        
        # Create quotation log
        quotation_log = QuotationLog.objects.create(
            order=order,
            sent_by=staff_member,
            phone_number=order.phone_number,
            message_content=request.data.get('message_content', ''),
            method='manual'
        )
        
        return Response(
            {
                'message': 'Quotation sent logged successfully',
                'quotation_log_id': quotation_log.id,
                'sent_at': quotation_log.sent_at
            },
            status=status.HTTP_200_OK
        )