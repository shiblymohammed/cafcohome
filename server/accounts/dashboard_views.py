from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from accounts.models import User
from orders.models import Order
from products.models import Product


class DashboardStatsView(APIView):
    """
    API endpoint to get dashboard statistics for admin panel
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Total orders count
        total_orders = Order.objects.count()
        
        # Pending orders (order_received and processing stages)
        pending_orders = Order.objects.filter(
            stage__in=['order_received', 'processing']
        ).count()
        
        # Total users count
        total_users = User.objects.filter(is_blocked=False).count()
        
        # Total products count
        total_products = Product.objects.filter(is_active=True).count()
        
        # Recent orders (last 10)
        recent_orders = Order.objects.select_related('user', 'assigned_to').order_by('-created_at')[:10]
        recent_orders_data = [
            {
                'order_number': order.order_number,
                'customer_name': order.user.name,
                'customer_phone': order.user.phone_number,
                'stage': order.stage,
                'stage_display': order.get_stage_display(),
                'total': str(order.total),
                'created_at': order.created_at.isoformat(),
                'assigned_to': order.assigned_to.name if order.assigned_to else None,
            }
            for order in recent_orders
        ]
        
        return Response({
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'total_users': total_users,
            'total_products': total_products,
            'recent_orders': recent_orders_data,
        }, status=status.HTTP_200_OK)
