"""
Order Signals

This module contains Django signals for order-related events,
including automatic WhatsApp and email notifications on order stage updates.
"""

import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order, OrderTracking

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Order)
def send_order_confirmation_email(sender, instance, created, **kwargs):
    """
    Send order confirmation email and WhatsApp when a new order is created.
    
    This signal is triggered after an Order is saved.
    It sends a confirmation email and WhatsApp message to the customer.
    """
    if not created:
        # Only send for new orders
        return
    
    # Get first product image for WhatsApp
    first_image_url = None
    try:
        first_item = instance.items.first()
        if first_item and first_item.product_snapshot:
            images = first_item.product_snapshot.get('images', [])
            if images and len(images) > 0:
                # images can be list of dicts with 'url' key or list of strings
                img = images[0]
                first_image_url = img.get('url', img) if isinstance(img, dict) else img
    except Exception:
        pass
    
    # Send Email
    from utils.email_service import EmailService
    
    try:
        email_sent = EmailService.send_order_confirmation(instance)
        
        if email_sent:
            logger.info(f"Order confirmation email sent for order {instance.order_number}")
        else:
            logger.warning(f"Order confirmation email failed for order {instance.order_number}")
        
    except Exception as e:
        logger.error(f"Failed to send order confirmation email for order {instance.order_number}: {str(e)}", exc_info=True)
    
    # Send WhatsApp
    try:
        from utils.whatsapp import send_order_confirmation
        
        result = send_order_confirmation(
            phone_number=instance.phone_number,
            customer_name=instance.user.name,
            order_number=instance.order_number,
            image_url=first_image_url
        )
        
        if isinstance(result, dict) and result.get('error'):
            logger.warning(f"WhatsApp order confirmation failed for {instance.order_number}: {result.get('error')}")
        else:
            logger.info(f"WhatsApp order confirmation sent for {instance.order_number}")
    
    except Exception as e:
        logger.error(f"Failed to send WhatsApp confirmation for {instance.order_number}: {str(e)}", exc_info=True)


@receiver(post_save, sender=OrderTracking)
def send_tracking_notification(sender, instance, created, **kwargs):
    """
    Send WhatsApp and email notifications when a new tracking entry is created.
    
    This signal is triggered after an OrderTracking record is saved.
    It sends tracking update messages to the customer via WhatsApp and Email.
    """
    if not created:
        # Only send notification for new tracking entries
        return
    
    from utils.whatsapp import send_tracking_update
    from utils.email_service import EmailService
    
    order = instance.order
    
    # Don't send notification for initial "order_received" tracking entry
    # (quotation will be sent separately)
    tracking_count = order.tracking_history.count()
    if tracking_count == 1 and instance.stage == 'order_received':
        logger.info(f"Skipping tracking notification for initial order_received stage of order {order.order_number}")
        return
    
    # Get previous stage for email
    previous_tracking = order.tracking_history.exclude(id=instance.id).first()
    old_stage = previous_tracking.stage if previous_tracking else 'order_received'
    
    # Send WhatsApp notification
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
            logger.info(f"WhatsApp tracking notification sent for order {order.order_number}, stage: {instance.stage}")
        
    except Exception as e:
        # Log error but don't raise exception to avoid breaking the order update
        logger.error(f"Failed to send WhatsApp tracking notification for order {order.order_number}: {str(e)}", exc_info=True)
    
    # Send Email notification
    try:
        email_sent = EmailService.send_order_status_update(
            order=order,
            old_stage=old_stage,
            new_stage=instance.stage
        )
        
        if email_sent:
            logger.info(f"Email tracking notification sent for order {order.order_number}, stage: {instance.stage}")
        else:
            logger.warning(f"Email tracking notification failed for order {order.order_number}")
        
    except Exception as e:
        # Log error but don't raise exception to avoid breaking the order update
        logger.error(f"Failed to send email tracking notification for order {order.order_number}: {str(e)}", exc_info=True)


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
