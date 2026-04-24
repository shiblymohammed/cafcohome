"""
Order Quotation Logic

This module handles quotation generation for orders, including:
- Calculating order totals with offer discounts
- Formatting quotation data for WhatsApp messages
"""

import logging
from decimal import Decimal
from typing import Dict, List, Any
from django.utils import timezone
from django.db.models import Q

logger = logging.getLogger(__name__)


def get_best_offer_for_product(product) -> Dict[str, Any]:
    """
    Get the best (highest discount) active offer for a product.
    
    Args:
        product: Product instance
    
    Returns:
        Dict with offer details or None if no offer applies
    """
    from offers.models import Offer
    
    now = timezone.now()
    
    # Find all active offers that apply to this product
    applicable_offers = Offer.objects.filter(
        Q(is_active=True) &
        Q(start_date__lte=now) &
        Q(end_date__gte=now) &
        (
            Q(apply_to='product', products=product) |
            Q(apply_to='collection', collections=product.collection) |
            Q(apply_to='category', categories=product.category) |
            Q(apply_to='brand', brands=product.brand)
        )
    ).order_by('-discount_percentage')
    
    if applicable_offers.exists():
        best_offer = applicable_offers.first()
        return {
            'id': best_offer.id,
            'name': best_offer.name,
            'discount_percentage': best_offer.discount_percentage
        }
    
    return None


def calculate_item_discount(unit_price: Decimal, quantity: int, offer: Dict[str, Any] = None) -> Decimal:
    """
    Calculate discount for an order item.
    
    Args:
        unit_price: Unit price of the product
        quantity: Quantity ordered
        offer: Offer details dict (optional)
    
    Returns:
        Decimal: Total discount amount for the item
    """
    if not offer:
        return Decimal('0.00')
    
    discount_percentage = offer.get('discount_percentage', Decimal('0'))
    item_subtotal = unit_price * quantity
    discount_amount = (item_subtotal * discount_percentage) / Decimal('100')
    
    return discount_amount.quantize(Decimal('0.01'))


def calculate_order_totals(items_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate order totals including discounts from offers.
    
    Args:
        items_data: List of dicts with 'product' and 'quantity' keys
    
    Returns:
        Dict containing:
            - items: List of items with pricing and discount info
            - subtotal: Total before discounts
            - total_discount: Total discount amount
            - total: Final total after discounts
    """
    from products.models import Product
    
    # Since products don't have prices (quotation-based), use placeholder values
    subtotal = Decimal('0.00')
    total_discount = Decimal('0.00')
    processed_items = []
    
    for item_data in items_data:
        product = item_data['product']
        quantity = item_data['quantity']
        
        # Use placeholder price of 0 since pricing is provided in quotation
        unit_price = Decimal('0.00')
        
        # No offers applied for quotation-based products
        offer = None
        item_discount = Decimal('0.00')
        
        # Calculate totals (all zeros for quotation-based)
        item_subtotal = unit_price * quantity
        item_total = item_subtotal - item_discount
        
        subtotal += item_subtotal
        total_discount += item_discount
        
        # Get product image URL from variants (products don't have direct images)
        product_image_url = None
        try:
            # Try to get image from default variant or first active variant
            default_variant = product.variants.filter(is_active=True, is_default=True).first()
            if not default_variant:
                default_variant = product.variants.filter(is_active=True).first()
            
            if default_variant and default_variant.images and len(default_variant.images) > 0:
                product_image_url = default_variant.images[0].get('url')
        except Exception:
            # If no variants or images, leave as None
            pass
        
        processed_items.append({
            'product': product,
            'product_id': product.id,
            'product_name': product.name,
            'product_image_url': product_image_url,
            'quantity': quantity,
            'unit_price': unit_price,
            'discount': item_discount,
            'total': item_total,
            'offer': offer
        })
    
    total = subtotal - total_discount
    
    return {
        'items': processed_items,
        'subtotal': subtotal,
        'total_discount': total_discount,
        'total': total
    }


def prepare_quotation_data(order) -> Dict[str, Any]:
    """
    Prepare quotation data for an order to send via WhatsApp.
    
    Args:
        order: Order instance
    
    Returns:
        Dict containing all data needed for quotation message
    """
    # Get order items
    order_items = order.items.select_related('product').all()
    
    items_for_message = []
    for item in order_items:
        # Get product image from snapshot or product
        product_image_url = None
        if item.product_snapshot and item.product_snapshot.get('images'):
            images = item.product_snapshot['images']
            if images and len(images) > 0:
                product_image_url = images[0].get('url')
        
        items_for_message.append({
            'product_name': item.product_snapshot.get('name', item.product.name),
            'product_image_url': product_image_url,
            'quantity': item.quantity,
            'unit_price': item.unit_price,
            'discount': item.discount,
            'total': item.total
        })
    
    return {
        'customer_name': order.user.name,
        'phone_number': order.phone_number,
        'order_number': order.order_number,
        'items': items_for_message,
        'subtotal': order.subtotal,
        'discount': order.discount,
        'total': order.total
    }


def send_order_quotation(order) -> bool:
    """
    Send quotation for an order via WhatsApp.
    
    Args:
        order: Order instance
    
    Returns:
        bool: True if quotation was sent successfully, False otherwise
    """
    from utils.whatsapp import send_quotation
    
    try:
        # Prepare quotation data
        quotation_data = prepare_quotation_data(order)
        
        # Send via WhatsApp
        result = send_quotation(
            phone_number=quotation_data['phone_number'],
            customer_name=quotation_data['customer_name'],
            order_number=quotation_data['order_number'],
            items=quotation_data['items'],
            subtotal=quotation_data['subtotal'],
            discount=quotation_data['discount'],
            total=quotation_data['total']
        )
        
        # Check if WhatsApp send was successful
        if isinstance(result, dict) and result.get('error'):
            logger.warning(f"WhatsApp quotation failed for order {order.order_number}: {result.get('error')}")
            # Return False but don't raise exception - graceful degradation
            return False
        
        logger.info(f"Quotation sent successfully for order {order.order_number}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send quotation for order {order.order_number}: {str(e)}", exc_info=True)
        # Don't raise exception - allow order creation to succeed even if WhatsApp fails
        return False
