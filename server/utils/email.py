from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def send_contact_form_email(name, email, phone, message):
    """
    Send contact form submission email to admin.
    
    Args:
        name: Contact person's name
        email: Contact person's email
        phone: Contact person's phone number
        message: Contact message
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    subject = f'Contact Form Submission from {name}'
    
    email_message = f"""
    New contact form submission:
    
    Name: {name}
    Email: {email}
    Phone: {phone}
    
    Message:
    {message}
    """
    
    try:
        from .logging_config import log_api_call
        
        send_mail(
            subject=subject,
            message=email_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            fail_silently=False,
        )
        
        logger.info(f'Contact form email sent successfully from {email}')
        
        # Log successful email send
        log_api_call(
            'email',
            'send_mail',
            method='SMTP',
            success=True,
            from_email=email,
            to_email=settings.ADMIN_EMAIL
        )
        
        return True
    except Exception as e:
        error_msg = f'Failed to send contact form email: {str(e)}'
        logger.error(error_msg, exc_info=True)
        
        from .logging_config import log_api_call
        log_api_call(
            'email',
            'send_mail',
            method='SMTP',
            success=False,
            error=error_msg,
            from_email=email,
            to_email=settings.ADMIN_EMAIL
        )
        
        return False
