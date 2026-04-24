from rest_framework import serializers
from .models import StockMovement, StockAlert, InventorySnapshot
from products.models import ProductVariant


class StockMovementSerializer(serializers.ModelSerializer):
    """Serializer for StockMovement."""
    
    variant_name = serializers.CharField(source='variant.product.name', read_only=True)
    variant_sku = serializers.CharField(source='variant.sku', read_only=True)
    variant_color = serializers.CharField(source='variant.color', read_only=True)
    variant_material = serializers.CharField(source='variant.material', read_only=True)
    movement_type_display = serializers.CharField(source='get_movement_type_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True, allow_null=True)
    order_number = serializers.CharField(source='reference_order.order_number', read_only=True, allow_null=True)
    
    class Meta:
        model = StockMovement
        fields = [
            'id', 'variant', 'variant_name', 'variant_sku', 'variant_color', 'variant_material',
            'movement_type', 'movement_type_display', 'quantity_change', 'previous_quantity', 
            'new_quantity', 'reference_order', 'order_number', 'notes', 'created_by', 
            'created_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class StockAlertSerializer(serializers.ModelSerializer):
    """Serializer for StockAlert."""
    
    variant_name = serializers.CharField(source='variant.product.name', read_only=True)
    variant_sku = serializers.CharField(source='variant.sku', read_only=True)
    variant_color = serializers.CharField(source='variant.color', read_only=True)
    variant_material = serializers.CharField(source='variant.material', read_only=True)
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    priority_color = serializers.CharField(source='get_priority_color', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.name', read_only=True, allow_null=True)
    
    class Meta:
        model = StockAlert
        fields = [
            'id', 'variant', 'variant_name', 'variant_sku', 'variant_color', 'variant_material',
            'alert_type', 'alert_type_display', 'priority', 'priority_display', 'priority_color',
            'current_quantity', 'threshold_quantity', 'is_resolved', 'resolved_by', 
            'resolved_by_name', 'created_at', 'resolved_at', 'notes'
        ]
        read_only_fields = ['id', 'created_at', 'resolved_at']


class InventorySnapshotSerializer(serializers.ModelSerializer):
    """Serializer for InventorySnapshot."""
    
    variant_name = serializers.CharField(source='variant.product.name', read_only=True)
    variant_sku = serializers.CharField(source='variant.sku', read_only=True)
    
    class Meta:
        model = InventorySnapshot
        fields = [
            'id', 'variant', 'variant_name', 'variant_sku', 'stock_quantity', 
            'reserved_quantity', 'available_quantity', 'cost_price', 'selling_price', 
            'total_value', 'snapshot_date', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ProductVariantInventorySerializer(serializers.ModelSerializer):
    """Enhanced ProductVariant serializer with inventory information."""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    category_name = serializers.CharField(source='product.category.name', read_only=True)
    subcategory_name = serializers.CharField(source='product.subcategory.name', read_only=True)
    brand_name = serializers.CharField(source='product.brand.name', read_only=True, allow_null=True)
    
    # Inventory properties
    available_quantity = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    is_out_of_stock = serializers.ReadOnlyField()
    stock_status = serializers.ReadOnlyField()
    stock_status_display = serializers.ReadOnlyField()
    inventory_value = serializers.ReadOnlyField()
    retail_value = serializers.ReadOnlyField()
    
    # Recent movements and alerts
    recent_movements = StockMovementSerializer(source='stock_movements', many=True, read_only=True)
    active_alerts = StockAlertSerializer(source='stock_alerts', many=True, read_only=True)
    
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'product', 'product_name', 'product_slug', 'category_name', 
            'subcategory_name', 'brand_name', 'color', 'material', 'sku', 
            'mrp', 'price', 'cost_price', 'stock_quantity', 'reserved_quantity', 
            'available_quantity', 'low_stock_threshold', 'reorder_point', 
            'reorder_quantity', 'last_restocked', 'is_active', 'is_default',
            'is_in_stock', 'is_low_stock', 'is_out_of_stock', 'stock_status', 
            'stock_status_display', 'inventory_value', 'retail_value',
            'recent_movements', 'active_alerts', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'sku', 'created_at', 'updated_at']


class StockAdjustmentSerializer(serializers.Serializer):
    """Serializer for stock adjustments."""
    
    variant_id = serializers.IntegerField()
    adjustment_type = serializers.ChoiceField(choices=[
        ('restock', 'Restock'),
        ('adjustment', 'Manual Adjustment'),
        ('damage', 'Damage/Loss'),
        ('return', 'Return')
    ])
    quantity = serializers.IntegerField(min_value=1)
    cost_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate_variant_id(self, value):
        """Validate that variant exists."""
        try:
            ProductVariant.objects.get(id=value, is_active=True)
        except ProductVariant.DoesNotExist:
            raise serializers.ValidationError('Product variant not found or inactive')
        return value


class BulkStockUpdateSerializer(serializers.Serializer):
    """Serializer for bulk stock updates."""
    
    updates = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
        max_length=100
    )
    
    def validate_updates(self, value):
        """Validate bulk update data."""
        for update in value:
            if 'variant_id' not in update:
                raise serializers.ValidationError('variant_id is required for each update')
            if 'stock_quantity' not in update:
                raise serializers.ValidationError('stock_quantity is required for each update')
            
            # Validate variant exists
            try:
                ProductVariant.objects.get(id=update['variant_id'], is_active=True)
            except ProductVariant.DoesNotExist:
                raise serializers.ValidationError(f'Variant {update["variant_id"]} not found')
        
        return value