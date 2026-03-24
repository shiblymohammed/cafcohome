from rest_framework import serializers
from django.db import transaction
from .models import Order, OrderItem, OrderTracking
from products.models import Product
from accounts.models import Staff


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for OrderItem."""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    product_image = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_slug', 'product_image',
            'product_snapshot', 'quantity', 'unit_price', 'discount', 'total'
        ]
        read_only_fields = ['id', 'product_snapshot', 'unit_price', 'discount', 'total']
    
    def get_product_image(self, obj):
        """Get the first product image."""
        if obj.product_snapshot and obj.product_snapshot.get('images'):
            images = obj.product_snapshot['images']
            if images and len(images) > 0:
                return images[0].get('url')
        return None


class OrderTrackingSerializer(serializers.ModelSerializer):
    """Serializer for OrderTracking."""
    
    updated_by_name = serializers.CharField(source='updated_by.name', read_only=True, allow_null=True)
    stage_display = serializers.CharField(source='get_stage_display', read_only=True)
    
    class Meta:
        model = OrderTracking
        fields = ['id', 'stage', 'stage_display', 'updated_by', 'updated_by_name', 'notes', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for Order list and detail."""
    
    items = OrderItemSerializer(many=True, read_only=True)
    tracking_history = OrderTrackingSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_phone = serializers.CharField(source='user.phone_number', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.name', read_only=True, allow_null=True)
    stage_display = serializers.CharField(source='get_stage_display', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'user_name', 'user_phone',
            'delivery_address', 'phone_number', 'stage', 'stage_display',
            'assigned_to', 'assigned_to_name', 'subtotal', 'discount', 'total',
            'items', 'tracking_history', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']


class OrderCreateItemSerializer(serializers.Serializer):
    """Serializer for creating order items."""
    
    product_id = serializers.IntegerField(required=True)
    quantity = serializers.IntegerField(required=True, min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    """Serializer for creating orders."""
    
    delivery_address = serializers.CharField(required=True)
    phone_number = serializers.CharField(required=True, max_length=15)
    items = OrderCreateItemSerializer(many=True, required=True)
    
    def validate_items(self, value):
        """Validate that items list is not empty."""
        if not value:
            raise serializers.ValidationError('Order must contain at least one item')
        return value
    
    @transaction.atomic
    def create(self, validated_data):
        """Create order with items."""
        from .quotation import calculate_order_totals
        
        user = self.context['request'].user
        items_data = validated_data.pop('items')
        
        # Prepare items for calculation
        items_for_calculation = []
        for item_data in items_data:
            try:
                product = Product.objects.get(id=item_data['product_id'], is_active=True)
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Product with id {item_data['product_id']} not found")
            
            items_for_calculation.append({
                'product': product,
                'quantity': item_data['quantity']
            })
        
        # Calculate totals with offer discounts
        calculation_result = calculate_order_totals(items_for_calculation)
        
        subtotal = calculation_result['subtotal']
        total_discount = calculation_result['total_discount']
        total = calculation_result['total']
        order_items = calculation_result['items']
        
        # Create order
        order = Order.objects.create(
            user=user,
            delivery_address=validated_data['delivery_address'],
            phone_number=validated_data['phone_number'],
            subtotal=subtotal,
            discount=total_discount,
            total=total,
            stage='order_received'
        )
        
        # Create order items
        for item_data in order_items:
            OrderItem.objects.create(
                order=order,
                product=item_data['product'],
                quantity=item_data['quantity'],
                unit_price=item_data['unit_price'],
                discount=item_data['discount'],
                total=item_data['total']
            )
        
        # Create initial tracking entry
        OrderTracking.objects.create(
            order=order,
            stage='order_received',
            notes='Order created'
        )
        
        return order


class OrderStageUpdateSerializer(serializers.Serializer):
    """Serializer for updating order stage."""
    
    stage = serializers.ChoiceField(choices=Order.STAGE_CHOICES, required=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def update(self, instance, validated_data):
        """Update order stage and create tracking entry."""
        import logging
        
        logger = logging.getLogger(__name__)
        
        old_stage = instance.stage
        new_stage = validated_data['stage']
        notes = validated_data.get('notes', '')
        
        if old_stage != new_stage:
            instance.stage = new_stage
            instance.save()
            
            # Create tracking entry
            # The post_save signal on OrderTracking will automatically send WhatsApp notification
            OrderTracking.objects.create(
                order=instance,
                stage=new_stage,
                updated_by=self.context['request'].user if hasattr(self.context['request'].user, 'role') else None,
                notes=notes
            )
            
            logger.info(f"Order {instance.order_number} stage updated from {old_stage} to {new_stage}")
        
        return instance


class OrderAssignmentSerializer(serializers.Serializer):
    """Serializer for assigning order to staff."""
    
    staff_id = serializers.IntegerField(required=True)
    
    def validate_staff_id(self, value):
        """Validate that staff exists."""
        try:
            Staff.objects.get(id=value)
        except Staff.DoesNotExist:
            raise serializers.ValidationError('Staff member not found')
        return value
    
    def update(self, instance, validated_data):
        """Assign order to staff."""
        staff = Staff.objects.get(id=validated_data['staff_id'])
        instance.assigned_to = staff
        instance.save()
        return instance
