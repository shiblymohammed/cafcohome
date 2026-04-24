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
        """Get detailed pricing breakdown with offer calculations."""
        from django.utils import timezone
        from offers.models import Offer
        from decimal import Decimal
        
        # Try to get MRP and offer details from product snapshot first
        mrp = None
        offer_type = None
        offer_discount = 0
        offer_name = None
        
        if obj.product_snapshot:
            mrp = obj.product_snapshot.get('mrp')
            offer_type = obj.product_snapshot.get('offer_type')
            offer_discount = obj.product_snapshot.get('offer_discount', 0)
            offer_name = obj.product_snapshot.get('offer_name')
        
        # If MRP not in snapshot, try to get from current product variant
        if not mrp:
            try:
                # Get default variant or first active variant
                variant = obj.product.variants.filter(is_active=True, is_default=True).first()
                if not variant:
                    variant = obj.product.variants.filter(is_active=True).first()
                
                if variant:
                    mrp = str(variant.mrp)
            except:
                pass
        
        # Check for current active offers if not in snapshot
        current_offer = None
        if not offer_name:
            try:
                # Find active offers for this product
                now = timezone.now()
                active_offers = Offer.objects.filter(
                    is_active=True,
                    start_date__lte=now,
                    end_date__gte=now
                )
                
                for offer in active_offers:
                    if (offer.apply_to == 'product' and obj.product in offer.products.all()) or \
                       (offer.apply_to == 'collection' and obj.product.category in offer.collections.all()) or \
                       (offer.apply_to == 'category' and obj.product.subcategory in offer.categories.all()) or \
                       (offer.apply_to == 'brand' and obj.product.brand and obj.product.brand in offer.brands.all()):
                        current_offer = offer
                        offer_name = offer.name
                        offer_type = offer.apply_to
                        offer_discount = float(offer.discount_percentage)
                        break
            except:
                pass
        
        # Calculate pricing details
        unit_price = float(obj.unit_price)
        discount = float(obj.discount)
        total = float(obj.total)
        
        # Calculate various price points
        mrp_value = float(mrp) if mrp else 0
        
        # Calculate what the price would be with current offers
        offer_price = mrp_value
        if current_offer and mrp_value > 0:
            offer_price = mrp_value * (1 - (offer_discount / 100))
        
        # Calculate discount percentages
        mrp_discount_percentage = 0
        offer_discount_percentage = float(offer_discount) if offer_discount else 0
        
        if mrp_value > 0:
            mrp_discount_percentage = round(((mrp_value - unit_price) / mrp_value) * 100, 2)
        
        # Determine pricing breakdown
        pricing_breakdown = {
            'mrp': str(mrp_value) if mrp_value > 0 else None,
            'offer_price': offer_price if current_offer and offer_price != mrp_value else None,
            'unit_price': unit_price,
            'discount': discount,
            'total': total,
            'mrp_discount_percentage': mrp_discount_percentage,
            'offer_discount_percentage': offer_discount_percentage,
            'offer_type': offer_type,
            'offer_name': offer_name,
            'subtotal_before_discount': unit_price * obj.quantity,
            'total_discount': discount * obj.quantity,
            'final_total': total,
            # Additional calculations
            'mrp_savings': (mrp_value - unit_price) * obj.quantity if mrp_value > unit_price else 0,
            'offer_savings': (offer_price - unit_price) * obj.quantity if current_offer and offer_price > unit_price else 0,
            'has_active_offer': bool(current_offer),
            'price_matches_offer': abs(unit_price - offer_price) < 0.01 if current_offer else False
        }
        
        return pricing_breakdown


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
        """Get order summary with item counts and totals including offer calculations."""
        from django.utils import timezone
        from offers.models import Offer
        
        items = obj.items.all()
        total_items = sum(item.quantity for item in items)
        unique_products = items.count()
        
        # Calculate pricing summary
        total_mrp = 0
        total_offer_price = 0
        total_discount = 0
        has_offers = False
        active_offers_count = 0
        total_mrp_savings = 0
        total_offer_savings = 0
        
        for item in items:
            item_mrp = 0
            item_offer_price = 0
            
            # Try to get MRP from product snapshot first
            if item.product_snapshot:
                snapshot_mrp = item.product_snapshot.get('mrp')
                if snapshot_mrp:
                    item_mrp = float(snapshot_mrp)
                
                if item.product_snapshot.get('offer_type'):
                    has_offers = True
            
            # If no MRP in snapshot, try to get from current product variant
            if item_mrp == 0:
                try:
                    variant = item.product.variants.filter(is_active=True, is_default=True).first()
                    if not variant:
                        variant = item.product.variants.filter(is_active=True).first()
                    
                    if variant and variant.mrp:
                        item_mrp = float(variant.mrp)
                except:
                    pass
            
            # Check for current active offers
            current_offer = None
            if item_mrp > 0:
                try:
                    now = timezone.now()
                    active_offers = Offer.objects.filter(
                        is_active=True,
                        start_date__lte=now,
                        end_date__gte=now
                    )
                    
                    for offer in active_offers:
                        if (offer.apply_to == 'product' and item.product in offer.products.all()) or \
                           (offer.apply_to == 'collection' and item.product.category in offer.collections.all()) or \
                           (offer.apply_to == 'category' and item.product.subcategory in offer.categories.all()) or \
                           (offer.apply_to == 'brand' and item.product.brand and item.product.brand in offer.brands.all()):
                            current_offer = offer
                            has_offers = True
                            active_offers_count += 1
                            item_offer_price = item_mrp * (1 - (float(offer.discount_percentage) / 100))
                            break
                except:
                    pass
            
            # Calculate totals
            if item_mrp > 0:
                total_mrp += item_mrp * item.quantity
                
                # Calculate savings
                unit_price = float(item.unit_price)
                total_mrp_savings += (item_mrp - unit_price) * item.quantity
                
                if current_offer and item_offer_price > 0:
                    total_offer_price += item_offer_price * item.quantity
                    if item_offer_price > unit_price:
                        total_offer_savings += (item_offer_price - unit_price) * item.quantity
            
            total_discount += float(item.discount) * item.quantity
        
        return {
            'total_items': total_items,
            'unique_products': unique_products,
            'total_mrp': total_mrp if total_mrp > 0 else None,
            'total_offer_price': total_offer_price if total_offer_price > 0 else None,
            'total_discount': total_discount,
            'has_offers': has_offers,
            'active_offers_count': active_offers_count,
            'final_total': float(obj.total),
            'total_mrp_savings': total_mrp_savings,
            'total_offer_savings': total_offer_savings,
            'pricing_breakdown': {
                'mrp_total': total_mrp if total_mrp > 0 else None,
                'offer_total': total_offer_price if total_offer_price > 0 else None,
                'final_total': float(obj.total),
                'you_saved_from_mrp': total_mrp_savings,
                'additional_offer_savings': total_offer_savings
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
        """Create order with items."""
        from products.models import Product, ProductVariant
        from decimal import Decimal
        
        user = self.context['request'].user
        items_data = validated_data.pop('items')
        
        # Calculate totals
        subtotal = Decimal('0.00')
        total_discount = Decimal('0.00')
        order_items = []
        
        for item_data in items_data:
            try:
                product = Product.objects.get(id=item_data['product_id'], is_active=True)
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Product with id {item_data['product_id']} not found")
            
            quantity = item_data['quantity']
            
            # Get unit price from item data or variant
            unit_price = item_data.get('unit_price', Decimal('0.00'))
            
            # If no price provided, try to get from variant
            if unit_price == 0 and item_data.get('variant_id'):
                try:
                    variant = ProductVariant.objects.get(id=item_data['variant_id'], product=product, is_active=True)
                    unit_price = variant.price
                except ProductVariant.DoesNotExist:
                    pass
            
            # Calculate item totals
            item_subtotal = unit_price * quantity
            item_discount = Decimal('0.00')  # No discounts for now
            item_total = item_subtotal - item_discount
            
            subtotal += item_subtotal
            total_discount += item_discount
            
            order_items.append({
                'product': product,
                'quantity': quantity,
                'unit_price': unit_price,
                'discount': item_discount,
                'total': item_total,
            })
        
        total = subtotal - total_discount
        
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
