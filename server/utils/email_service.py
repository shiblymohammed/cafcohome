"""
Email Service Module

Comprehensive email service for sending transactional and marketing emails
with HTML templates, attachments, and logging.
"""

import logging
from typing import List, Dict, Any, Optional
from django.core.mail import EmailMultiAlternatives, send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags
from decimal import Decimal

logger = logging.getLogger(__name__)


class EmailService:
    """Service class for sending emails with templates and logging."""
    
    @staticmethod
    def send_email(
        subject: str,
        to_emails: List[str],
        template_name: str = None,
        context: Dict[str, Any] = None,
        plain_message: str = None,
        from_email: str = None,
        attachments: List[tuple] = None,
        cc: List[str] = None,
        bcc: List[str] = None
    ) -> bool:
        """
        Send an email with optional HTML template.
        
        Args:
            subject: Email subject
            to_emails: List of recipient email addresses
            template_name: Path to HTML template (e.g., 'emails/order_confirmation.html')
            context: Context data for template rendering
            plain_message: Plain text message (if no template)
            from_email: Sender email (defaults to DEFAULT_FROM_EMAIL)
            attachments: List of (filename, content, mimetype) tuples
            cc: List of CC email addresses
            bcc: List of BCC email addresses
        
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            from_email = from_email or settings.DEFAULT_FROM_EMAIL
            context = context or {}
            
            # Render HTML template if provided
            if template_name:
                html_content = render_to_string(template_name, context)
                text_content = strip_tags(html_content)
            else:
                html_content = None
                text_content = plain_message or ''
            
            # Create email message
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=from_email,
                to=to_emails,
                cc=cc,
                bcc=bcc
            )
            
            # Attach HTML version if available
            if html_content:
                email.attach_alternative(html_content, "text/html")
            
            # Add attachments if provided
            if attachments:
                for filename, content, mimetype in attachments:
                    email.attach(filename, content, mimetype)
            
            # Send email
            email.send(fail_silently=False)
            
            logger.info(f"Email sent successfully: {subject} to {', '.join(to_emails)}")
            
            # Log successful send
            EmailService._log_email(
                subject=subject,
                to_emails=to_emails,
                template_name=template_name,
                success=True
            )
            
            return True
            
        except Exception as e:
            error_msg = f"Failed to send email '{subject}': {str(e)}"
            logger.error(error_msg, exc_info=True)
            
            # Log failed send
            EmailService._log_email(
                subject=subject,
                to_emails=to_emails,
                template_name=template_name,
                success=False,
                error=error_msg
            )
            
            return False
    
    @staticmethod
    def _log_email(
        subject: str,
        to_emails: List[str],
        template_name: str = None,
        success: bool = True,
        error: str = None
    ):
        """Log email send attempt."""
        try:
            from .logging_config import log_api_call
            log_api_call(
                'email',
                'send_email',
                method='SMTP',
                success=success,
                subject=subject,
                to_emails=', '.join(to_emails),
                template=template_name,
                error=error
            )
        except Exception as e:
            logger.warning(f"Failed to log email: {str(e)}")
    
    @staticmethod
    def send_order_confirmation(order) -> bool:
        """
        Send order confirmation email to customer.
        
        Args:
            order: Order instance
        
        Returns:
            bool: True if email sent successfully
        """
        try:
            context = {
                'customer_name': order.user.name,
                'order_number': order.order_number,
                'order_date': order.created_at,
                'items': order.items.all(),
                'subtotal': order.subtotal,
                'discount': order.discount,
                'total': order.total,
                'delivery_address': order.delivery_address,
                'phone_number': order.phone_number,
            }
            
            return EmailService.send_email(
                subject=f'Order Confirmation - {order.order_number}',
                to_emails=[order.user.email],
                template_name='emails/order_confirmation.html',
                context=context
            )
        except Exception as e:
            logger.error(f"Failed to send order confirmation for {order.order_number}: {str(e)}")
            return False
    
    @staticmethod
    def send_order_status_update(order, old_stage: str, new_stage: str) -> bool:
        """
        Send order status update email to customer.
        
        Args:
            order: Order instance
            old_stage: Previous order stage
            new_stage: New order stage
        
        Returns:
            bool: True if email sent successfully
        """
        try:
            stage_messages = {
                'order_received': {
                    'title': 'Order Received',
                    'message': 'We have received your order and are preparing it for processing.',
                    'icon': '✅'
                },
                'processing': {
                    'title': 'Order Processing',
                    'message': 'Your order is being processed and prepared for shipment.',
                    'icon': '📦'
                },
                'shipped': {
                    'title': 'Order Shipped',
                    'message': 'Your order has been shipped and is on its way to you!',
                    'icon': '🚚'
                },
                'delivered': {
                    'title': 'Order Delivered',
                    'message': 'Your order has been delivered! We hope you love your new furniture!',
                    'icon': '🎉'
                }
            }
            
            stage_info = stage_messages.get(new_stage, {
                'title': 'Order Update',
                'message': 'Your order status has been updated.',
                'icon': '📋'
            })
            
            context = {
                'customer_name': order.user.name,
                'order_number': order.order_number,
                'old_stage': dict(order.STAGE_CHOICES).get(old_stage, old_stage),
                'new_stage': dict(order.STAGE_CHOICES).get(new_stage, new_stage),
                'stage_title': stage_info['title'],
                'stage_message': stage_info['message'],
                'stage_icon': stage_info['icon'],
                'order_date': order.created_at,
                'items': order.items.all(),
                'total': order.total,
            }
            
            return EmailService.send_email(
                subject=f'Order Update - {order.order_number} - {stage_info["title"]}',
                to_emails=[order.user.email],
                template_name='emails/order_status_update.html',
                context=context
            )
        except Exception as e:
            logger.error(f"Failed to send status update for {order.order_number}: {str(e)}")
            return False
    
    @staticmethod
    def send_otp_email(email: str, otp: str, name: str = None) -> bool:
        """
        Send OTP verification email.
        
        Args:
            email: User's email address
            otp: 6-digit OTP code
            name: User's name (optional)
        
        Returns:
            bool: True if email sent successfully
        """
        try:
            context = {
                'email': email,
                'otp': otp,
                'user_name': name,
                'expiry_minutes': 10,
            }
            
            return EmailService.send_email(
                subject='Verify Your Email - DravoHome',
                to_emails=[email],
                template_name='emails/otp_verification.html',
                context=context
            )
        except Exception as e:
            logger.error(f"Failed to send OTP email to {email}: {str(e)}")
            return False
    
    @staticmethod
    def send_welcome_email(user) -> bool:
        """
        Send welcome email to new user.
        
        Args:
            user: User instance
        
        Returns:
            bool: True if email sent successfully
        """
        try:
            context = {
                'user_name': user.name,
                'user_email': user.email,
            }
            
            return EmailService.send_email(
                subject='Welcome to DravoHome! 🏠',
                to_emails=[user.email],
                template_name='emails/welcome.html',
                context=context
            )
        except Exception as e:
            logger.error(f"Failed to send welcome email to {user.email}: {str(e)}")
            return False
    
    @staticmethod
    def send_password_reset_email(user, reset_link: str) -> bool:
        """
        Send password reset email.
        
        Args:
            user: User instance
            reset_link: Password reset link
        
        Returns:
            bool: True if email sent successfully
        """
        try:
            context = {
                'user_name': user.name,
                'reset_link': reset_link,
            }
            
            return EmailService.send_email(
                subject='Password Reset Request - DravoHome',
                to_emails=[user.email],
                template_name='emails/password_reset.html',
                context=context
            )
        except Exception as e:
            logger.error(f"Failed to send password reset email to {user.email}: {str(e)}")
            return False
    
    @staticmethod
    def send_low_stock_alert(variant, current_stock: int) -> bool:
        """
        Send low stock alert to admin.
        
        Args:
            variant: ProductVariant instance
            current_stock: Current stock quantity
        
        Returns:
            bool: True if email sent successfully
        """
        try:
            context = {
                'product_name': variant.product.name,
                'variant_color': variant.color,
                'variant_material': variant.material,
                'sku': variant.sku,
                'current_stock': current_stock,
                'low_stock_threshold': variant.low_stock_threshold,
                'reorder_point': variant.reorder_point,
                'reorder_quantity': variant.reorder_quantity,
            }
            
            return EmailService.send_email(
                subject=f'Low Stock Alert - {variant.product.name}',
                to_emails=[settings.ADMIN_EMAIL],
                template_name='emails/low_stock_alert.html',
                context=context
            )
        except Exception as e:
            logger.error(f"Failed to send low stock alert for {variant.sku}: {str(e)}")
            return False
    
    @staticmethod
    def send_newsletter(
        subject: str,
        content: str,
        recipient_emails: List[str]
    ) -> Dict[str, Any]:
        """
        Send newsletter to multiple recipients.
        
        Args:
            subject: Newsletter subject
            content: Newsletter HTML content
            recipient_emails: List of recipient emails
        
        Returns:
            dict: {'success': int, 'failed': int, 'total': int}
        """
        success_count = 0
        failed_count = 0
        
        for email in recipient_emails:
            try:
                result = EmailService.send_email(
                    subject=subject,
                    to_emails=[email],
                    template_name='emails/newsletter.html',
                    context={'content': content}
                )
                if result:
                    success_count += 1
                else:
                    failed_count += 1
            except Exception as e:
                logger.error(f"Failed to send newsletter to {email}: {str(e)}")
                failed_count += 1
        
        logger.info(f"Newsletter sent: {success_count} success, {failed_count} failed out of {len(recipient_emails)}")
        
        return {
            'success': success_count,
            'failed': failed_count,
            'total': len(recipient_emails)
        }


# Convenience functions for backward compatibility
def send_contact_form_email(name: str, email: str, phone: str, message: str) -> bool:
    """Send contact form submission email to admin."""
    context = {
        'name': name,
        'email': email,
        'phone': phone,
        'message': message,
    }
    
    return EmailService.send_email(
        subject=f'Contact Form Submission from {name}',
        to_emails=[settings.ADMIN_EMAIL],
        template_name='emails/contact_form.html',
        context=context
    )
