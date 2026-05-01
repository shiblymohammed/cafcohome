from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import Order, OrderItem, OrderTracking
from .serializers import (
    OrderSerializer,
    OrderCreateSerializer,
    OrderStageUpdateSerializer,
    OrderAssignmentSerializer
)


class IsAuthenticatedUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class IsAdminOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and request.user.is_authenticated and
            hasattr(request.user, 'role') and request.user.role in ['admin', 'staff']
        )


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and request.user.is_authenticated and
            hasattr(request.user, 'role') and request.user.role == 'admin'
        )


class OrderPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class OrderCreateView(generics.CreateAPIView):
    serializer_class = OrderCreateSerializer
    permission_classes = [IsAuthenticatedUser]

    def create(self, request, *args, **kwargs):
        import logging
        logger = logging.getLogger(__name__)
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': {'code': 'VALIDATION_ERROR', 'message': 'Invalid input data', 'details': serializer.errors}},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            order = serializer.save()
            return Response(
                {
                    'order': OrderSerializer(order).data,
                    'message': 'Order created successfully. We will contact you shortly with your quotation.'
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            logger.error(f"Error creating order: {str(e)}")
            return Response(
                {'error': {'code': 'INTERNAL_ERROR', 'message': str(e)}},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticatedUser]
    pagination_class = OrderPagination

    def get_queryset(self):
        user = self.request.user
        base_qs = Order.objects.select_related(
            'user', 'assigned_to'
        ).prefetch_related(
            'items__product__variants',
            'tracking_history',
            'quotation_logs'
        )

        if hasattr(user, 'role') and user.role in ['admin', 'staff']:
            queryset = base_qs.all()

            stage = self.request.query_params.get('stage')
            if stage:
                queryset = queryset.filter(stage=stage)

            assigned_to = self.request.query_params.get('assigned_to')
            if assigned_to:
                if assigned_to == 'unassigned':
                    queryset = queryset.filter(assigned_to__isnull=True)
                else:
                    queryset = queryset.filter(assigned_to_id=assigned_to)

            start_date = self.request.query_params.get('start_date')
            end_date   = self.request.query_params.get('end_date')
            if start_date:
                queryset = queryset.filter(created_at__date__gte=start_date)
            if end_date:
                queryset = queryset.filter(created_at__date__lte=end_date)

            search = self.request.query_params.get('search')
            if search:
                queryset = queryset.filter(
                    Q(order_number__icontains=search) |
                    Q(user__name__icontains=search) |
                    Q(user__phone_number__icontains=search)
                )

            return queryset.order_by('-created_at')

        return base_qs.filter(user=user).order_by('-created_at')


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticatedUser]
    lookup_field = 'order_number'

    def get_queryset(self):
        user = self.request.user
        base_qs = Order.objects.select_related(
            'user', 'assigned_to'
        ).prefetch_related(
            'items__product__variants',
            'tracking_history',
            'quotation_logs'
        )
        if hasattr(user, 'role') and user.role in ['admin', 'staff']:
            return base_qs.all()
        return base_qs.filter(user=user)


class OrderStageUpdateView(APIView):
    permission_classes = [IsAdminOrStaff]

    def patch(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response(
                {'error': {'code': 'NOT_FOUND', 'message': 'Order not found'}},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = OrderStageUpdateSerializer(order, data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(
                {'error': {'code': 'VALIDATION_ERROR', 'details': serializer.errors}},
                status=status.HTTP_400_BAD_REQUEST
            )
        order = serializer.save()
        return Response({'order': OrderSerializer(order).data, 'message': 'Order stage updated successfully'})


class OrderAssignmentView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response(
                {'error': {'code': 'NOT_FOUND', 'message': 'Order not found'}},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = OrderAssignmentSerializer(order, data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': {'code': 'VALIDATION_ERROR', 'details': serializer.errors}},
                status=status.HTTP_400_BAD_REQUEST
            )
        order = serializer.save()
        return Response({'order': OrderSerializer(order).data, 'message': 'Order assigned successfully'})


class QuotationSentView(APIView):
    permission_classes = [IsAdminOrStaff]

    def post(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response(
                {'error': {'code': 'NOT_FOUND', 'message': 'Order not found'}},
                status=status.HTTP_404_NOT_FOUND
            )
        from .models import QuotationLog
        staff_member = request.user if hasattr(request.user, 'role') else None
        quotation_log = QuotationLog.objects.create(
            order=order,
            sent_by=staff_member,
            phone_number=order.phone_number,
            message_content=request.data.get('message_content', ''),
            method='manual'
        )
        return Response({
            'message': 'Quotation sent logged successfully',
            'quotation_log_id': quotation_log.id,
            'sent_at': quotation_log.sent_at
        }, status=status.HTTP_200_OK)