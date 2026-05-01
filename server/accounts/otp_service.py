"""
OTP Service for Email Verification

Handles OTP generation, storage, validation, and email sending
for user registration verification.
"""

import random
import logging
from datetime import timedelta
from django.utils import timezone
from django.core.cache import cache
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)


class OTPService:
    """Service for managing OTP-based email verification."""
    
    # OTP Configuration
    OTP_LENGTH = 6
    OTP_EXPIRY_MINUTES = 10
    MAX_ATTEMPTS = 3
    RESEND_COOLDOWN_SECONDS = 60
    
    @staticmethod
    def generate_otp() -> str:
        """
        Generate a random 6-digit OTP.
        
        Returns:
            str: 6-digit OTP
        """
        return ''.join([str(random.randint(0, 9)) for _ in range(OTPService.OTP_LENGTH)])
    
    @staticmethod
    def _get_cache_key(email: str, key_type: str) -> str:
        """Generate cache key for OTP storage."""
        return f"otp_{key_type}_{email.lower()}"
    
    @staticmethod
    def send_otp(email: str, name: str = None) -> Dict[str, Any]:
        """
        Generate and send OTP to email address.
        
        Args:
            email: User's email address
            name: User's name (optional)
        
        Returns:
            dict: {'success': bool, 'message': str, 'expires_at': datetime}
        """
        try:
            # Check if user is in cooldown period
            cooldown_key = OTPService._get_cache_key(email, 'cooldown')
            if cache.get(cooldown_key):
                remaining = cache.ttl(cooldown_key)
                return {
                    'success': False,
                    'message': f'Please wait {remaining} seconds before requesting another OTP',
                    'cooldown': remaining
                }
            
            # Generate OTP
            otp = OTPService.generate_otp()
            
            # Store OTP in cache with expiry
            otp_key = OTPService._get_cache_key(email, 'code')
            attempts_key = OTPService._get_cache_key(email, 'attempts')
            
            cache.set(otp_key, otp, timeout=OTPService.OTP_EXPIRY_MINUTES * 60)
            cache.set(attempts_key, 0, timeout=OTPService.OTP_EXPIRY_MINUTES * 60)
            
            # Set cooldown for resend
            cache.set(cooldown_key, True, timeout=OTPService.RESEND_COOLDOWN_SECONDS)
            
            # Send OTP via email
            from utils.email_service import EmailService
            email_sent = EmailService.send_otp_email(email, otp, name)
            
            if not email_sent:
                return {
                    'success': False,
                    'message': 'Failed to send OTP email. Please try again.'
                }
            
            expires_at = timezone.now() + timedelta(minutes=OTPService.OTP_EXPIRY_MINUTES)
            
            logger.info(f"OTP sent to {email}, expires at {expires_at}")
            
            return {
                'success': True,
                'message': f'OTP sent to {email}. Valid for {OTPService.OTP_EXPIRY_MINUTES} minutes.',
                'expires_at': expires_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to send OTP to {email}: {str(e)}", exc_info=True)
            return {
                'success': False,
                'message': 'Failed to send OTP. Please try again later.'
            }
    
    @staticmethod
    def verify_otp(email: str, otp: str) -> Dict[str, Any]:
        """
        Verify OTP for email address.
        
        Args:
            email: User's email address
            otp: OTP to verify
        
        Returns:
            dict: {'success': bool, 'message': str}
        """
        try:
            otp_key = OTPService._get_cache_key(email, 'code')
            attempts_key = OTPService._get_cache_key(email, 'attempts')
            
            # Get stored OTP
            stored_otp = cache.get(otp_key)
            
            if not stored_otp:
                return {
                    'success': False,
                    'message': 'OTP expired or not found. Please request a new one.'
                }
            
            # Check attempts
            attempts = cache.get(attempts_key, 0)
            
            if attempts >= OTPService.MAX_ATTEMPTS:
                # Clear OTP after max attempts
                cache.delete(otp_key)
                cache.delete(attempts_key)
                
                return {
                    'success': False,
                    'message': 'Maximum verification attempts exceeded. Please request a new OTP.'
                }
            
            # Verify OTP
            if stored_otp == otp:
                # Clear OTP after successful verification
                cache.delete(otp_key)
                cache.delete(attempts_key)
                cache.delete(OTPService._get_cache_key(email, 'cooldown'))
                
                logger.info(f"OTP verified successfully for {email}")
                
                return {
                    'success': True,
                    'message': 'Email verified successfully!'
                }
            else:
                # Increment attempts
                cache.set(attempts_key, attempts + 1, timeout=OTPService.OTP_EXPIRY_MINUTES * 60)
                
                remaining_attempts = OTPService.MAX_ATTEMPTS - (attempts + 1)
                
                return {
                    'success': False,
                    'message': f'Invalid OTP. {remaining_attempts} attempts remaining.',
                    'remaining_attempts': remaining_attempts
                }
                
        except Exception as e:
            logger.error(f"Failed to verify OTP for {email}: {str(e)}", exc_info=True)
            return {
                'success': False,
                'message': 'Verification failed. Please try again.'
            }
    
    @staticmethod
    def clear_otp(email: str):
        """Clear all OTP data for an email address."""
        cache.delete(OTPService._get_cache_key(email, 'code'))
        cache.delete(OTPService._get_cache_key(email, 'attempts'))
        cache.delete(OTPService._get_cache_key(email, 'cooldown'))
        logger.info(f"OTP data cleared for {email}")
