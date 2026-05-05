"""
WhatsApp Cloud API Integration

This module provides utilities for sending messages via WhatsApp Cloud API,
including quotations and order tracking updates.
"""

import requests
import logging
from decouple import config
from typing import Dict, List, Optional, Any
from decimal import Decimal

logger = logging.getLogger(__name__)

# WhatsApp API Configuration
WHATSAPP_API_TOKEN = config('WHATSAPP_API_TOKEN', default='')
WHATSAPP_PHONE_NUMBER_ID = config('WHATSAPP_PHONE_NUMBER_ID', default='')
WHATSAPP_API_URL = f"https://graph.facebook.com/v18.0/{WHATSAPP_PHONE_NUMBER_ID}/messages"


def validate_whatsapp_config() -> bool:
    """
    Validates that WhatsApp API is properly configured
    
    Returns:
        bool: True if configuration is valid, False otherwise
    """
    if not all([WHATSAPP_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID]):
        logger.warning('WhatsApp API configuration is incomplete')
        return False
    
    return True


def send_whatsapp_template(
    to: str,
    template_name: str = 'hello_world',
    language_code: str = 'en_US',
    parameters: List[str] = None,
    image_url: str = None
) -> Dict[str, Any]:
    """
    Sends a template message via WhatsApp Cloud API
    
    Args:
        to: Recipient phone number in E.164 format (e.g., +1234567890)
        template_name: Name of the approved template
        language_code: Language code (default: en_US)
        parameters: List of parameter values for the template body
        image_url: Optional image URL for template header
    
    Returns:
        Dict containing API response
    """
    if not validate_whatsapp_config():
        raise Exception('WhatsApp API is not properly configured')
    
    # Remove '+' from phone number if present
    to = to.replace('+', '')
    
    headers = {
        'Authorization': f'Bearer {WHATSAPP_API_TOKEN}',
        'Content-Type': 'application/json',
    }
    
    template_payload = {
        'name': template_name,
        'language': {
            'code': language_code
        }
    }
    
    # Build components list
    components = []
    
    # Add image header if provided
    if image_url:
        components.append({
            'type': 'header',
            'parameters': [{
                'type': 'image',
                'image': {'link': image_url}
            }]
        })
    
    # Add body parameters if provided
    if parameters:
        components.append({
            'type': 'body',
            'parameters': [{'type': 'text', 'text': param} for param in parameters]
        })
    
    if components:
        template_payload['components'] = components
    
    payload = {
        'messaging_product': 'whatsapp',
        'recipient_type': 'individual',
        'to': to,
        'type': 'template',
        'template': template_payload
    }
    
    try:
        from .logging_config import log_api_call
        
        response = requests.post(
            WHATSAPP_API_URL,
            headers=headers,
            json=payload,
            timeout=10
        )
        
        response.raise_for_status()
        
        result = response.json()
        logger.info(f"WhatsApp template message sent successfully to {to}")
        
        log_api_call(
            'whatsapp',
            WHATSAPP_API_URL,
            method='POST',
            success=True,
            recipient=to,
            message_id=result.get('messages', [{}])[0].get('id')
        )
        
        return result
    
    except requests.exceptions.Timeout as e:
        error_msg = f"WhatsApp API timeout: {str(e)}"
        logger.error(error_msg)
        
        from .logging_config import log_api_call
        log_api_call(
            'whatsapp',
            WHATSAPP_API_URL,
            method='POST',
            success=False,
            error=error_msg,
            recipient=to
        )
        
        return {'error': error_msg, 'success': False}
    
    except requests.exceptions.RequestException as e:
        error_msg = f"Error sending WhatsApp message: {str(e)}"
        logger.error(error_msg)
        
        from .logging_config import log_api_call
        log_api_call(
            'whatsapp',
            WHATSAPP_API_URL,
            method='POST',
            success=False,
            error=error_msg,
            recipient=to
        )
        
        return {'error': error_msg, 'success': False}


