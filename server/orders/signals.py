"""
Order Signals

This module contains Django signals for order-related events,
including automatic WhatsApp notifications on order stage updates.
"""

import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order, OrderTracking

logger = logging.getLogger(__name__)


@receiver(post_save, sender=OrderTracking)
def send_tracking_notification(sender, instance, created, **kwargs):
    """
    Send WhatsApp notification when a new tracking entry is created.
    
    This signal is triggered after an OrderTracking record is saved.
    It sends a tracking update message to the customer via WhatsApp.
    """
    if not created:
        # Only send notification for new tracking entries
        return
    
    from utils.whatsapp import send_tracking_update
    
    order = instance.order
    
    # Don't send notification for initial "order_received" tracking entry
    # (quotation will be sent separately)
    tracking_count = order.tracking_history.count()
    if tracking_count == 1 and instance.stage == 'order_received':
        logger.info(f"Skipping tracking notification for initial order_received stage of order {order.order_number}")
        return
    
    try:
        # Get stage display name
        stage_display = dict(Order.STAGE_CHOICES).get(instance.stage, instance.stage)
        
        # Send tracking update via WhatsApp
        result = send_tracking_update(
            phone_number=order.phone_number,
            customer_name=order.user.name,
            order_number=order.order_number,
            stage=instance.stage,
            stage_display=stage_display
        )
        
        # Check if WhatsApp send was successful
        if isinstance(result, dict) and result.get('error'):
            logger.warning(f"WhatsApp tracking notification failed for order {order.order_number}: {result.get('error')}")
        else:
            logger.info(f"Tracking notification sent for order {order.order_number}, stage: {instance.stage}")
        
    except Exception as e:
        # Log error but don't raise exception to avoid breaking the order update
        logger.error(f"Failed to send tracking notification for order {order.order_number}: {str(e)}", exc_info=True)


@receiver(post_save, sender=OrderTracking)
def reduce_stock_on_delivery(sender, instance, created, **kwargs):
    """
    Reduce product stock when order status changes to 'delivered'.
    
    This signal is triggered after an OrderTracking record is saved.
    It reduces the stock quantity for all products in the order.
    """
    if not created:
        # Only process new tracking entries
        return
    
    # Only reduce stock when order is delivered
    if instance.stage != 'delivered':
        return
    
    order = instance.order
    
    try:
        # Reduce stock for each order item
        for item in order.items.all():
            product = item.product
            quantity = item.quantity
            
            # Reduce stock
            success = product.reduce_stock(quantity)
            
            if success:
                logger.info(f"Reduced stock for product {product.name} (ID: {product.id}) by {quantity}. New stock: {product.stock_quantity}")
            else:
                logger.warning(f"Failed to reduce stock for product {product.name} (ID: {product.id}). Insufficient stock. Current: {product.stock_quantity}, Requested: {quantity}")
        
        logger.info(f"Stock reduction completed for order {order.order_number}")
        
    except Exception as e:
        # Log error but don't raise exception to avoid breaking the order update
        logger.error(f"Failed to reduce stock for order {order.order_number}: {str(e)}", exc_info=True)
