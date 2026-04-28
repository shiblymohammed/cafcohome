from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Q, Avg
from django.db.models.functions import TruncDate, TruncMonth, ExtractHour, ExtractWeekDay
from django.utils import timezone
from datetime import timedelta
from accounts.models import User
from orders.models import Order, OrderItem
from products.models import Product, Category
from blog.models import BlogPost


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        today = now.date()
        last_30 = today - timedelta(days=29)
        last_7  = today - timedelta(days=6)
        prev_30_start = last_30 - timedelta(days=30)
        prev_30_end   = last_30 - timedelta(days=1)

        # Core counts
        total_orders   = Order.objects.count()
        pending_orders = Order.objects.filter(stage__in=['order_received', 'processing']).count()
        total_users    = User.objects.filter(is_blocked=False).count()
        total_products = Product.objects.filter(is_active=True).count()

        # Revenue
        total_revenue   = Order.objects.filter(stage='delivered').aggregate(r=Sum('total'))['r'] or 0
        revenue_30      = Order.objects.filter(stage='delivered', created_at__date__gte=last_30).aggregate(r=Sum('total'))['r'] or 0
        revenue_prev_30 = Order.objects.filter(stage='delivered', created_at__date__gte=prev_30_start, created_at__date__lte=prev_30_end).aggregate(r=Sum('total'))['r'] or 0

        # Orders last 30 days daily
        orders_daily = Order.objects.filter(created_at__date__gte=last_30).annotate(day=TruncDate('created_at')).values('day').annotate(count=Count('id'), revenue=Sum('total')).order_by('day')
        daily_map = {str(r['day']): {'count': r['count'], 'revenue': float(r['revenue'] or 0)} for r in orders_daily}
        orders_chart = [{'date': str(last_30 + timedelta(days=i)), 'orders': daily_map.get(str(last_30 + timedelta(days=i)), {}).get('count', 0), 'revenue': daily_map.get(str(last_30 + timedelta(days=i)), {}).get('revenue', 0.0)} for i in range(30)]

        # Orders last 7 days
        orders_7 = [{'date': str(last_7 + timedelta(days=i)), 'orders': Order.objects.filter(created_at__date=last_7 + timedelta(days=i)).count()} for i in range(7)]

        # Monthly revenue last 12 months
        twelve_months_ago = today.replace(day=1) - timedelta(days=365)
        monthly_revenue = Order.objects.filter(stage='delivered', created_at__date__gte=twelve_months_ago).annotate(month=TruncMonth('created_at')).values('month').annotate(revenue=Sum('total'), orders=Count('id')).order_by('month')
        monthly_chart = [{'month': r['month'].strftime('%b %Y'), 'revenue': float(r['revenue'] or 0), 'orders': r['orders']} for r in monthly_revenue]

        # Order stage breakdown
        stage_counts = Order.objects.values('stage').annotate(count=Count('id'))
        stage_map = {r['stage']: r['count'] for r in stage_counts}
        order_stages = [
            {'stage': 'order_received', 'label': 'Received',   'count': stage_map.get('order_received', 0)},
            {'stage': 'processing',     'label': 'Processing', 'count': stage_map.get('processing', 0)},
            {'stage': 'shipped',        'label': 'Shipped',    'count': stage_map.get('shipped', 0)},
            {'stage': 'delivered',      'label': 'Delivered',  'count': stage_map.get('delivered', 0)},
        ]

        # New users last 30 days
        users_daily = User.objects.filter(created_at__date__gte=last_30).annotate(day=TruncDate('created_at')).values('day').annotate(count=Count('id')).order_by('day')
        users_map = {str(r['day']): r['count'] for r in users_daily}
        users_chart = [{'date': str(last_30 + timedelta(days=i)), 'users': users_map.get(str(last_30 + timedelta(days=i)), 0)} for i in range(30)]

        # Top categories
        top_categories = list(Category.objects.annotate(product_count=Count('products', filter=Q(products__is_active=True))).order_by('-product_count')[:6].values('name', 'product_count'))

        # Low stock + stock health
        try:
            from inventory.models import StockAlert
            from products.models import ProductVariant
            low_stock_count = StockAlert.objects.filter(is_resolved=False).count()
            stock_health = []
            for cat in Category.objects.filter(products__is_active=True).distinct()[:8]:
                variants = ProductVariant.objects.filter(product__category=cat, product__is_active=True, is_active=True)
                in_s  = variants.filter(stock_quantity__gt=5).count()
                low_s = variants.filter(stock_quantity__gt=0, stock_quantity__lte=5).count()
                out_s = variants.filter(stock_quantity=0).count()
                if in_s + low_s + out_s > 0:
                    stock_health.append({'category': cat.name, 'in_stock': in_s, 'low_stock': low_s, 'out_stock': out_s})
        except Exception:
            low_stock_count = 0
            stock_health = []

        # Blog stats
        try:
            total_blogs     = BlogPost.objects.count()
            published_blogs = BlogPost.objects.filter(status='published').count()
        except Exception:
            total_blogs = published_blogs = 0

        # Heatmap: orders by weekday x hour (last 90 days)
        ninety_days_ago = today - timedelta(days=89)
        heatmap_qs = Order.objects.filter(created_at__date__gte=ninety_days_ago).annotate(hour=ExtractHour('created_at'), weekday=ExtractWeekDay('created_at')).values('weekday', 'hour').annotate(count=Count('id'))
        heatmap_grid = {f"{r['weekday']}-{r['hour']}": r['count'] for r in heatmap_qs}
        days_labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        heatmap_data = [{'day': days_labels[wd - 1], 'hour': h, 'count': heatmap_grid.get(f'{wd}-{h}', 0)} for wd in range(1, 8) for h in range(24)]

        # Top products
        try:
            top_products_data = [{'name': r['product__name'] or 'Unknown', 'orders': r['order_count'], 'revenue': float(r['revenue'] or 0)} for r in OrderItem.objects.values('product__name').annotate(order_count=Count('id'), revenue=Sum('total')).order_by('-order_count')[:8]]
        except Exception:
            top_products_data = []

        # Revenue by category
        try:
            revenue_by_category = [{'category': r['product__category__name'] or 'Unknown', 'revenue': float(r['revenue'] or 0), 'orders': r['orders']} for r in OrderItem.objects.filter(order__stage='delivered').values('product__category__name').annotate(revenue=Sum('total'), orders=Count('id')).order_by('-revenue')[:8]]
        except Exception:
            revenue_by_category = []

        # Staff performance
        try:
            staff_performance = [{'name': r['assigned_to__name'], 'total': r['total'], 'delivered': r['delivered'], 'pending': r['pending']} for r in Order.objects.filter(assigned_to__isnull=False).values('assigned_to__name').annotate(total=Count('id'), delivered=Count('id', filter=Q(stage='delivered')), pending=Count('id', filter=Q(stage__in=['order_received', 'processing']))).order_by('-total')[:8]]
        except Exception:
            staff_performance = []

        # Fulfillment funnel
        total_all = total_orders or 1
        fulfillment_funnel = [
            {'stage': 'Orders Received', 'count': total_orders, 'pct': 100},
            {'stage': 'Processing',      'count': stage_map.get('processing', 0) + stage_map.get('shipped', 0) + stage_map.get('delivered', 0), 'pct': 0},
            {'stage': 'Shipped',         'count': stage_map.get('shipped', 0) + stage_map.get('delivered', 0), 'pct': 0},
            {'stage': 'Delivered',       'count': stage_map.get('delivered', 0), 'pct': 0},
        ]
        for item in fulfillment_funnel:
            item['pct'] = round((item['count'] / total_all) * 100, 1)

        # Customer retention (last 6 months)
        try:
            retention_data = []
            for i in range(5, -1, -1):
                m_start = (today.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
                m_end   = today if i == 0 else (today.replace(day=1) - timedelta(days=(i - 1) * 30)).replace(day=1) - timedelta(days=1)
                qs = Order.objects.filter(created_at__date__gte=m_start, created_at__date__lte=m_end)
                new_u  = qs.filter(user__orders__created_at__date__gte=m_start).values('user').distinct().count()
                total_u = qs.values('user').distinct().count()
                retention_data.append({'month': m_start.strftime('%b %Y'), 'new': new_u, 'returning': max(0, total_u - new_u)})
        except Exception:
            retention_data = []

        # Recent orders
        recent_orders_data = [{'order_number': o.order_number, 'customer_name': o.user.name, 'customer_phone': o.user.phone_number, 'stage': o.stage, 'stage_display': o.get_stage_display(), 'total': str(o.total), 'created_at': o.created_at.isoformat(), 'assigned_to': o.assigned_to.name if o.assigned_to else None} for o in Order.objects.select_related('user', 'assigned_to').order_by('-created_at')[:10]]

        # Calendar
        calendar_data = {str(r['day']): r['count'] for r in Order.objects.filter(created_at__date__gte=today.replace(day=1)).annotate(day=TruncDate('created_at')).values('day').annotate(count=Count('id'))}

        return Response({
            'total_orders': total_orders, 'pending_orders': pending_orders,
            'total_users': total_users, 'total_products': total_products,
            'total_revenue': float(total_revenue), 'revenue_30': float(revenue_30),
            'revenue_prev_30': float(revenue_prev_30), 'low_stock_count': low_stock_count,
            'total_blogs': total_blogs, 'published_blogs': published_blogs,
            'orders_chart': orders_chart, 'orders_7': orders_7,
            'monthly_chart': monthly_chart, 'order_stages': order_stages,
            'users_chart': users_chart, 'top_categories': top_categories,
            'heatmap_data': heatmap_data, 'top_products': top_products_data,
            'revenue_by_category': revenue_by_category, 'staff_performance': staff_performance,
            'fulfillment_funnel': fulfillment_funnel, 'customer_retention': retention_data,
            'stock_health': stock_health, 'recent_orders': recent_orders_data,
            'calendar_data': calendar_data,
        }, status=status.HTTP_200_OK)