def send_whatsapp_message(
    to: str,
    message: str,
    preview_url: bool = False
) -> Dict[str, Any]:
    """
    Sends a text message via WhatsApp Cloud API
    
    NOTE: Free-form text messages require Business Account approval.
    For development, use send_whatsapp_template() instead.
    
    Args:
        to: Recipient phone number in E.164 format (e.g., +1234567890)
        message: Message text to send
        preview_url: Whether to show URL preview (default: False)
    
    Returns:
        Dict containing API response
    
    Raises:
        Exception: If message sending fails
    """
    if not validate_whatsapp_config():
        raise Exception('WhatsApp API is not properly configured')
    
    # Remove '+' from phone number if present
    to = to.replace('+', '')
    
    headers = {
        'Authorization': f'Bearer {WHATSAPP_API_TOKEN}',
        'Content-Type': 'application/json',
    }
    
    payload = {
        'messaging_product': 'whatsapp',
        'recipient_type': 'individual',
        'to': to,
        'type': 'text',
        'text': {
            'preview_url': preview_url,
            'body': message
        }
    }
    
    try:
        from .logging_config import log_api_call
        
        response = requests.post(
            WHATSAPP_API_URL,
            headers=headers,
            json=payload,
            timeout=10
        )
        
        response.raise_for_status()
        
        result = response.json()
        logger.info(f"WhatsApp message sent successfully to {to}")
        
        # Log successful API call
        log_api_call(
            'whatsapp',
            WHATSAPP_API_URL,
            method='POST',
            success=True,
            recipient=to,
            message_id=result.get('messages', [{}])[0].get('id')
        )
        
        return result
    
    except requests.exceptions.Timeout as e:
        error_msg = f"WhatsApp API timeout: {str(e)}"
        logger.error(error_msg)
        
        from .logging_config import log_api_call
        log_api_call(
            'whatsapp',
            WHATSAPP_API_URL,
            method='POST',
            success=False,
            error=error_msg,
            recipient=to
        )
        
        # Don't raise - allow graceful degradation
        return {'error': error_msg, 'success': False}
    
    except requests.exceptions.RequestException as e:
        error_msg = f"Error sending WhatsApp message: {str(e)}"
        logger.error(error_msg)
        
        from .logging_config import log_api_call
        log_api_call(
            'whatsapp',
            WHATSAPP_API_URL,
            method='POST',
            success=False,
            error=error_msg,
            recipient=to
        )
        
        # Don't raise - allow graceful degradation
        return {'error': error_msg, 'success': False}


def format_currency(amount: Decimal) -> str:
    """
    Formats a decimal amount as currency
    
    Args:
        amount: Decimal amount to format
    
    Returns:
        str: Formatted currency string (e.g., "₹1,234.56")
    """
    return f"₹{amount:,.2f}"


def format_quotation_message(
    customer_name: str,
    order_number: str,
    items: List[Dict[str, Any]],
    subtotal: Decimal,
    discount: Decimal,
    total: Decimal
) -> str:
    """
    Formats a quotation message for WhatsApp
    
    Args:
        customer_name: Name of the customer
        order_number: Order number
        items: List of order items with product details
        subtotal: Subtotal amount
        discount: Discount amount
        total: Total amount after discount
    
    Returns:
        str: Formatted quotation message
    """
    message_lines = [
        f"Hello {customer_name}!",
        "",
        "Thank you for your order with DravoHome!",
        "",
        f"Order Number: {order_number}",
        "",
        "Your Quotation:",
        "-------------------",
        ""
    ]
    
    # Add each item
    for idx, item in enumerate(items, 1):
        product_name = item.get('product_name', 'Product')
        quantity = item.get('quantity', 1)
        unit_price = item.get('unit_price', Decimal('0'))
        item_total = item.get('total', Decimal('0'))
        
        message_lines.extend([
            f"{idx}. {product_name}",
            f"   Quantity: {quantity}",
            f"   Price: {format_currency(unit_price)} each",
            f"   Subtotal: {format_currency(item_total)}",
            ""
        ])
    
    message_lines.extend([
        "-------------------",
        f"Subtotal: {format_currency(subtotal)}"
    ])
    
    if discount > 0:
        message_lines.append(f"Discount: -{format_currency(discount)}")
    
    message_lines.extend([
        f"Total Amount: {format_currency(total)}",
        "",
        "-------------------",
        "",
        "Our team will contact you shortly to confirm your order and arrange delivery.",
        "",
        "If you have any questions, feel free to reach out!",
        "",
        "Thank you for choosing DravoHome!"
    ])
    
    return "\n".join(message_lines)


def send_whatsapp_image(
    to: str,
    image_url: str,
    caption: str = ''
) -> Dict[str, Any]:
    """
    Sends an image message via WhatsApp Cloud API
    
    Args:
        to: Recipient phone number in E.164 format (e.g., +1234567890)
        image_url: URL of the image to send
        caption: Optional caption for the image
    
    Returns:
        Dict containing API response
    """
    if not validate_whatsapp_config():
        raise Exception('WhatsApp API is not properly configured')
    
    # Remove '+' from phone number if present
    to = to.replace('+', '')
    
    headers = {
        'Authorization': f'Bearer {WHATSAPP_API_TOKEN}',
        'Content-Type': 'application/json',
    }
    
    payload = {
        'messaging_product': 'whatsapp',
        'recipient_type': 'individual',
        'to': to,
        'type': 'image',
        'image': {
            'link': image_url
        }
    }
    
    if caption:
        payload['image']['caption'] = caption
    
    try:
        from .logging_config import log_api_call
        
        response = requests.post(
            WHATSAPP_API_URL,
            headers=headers,
            json=payload,
            timeout=10
        )
        
        response.raise_for_status()
        
        result = response.json()
        logger.info(f"WhatsApp image sent successfully to {to}")
        
        log_api_call(
            'whatsapp',
            WHATSAPP_API_URL,
            method='POST',
            success=True,
            recipient=to,
            message_id=result.get('messages', [{}])[0].get('id')
        )
        
        return result
    
    except requests.exceptions.Timeout as e:
        error_msg = f"WhatsApp API timeout: {str(e)}"
        logger.error(error_msg)
        
        from .logging_config import log_api_call
        log_api_call(
            'whatsapp',
            WHATSAPP_API_URL,
            method='POST',
            success=False,
            error=error_msg,
            recipient=to
        )
        
        return {'error': error_msg, 'success': False}
    
    except requests.exceptions.RequestException as e:
        error_msg = f"Error sending WhatsApp image: {str(e)}"
        logger.error(error_msg)
        
        from .logging_config import log_api_call
        log_api_call(
            'whatsapp',
            WHATSAPP_API_URL,
            method='POST',
            success=False,
            error=error_msg,
            recipient=to
        )
        
        return {'error': error_msg, 'success': False}


