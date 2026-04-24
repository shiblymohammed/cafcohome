from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Sum, F, Count
from django.utils import timezone
from datetime import timedelta

from .models import StockMovement, StockAlert, InventorySnapshot
from .serializers import (
    StockMovementSerializer,
    StockAlertSerializer,
    InventorySnapshotSerializer,
    ProductVariantInventorySerializer,
    StockAdjustmentSerializer,
    BulkStockUpdateSerializer
)
from products.models import ProductVariant


class IsAdminOrStaff(permissions.BasePermission):
    """Custom permission for admin or staff."""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'role') and 
            request.user.role in ['admin', 'staff']
        )


class InventoryDashboardView(APIView):
    """Get inventory dashboard statistics."""
    
    permission_classes = [IsAdminOrStaff]
    
    def get(self, request):
        # Total products and variants
        total_variants = ProductVariant.objects.filter(is_active=True).count()
        
        # Stock statistics
        in_stock = ProductVariant.objects.filter(
            is_active=True,
            stock_quantity__gt=F('low_stock_threshold')
        ).count()
        
        low_stock = ProductVariant.objects.filter(
            is_active=True,
            stock_quantity__gt=0,
            stock_quantity__lte=F('low_stock_threshold')
        ).count()
        
        out_of_stock = ProductVariant.objects.filter(
            is_active=True,
            stock_quantity=0
        ).count()
        
        # Active alerts
        active_alerts = StockAlert.objects.filter(is_resolved=False).count()
        critical_alerts = StockAlert.objects.filter(
            is_resolved=False,
            priority='critical'
        ).count()
        
        # Inventory value
        variants_with_cost = ProductVariant.objects.filter(
            is_active=True,
            cost_price__isnull=False
        )
        
        total_inventory_value = sum(
            v.stock_quantity * v.cost_price 
            for v in variants_with_cost
        )
        
        total_retail_value = sum(
            v.stock_quantity * v.price 
            for v in ProductVariant.objects.filter(is_active=True)
        )
        
        # Recent movements (last 24 hours)
        yesterday = timezone.now() - timedelta(days=1)
        recent_movements = StockMovement.objects.filter(
            created_at__gte=yesterday
        ).count()
        
        # Low stock items needing attention
        low_stock_items = ProductVariant.objects.filter(
            is_active=True,
            stock_quantity__lte=F('reorder_point')
        ).select_related('product').order_by('stock_quantity')[:10]
        
        low_stock_data = [{
            'id': v.id,
            'product_name': v.product.name,
            'sku': v.sku,
            'color': v.color,
            'material': v.material,
            'stock_quantity': v.stock_quantity,
            'reorder_point': v.reorder_point,
            'reorder_quantity': v.reorder_quantity
        } for v in low_stock_items]
        
        return Response({
            'summary': {
                'total_variants': total_variants,
                'in_stock': in_stock,
                'low_stock': low_stock,
                'out_of_stock': out_of_stock,
                'active_alerts': active_alerts,
                'critical_alerts': critical_alerts,
                'total_inventory_value': float(total_inventory_value),
                'total_retail_value': float(total_retail_value),
                'potential_profit': float(total_retail_value - total_inventory_value),
                'recent_movements_24h': recent_movements
            },
            'low_stock_items': low_stock_data
        })


class InventoryListView(generics.ListAPIView):
    """List all inventory items with filtering."""
    
    serializer_class = ProductVariantInventorySerializer
    permission_classes = [IsAdminOrStaff]
    
    def get_queryset(self):
        queryset = ProductVariant.objects.filter(is_active=True).select_related(
            'product', 'product__category', 'product__subcategory', 'product__brand'
        ).prefetch_related('stock_movements', 'stock_alerts')
        
        # Filter by stock status
        stock_status = self.request.query_params.get('stock_status')
        if stock_status == 'in_stock':
            queryset = queryset.filter(stock_quantity__gt=F('low_stock_threshold'))
        elif stock_status == 'low_stock':
            queryset = queryset.filter(
                stock_quantity__gt=0,
                stock_quantity__lte=F('low_stock_threshold')
            )
        elif stock_status == 'out_of_stock':
            queryset = queryset.filter(stock_quantity=0)
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(product__category_id=category)
        
        # Filter by brand
        brand = self.request.query_params.get('brand')
        if brand:
            queryset = queryset.filter(product__brand_id=brand)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(product__name__icontains=search) |
                Q(sku__icontains=search) |
                Q(color__icontains=search) |
                Q(material__icontains=search)
            )
        
        return queryset.order_by('-stock_quantity')


