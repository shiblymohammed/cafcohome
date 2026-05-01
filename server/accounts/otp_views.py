"""
OTP Views for Email Verification

API endpoints for sending and verifying OTP codes.
"""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle
from .otp_service import OTPService
import logging

logger = logging.getLogger(__name__)


class OTPRateThrottle(AnonRateThrottle):
    """Throttle for OTP endpoints - 5 requests per minute."""
    rate = '5/minute'
    scope = 'otp'


class SendOTPView(APIView):
    """Send OTP to email address for verification."""
    
    permission_classes = [AllowAny]
    throttle_classes = [OTPRateThrottle]
    
    def post(self, request):
        """
        Send OTP to email address.
        
        Request body:
        {
            "email": "user@example.com",
            "name": "John Doe" (optional)
        }
        """
        email = request.data.get('email')
        name = request.data.get('name')
        
        if not email:
            return Response(
                {
                    'error': {
                        'code': 'VALIDATION_ERROR',
                        'message': 'Email is required'
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate email format
        from django.core.validators import validate_email
        from django.core.exceptions import ValidationError
        
        try:
            validate_email(email)
        except ValidationError:
            return Response(
                {
                    'error': {
                        'code': 'VALIDATION_ERROR',
                        'message': 'Invalid email format'
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Send OTP
        result = OTPService.send_otp(email, name)
        
        if result['success']:
            return Response({
                'message': result['message'],
                'expires_at': result['expires_at']
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {
                    'error': {
                        'code': 'OTP_SEND_FAILED',
                        'message': result['message'],
                        'cooldown': result.get('cooldown')
                    }
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS if 'cooldown' in result else status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VerifyOTPView(APIView):
    """Verify OTP code."""
    
    permission_classes = [AllowAny]
    throttle_classes = [OTPRateThrottle]
    
    def post(self, request):
        """
        Verify OTP code.
        
        Request body:
        {
            "email": "user@example.com",
            "otp": "123456"
        }
        """
        email = request.data.get('email')
        otp = request.data.get('otp')
        
        if not email or not otp:
            return Response(
                {
                    'error': {
                        'code': 'VALIDATION_ERROR',
                        'message': 'Email and OTP are required'
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify OTP
        result = OTPService.verify_otp(email, otp)
        
        if result['success']:
            return Response({
                'message': result['message'],
                'verified': True
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {
                    'error': {
                        'code': 'OTP_VERIFICATION_FAILED',
                        'message': result['message'],
                        'remaining_attempts': result.get('remaining_attempts')
                    },
                    'verified': False
                },
                status=status.HTTP_400_BAD_REQUEST
            )


class ResendOTPView(APIView):
    """Resend OTP to email address."""
    
    permission_classes = [AllowAny]
    throttle_classes = [OTPRateThrottle]
    
    def post(self, request):
        """
        Resend OTP to email address.
        
        Request body:
        {
            "email": "user@example.com",
            "name": "John Doe" (optional)
        }
        """
        email = request.data.get('email')
        name = request.data.get('name')
        
        if not email:
            return Response(
                {
                    'error': {
                        'code': 'VALIDATION_ERROR',
                        'message': 'Email is required'
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Send new OTP
        result = OTPService.send_otp(email, name)
        
        if result['success']:
            return Response({
                'message': 'OTP resent successfully',
                'expires_at': result['expires_at']
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {
                    'error': {
                        'code': 'OTP_RESEND_FAILED',
                        'message': result['message'],
                        'cooldown': result.get('cooldown')
                    }
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS if 'cooldown' in result else status.HTTP_500_INTERNAL_SERVER_ERROR
            )
