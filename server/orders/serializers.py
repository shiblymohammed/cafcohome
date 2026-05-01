from rest_framework import serializers
from django.db import transaction
from .models import Order, OrderItem, OrderTracking, QuotationLog
from products.models import Product
from accounts.models import Staff


class QuotationLogSerializer(serializers.ModelSerializer):
    """Serializer for QuotationLog."""
    
    sent_by_name = serializers.CharField(source='sent_by.name', read_only=True, allow_null=True)
    method_display = serializers.CharField(source='get_method_display', read_only=True)
    
    class Meta:
        model = QuotationLog
        fields = ['id', 'sent_by', 'sent_by_name', 'phone_number', 'sent_at', 'method', 'method_display']
        read_only_fields = ['id', 'sent_at']


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for OrderItem."""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    product_image = serializers.SerializerMethodField()
    variant_details = serializers.SerializerMethodField()
    pricing_details = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_slug', 'product_image',
            'product_snapshot', 'quantity', 'unit_price', 'discount', 'total',
            'variant_details', 'pricing_details'
        ]
        read_only_fields = ['id', 'product_snapshot']
    
    def get_product_image(self, obj):
        """Get the first product image."""
        if obj.product_snapshot and obj.product_snapshot.get('images'):
            images = obj.product_snapshot['images']
            if images and len(images) > 0:
                return images[0].get('url')
        return None
    
    def get_variant_details(self, obj):
        """Get variant information if available."""
        variant_details = {
            'color': None,
            'material': None,
            'sku': None,
            'colors': [],
            'materials': []
        }
        
        # Try to get from product snapshot first
        if obj.product_snapshot:
            variant_details.update({
                'color': obj.product_snapshot.get('color'),
                'material': obj.product_snapshot.get('material'),
                'sku': obj.product_snapshot.get('sku'),
                'colors': obj.product_snapshot.get('colors', []),
                'materials': obj.product_snapshot.get('materials', [])
            })
        
        # If no variant details in snapshot, try to get from current product variant
        if not variant_details['color'] and not variant_details['material']:
            try:
                # Get default variant or first active variant
                variant = obj.product.variants.filter(is_active=True, is_default=True).first()
                if not variant:
                    variant = obj.product.variants.filter(is_active=True).first()
                
                if variant:
                    variant_details.update({
                        'color': variant.color,
                        'material': variant.material,
                        'sku': variant.sku,
                        'colors': [variant.color] if variant.color else [],
                        'materials': [variant.material] if variant.material else []
                    })
            except:
                pass
        
        return variant_details
    
    def get_pricing_details(self, obj):
        """Get pricing breakdown — reads from snapshot, no extra queries."""
        snapshot = obj.product_snapshot or {}

        mrp_raw = snapshot.get('mrp')
        if not mrp_raw:
            # Fallback to prefetched variants
            try:
                variants = [v for v in obj.product.variants.all() if v.is_active]
                default = next((v for v in variants if v.is_default), None) or (variants[0] if variants else None)
                if default:
                    mrp_raw = str(default.mrp)
            except Exception:
                pass

        unit_price = float(obj.unit_price)
        discount   = float(obj.discount)
        total      = float(obj.total)
        mrp_value  = float(mrp_raw) if mrp_raw else 0

        mrp_discount_pct = 0
        if mrp_value > 0 and unit_price < mrp_value:
            mrp_discount_pct = round(((mrp_value - unit_price) / mrp_value) * 100, 2)

        offer_name     = snapshot.get('offer_name')
        offer_type     = snapshot.get('offer_type')
        offer_discount = float(snapshot.get('offer_discount') or 0)

        return {
            'mrp': str(mrp_value) if mrp_value > 0 else None,
            'offer_price': None,
            'unit_price': unit_price,
            'discount': discount,
            'total': total,
            'mrp_discount_percentage': mrp_discount_pct,
            'offer_discount_percentage': offer_discount,
            'offer_type': offer_type,
            'offer_name': offer_name,
            'subtotal_before_discount': unit_price * obj.quantity,
            'total_discount': discount * obj.quantity,
            'final_total': total,
            'mrp_savings': max(0, (mrp_value - unit_price) * obj.quantity) if mrp_value > 0 else 0,
            'offer_savings': 0,
            'has_active_offer': bool(offer_name),
            'price_matches_offer': False,
        }


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
    quotation_logs = QuotationLogSerializer(many=True, read_only=True)
    user = serializers.SerializerMethodField()
    assigned_to = serializers.SerializerMethodField()
    stage_display = serializers.CharField(source='get_stage_display', read_only=True)
    order_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user',
            'delivery_address', 'phone_number', 'stage', 'stage_display',
            'assigned_to', 'subtotal', 'discount', 'total',
            'items', 'tracking_history', 'quotation_logs', 'order_summary', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']
    
    def get_user(self, obj):
        """Return user information."""
        return {
            'id': obj.user.id,
            'name': obj.user.name,
            'phone_number': obj.user.phone_number,
        }
    
    def get_assigned_to(self, obj):
        """Return assigned staff information."""
        if obj.assigned_to:
            return {
                'id': obj.assigned_to.id,
                'name': obj.assigned_to.name,
            }
        return None
    
    def get_order_summary(self, obj):
        """Get order summary — uses prefetched items, no extra queries."""
        items = obj.items.all()
        total_items = sum(item.quantity for item in items)
        unique_products = items.count()

        total_mrp = 0
        total_mrp_savings = 0

        for item in items:
            mrp = 0
            if item.product_snapshot:
                raw = item.product_snapshot.get('mrp')
                if raw:
                    try:
                        mrp = float(raw)
                    except (TypeError, ValueError):
                        pass

            if mrp == 0:
                # Fallback: use prefetched variants
                try:
                    variants = [v for v in item.product.variants.all() if v.is_active]
                    default = next((v for v in variants if v.is_default), None) or (variants[0] if variants else None)
                    if default:
                        mrp = float(default.mrp)
                except Exception:
                    pass

            if mrp > 0:
                total_mrp += mrp * item.quantity
                total_mrp_savings += (mrp - float(item.unit_price)) * item.quantity

        has_offers = any(
            item.product_snapshot and item.product_snapshot.get('offer_type')
            for item in items
        )

        return {
            'total_items': total_items,
            'unique_products': unique_products,
            'total_mrp': total_mrp if total_mrp > 0 else None,
            'total_offer_price': None,
            'total_discount': float(obj.discount),
            'has_offers': has_offers,
            'active_offers_count': 0,
            'final_total': float(obj.total),
            'total_mrp_savings': max(0, total_mrp_savings),
            'total_offer_savings': 0,
            'pricing_breakdown': {
                'mrp_total': total_mrp if total_mrp > 0 else None,
                'offer_total': None,
                'final_total': float(obj.total),
                'you_saved_from_mrp': max(0, total_mrp_savings),
                'additional_offer_savings': 0,
            }
        }


class OrderCreateItemSerializer(serializers.Serializer):
    """Serializer for creating order items."""
    
    product_id = serializers.IntegerField(required=True)
    quantity = serializers.IntegerField(required=True, min_value=1)
    variant_id = serializers.IntegerField(required=False, allow_null=True)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)


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
        """Create order with items and product snapshots."""
        from products.models import Product, ProductVariant
        from decimal import Decimal

        user = self.context['request'].user
        items_data = validated_data.pop('items')

        subtotal = Decimal('0.00')
        order_items = []

        for item_data in items_data:
            try:
                product = Product.objects.select_related(
                    'category', 'subcategory', 'brand'
                ).prefetch_related('variants').get(
                    id=item_data['product_id'], is_active=True
                )
            except Product.DoesNotExist:
                raise serializers.ValidationError(
                    f"Product with id {item_data['product_id']} not found or inactive"
                )

            quantity = item_data['quantity']

            # Resolve variant
            variant = None
            if item_data.get('variant_id'):
                try:
                    variant = product.variants.get(id=item_data['variant_id'], is_active=True)
                except ProductVariant.DoesNotExist:
                    pass

            if variant is None:
                variant = product.variants.filter(is_active=True, is_default=True).first()
                if variant is None:
                    variant = product.variants.filter(is_active=True).first()

            # Determine unit price
            unit_price = item_data.get('unit_price', Decimal('0.00'))
            if unit_price == 0 and variant:
                unit_price = variant.price

            item_total = unit_price * quantity
            subtotal += item_total

            # Build product snapshot — captures state at order time
            snapshot = {
                'name': product.name,
                'slug': product.slug,
                'images': variant.images if variant else [],
                'dimensions': product.dimensions,
                'colors': [variant.color] if variant else [],
                'materials': [variant.material] if variant else [],
                'color': variant.color if variant else None,
                'material': variant.material if variant else None,
                'sku': variant.sku if variant else None,
                'mrp': str(variant.mrp) if variant else None,
                'price': str(variant.price) if variant else str(unit_price),
                'offer_type': None,
                'offer_name': None,
                'offer_discount': None,
            }

            order_items.append({
                'product': product,
                'quantity': quantity,
                'unit_price': unit_price,
                'discount': Decimal('0.00'),
                'total': item_total,
                'product_snapshot': snapshot,
            })

        order = Order.objects.create(
            user=user,
            delivery_address=validated_data['delivery_address'],
            phone_number=validated_data['phone_number'],
            subtotal=subtotal,
            discount=Decimal('0.00'),
            total=subtotal,
            stage='order_received'
        )

        for item_data in order_items:
            OrderItem.objects.create(
                order=order,
                product=item_data['product'],
                quantity=item_data['quantity'],
                unit_price=item_data['unit_price'],
                discount=item_data['discount'],
                total=item_data['total'],
                product_snapshot=item_data['product_snapshot'],
            )

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