def send_quotation(
    phone_number: str,
    customer_name: str,
    order_number: str,
    items: List[Dict[str, Any]],
    subtotal: Decimal,
    discount: Decimal,
    total: Decimal,
    image_url: str = None
) -> Dict[str, Any]:
    """
    Sends order quotation notification via WhatsApp template
    
    Uses 'dravohome_quotation' template with parameters:
    {{1}} = customer_name, {{2}} = order_number, {{3}} = total_amount
    Header: product image (optional)
    """
    logger.info(f"Sending quotation for {order_number} to {phone_number}")
    
    # Try to get first product image if not provided
    if not image_url and items:
        image_url = items[0].get('image_url') or items[0].get('main_image')
    
    try:
        result = send_whatsapp_template(
            to=phone_number,
            template_name='dravohome_quotation',
            language_code='en_US',
            parameters=[customer_name, order_number, format_currency(total)],
            image_url=image_url
        )
        
        if result.get('error'):
            logger.error(f"Failed to send quotation: {result.get('error')}")
            return {'success': False, 'error': result.get('error')}
        
        logger.info(f"Quotation sent successfully for {order_number}")
        return {'success': True, 'message_id': result.get('messages', [{}])[0].get('id')}
        
    except Exception as e:
        logger.error(f"Error sending quotation: {str(e)}", exc_info=True)
        return {'error': str(e), 'success': False}


def format_tracking_update_message(
    customer_name: str,
    order_number: str,
    stage: str,
    stage_display: str
) -> str:
    """
    Formats an order tracking update message
    
    Args:
        customer_name: Name of the customer
        order_number: Order number
        stage: Order stage code
        stage_display: Human-readable stage name
    
    Returns:
        str: Formatted tracking update message
    """
    stage_messages = {
        'order_received': {
            'emoji': '✅',
            'message': 'We have received your order and are preparing it for processing.'
        },
        'processing': {
            'emoji': '📦',
            'message': 'Your order is being processed and prepared for shipment.'
        },
        'shipped': {
            'emoji': '🚚',
            'message': 'Your order has been shipped and is on its way to you!'
        },
        'delivered': {
            'emoji': '🎉',
            'message': 'Your order has been delivered! We hope you love your new furniture!'
        }
    }
    
    stage_info = stage_messages.get(stage, {
        'emoji': '📋',
        'message': 'Your order status has been updated.'
    })
    
    message_lines = [
        f"Hello {customer_name}! 👋",
        "",
        f"*Order Update* {stage_info['emoji']}",
        "",
        f"*Order Number:* {order_number}",
        f"*Status:* {stage_display}",
        "",
        stage_info['message'],
        "",
        "Thank you for choosing DravoHome! ✨"
    ]
    
    return "\n".join(message_lines)


def send_tracking_update(
    phone_number: str,
    customer_name: str,
    order_number: str,
    stage: str,
    stage_display: str
) -> Dict[str, Any]:
    """
    Sends an order tracking update via WhatsApp template
    
    Uses 'dravohome_order_update' template with parameters:
    {{1}} = name, {{2}} = emoji, {{3}} = order_number, {{4}} = status, {{5}} = detail
    """
    stage_info = {
        'order_received': ('✅', 'We have received your order and are preparing it for processing.'),
        'processing': ('📦', 'Your order is being processed and prepared for shipment.'),
        'shipped': ('🚚', 'Your order has been shipped and is on its way to you!'),
        'delivered': ('🎉', 'Your order has been delivered! We hope you love your new furniture!'),
    }
    
    emoji, detail = stage_info.get(stage, ('📋', 'Your order status has been updated.'))
    
    return send_whatsapp_template(
        to=phone_number,
        template_name='dravohome_order_update',
        language_code='en_US',
        parameters=[customer_name, emoji, order_number, stage_display, detail]
    )


def send_order_confirmation(
    phone_number: str,
    customer_name: str,
    order_number: str,
    image_url: str = None
) -> Dict[str, Any]:
    """
    Sends an order confirmation via WhatsApp template
    
    Uses 'dravohome_order_confirm' template with parameters:
    {{1}} = customer_name, {{2}} = order_number
    Header: product image (optional)
    """
    return send_whatsapp_template(
        to=phone_number,
        template_name='dravohome_order_confirm',
        language_code='en_US',
        parameters=[customer_name, order_number],
        image_url=image_url
    )