class StockAdjustmentView(APIView):
    """Adjust stock for a variant."""
    
    permission_classes = [IsAdminOrStaff]
    
    def post(self, request):
        serializer = StockAdjustmentSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'error': {'code': 'VALIDATION_ERROR', 'details': serializer.errors}},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = serializer.validated_data
        variant = ProductVariant.objects.get(id=data['variant_id'])
        
        try:
            adjustment_type = data['adjustment_type']
            quantity = data['quantity']
            notes = data.get('notes', '')
            cost_price = data.get('cost_price')
            
            if adjustment_type == 'restock':
                variant.increase_stock(
                    quantity=quantity,
                    movement_type='restock',
                    notes=notes,
                    cost_price=cost_price
                )
            elif adjustment_type == 'damage':
                variant.reduce_stock(
                    quantity=quantity,
                    movement_type='damage',
                    notes=notes
                )
            elif adjustment_type == 'return':
                variant.increase_stock(
                    quantity=quantity,
                    movement_type='return',
                    notes=notes
                )
            elif adjustment_type == 'adjustment':
                new_quantity = variant.stock_quantity + quantity
                variant.adjust_stock(
                    new_quantity=new_quantity,
                    notes=notes,
                    created_by=request.user if hasattr(request.user, 'role') else None
                )
            
            return Response({
                'message': 'Stock adjusted successfully',
                'variant': ProductVariantInventorySerializer(variant).data
            })
            
        except ValueError as e:
            return Response(
                {'error': {'code': 'INVALID_OPERATION', 'message': str(e)}},
                status=status.HTTP_400_BAD_REQUEST
            )


class BulkStockUpdateView(APIView):
    """Bulk update stock for multiple variants."""
    
    permission_classes = [IsAdminOrStaff]
    
    def post(self, request):
        serializer = BulkStockUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'error': {'code': 'VALIDATION_ERROR', 'details': serializer.errors}},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        updates = serializer.validated_data['updates']
        updated_count = 0
        errors = []
        
        for update in updates:
            try:
                variant = ProductVariant.objects.get(id=update['variant_id'])
                new_quantity = update['stock_quantity']
                notes = update.get('notes', 'Bulk stock update')
                
                variant.adjust_stock(
                    new_quantity=new_quantity,
                    notes=notes,
                    created_by=request.user if hasattr(request.user, 'role') else None
                )
                updated_count += 1
                
            except Exception as e:
                errors.append({
                    'variant_id': update['variant_id'],
                    'error': str(e)
                })
        
        return Response({
            'message': f'Successfully updated {updated_count} variants',
            'updated_count': updated_count,
            'errors': errors
        })


class StockMovementListView(generics.ListAPIView):
    """List stock movements with filtering."""
    
    serializer_class = StockMovementSerializer
    permission_classes = [IsAdminOrStaff]
    
    def get_queryset(self):
        queryset = StockMovement.objects.all().select_related(
            'variant', 'variant__product', 'reference_order', 'created_by'
        )
        
        # Filter by variant
        variant_id = self.request.query_params.get('variant_id')
        if variant_id:
            queryset = queryset.filter(variant_id=variant_id)
        
        # Filter by movement type
        movement_type = self.request.query_params.get('movement_type')
        if movement_type:
            queryset = queryset.filter(movement_type=movement_type)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        return queryset.order_by('-created_at')


class StockAlertListView(generics.ListAPIView):
    """List stock alerts with filtering."""
    
    serializer_class = StockAlertSerializer
    permission_classes = [IsAdminOrStaff]
    
    def get_queryset(self):
        queryset = StockAlert.objects.all().select_related(
            'variant', 'variant__product', 'resolved_by'
        )
        
        # Filter by resolution status
        is_resolved = self.request.query_params.get('is_resolved')
        if is_resolved is not None:
            queryset = queryset.filter(is_resolved=is_resolved.lower() == 'true')
        
        # Filter by alert type
        alert_type = self.request.query_params.get('alert_type')
        if alert_type:
            queryset = queryset.filter(alert_type=alert_type)
        
        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        return queryset.order_by('-created_at')


class ResolveStockAlertView(APIView):
    """Resolve a stock alert."""
    
    permission_classes = [IsAdminOrStaff]
    
    def post(self, request, alert_id):
        try:
            alert = StockAlert.objects.get(id=alert_id)
        except StockAlert.DoesNotExist:
            return Response(
                {'error': {'code': 'NOT_FOUND', 'message': 'Alert not found'}},
                status=status.HTTP_404_NOT_FOUND
            )
        
        notes = request.data.get('notes', '')
        resolved_by = request.user if hasattr(request.user, 'role') else None
        
        alert.resolve(resolved_by=resolved_by, notes=notes)
        
        return Response({
            'message': 'Alert resolved successfully',
            'alert': StockAlertSerializer(alert).data
        })
