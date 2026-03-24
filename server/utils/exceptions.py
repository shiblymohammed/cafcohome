"""
Custom Exception Handler for DRF

Provides standardized error responses across all API endpoints
"""

from rest_framework.views import exception_handler
from rest_framework.exceptions import ValidationError, AuthenticationFailed, PermissionDenied, NotFound
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from django.http import Http404
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns standardized error responses.
    
    Error response format:
    {
        "error": {
            "code": "ERROR_CODE",
            "message": "Human-readable error message",
            "details": {...}  # Optional field-specific errors
        }
    }
    """
    
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Log the exception
    request = context.get('request')
    view = context.get('view')
    
    log_message = f"Exception in {view.__class__.__name__ if view else 'Unknown'}: {str(exc)}"
    if request:
        log_message += f" | Method: {request.method} | Path: {request.path}"
    
    logger.error(log_message, exc_info=True)
    
    # If response is None, it's not a DRF exception
    if response is None:
        # Handle Django's ObjectDoesNotExist
        if isinstance(exc, (ObjectDoesNotExist, Http404)):
            return Response(
                {
                    'error': {
                        'code': 'NOT_FOUND',
                        'message': 'The requested resource was not found'
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Handle unexpected exceptions
        logger.critical(f"Unhandled exception: {str(exc)}", exc_info=True)
        return Response(
            {
                'error': {
                    'code': 'INTERNAL_ERROR',
                    'message': 'An unexpected error occurred. Please try again later.'
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Standardize the error response format
    error_data = {
        'error': {
            'code': get_error_code(exc),
            'message': get_error_message(exc, response),
        }
    }
    
    # Add field-specific errors for validation errors
    if isinstance(exc, ValidationError):
        error_data['error']['details'] = response.data
    
    response.data = error_data
    
    return response


def get_error_code(exc):
    """Get standardized error code based on exception type."""
    
    if isinstance(exc, ValidationError):
        return 'VALIDATION_ERROR'
    elif isinstance(exc, AuthenticationFailed):
        return 'AUTHENTICATION_ERROR'
    elif isinstance(exc, PermissionDenied):
        return 'AUTHORIZATION_ERROR'
    elif isinstance(exc, NotFound):
        return 'NOT_FOUND'
    elif hasattr(exc, 'default_code'):
        return exc.default_code.upper()
    else:
        return 'UNKNOWN_ERROR'


def get_error_message(exc, response):
    """Get user-friendly error message."""
    
    # For validation errors, provide a generic message
    if isinstance(exc, ValidationError):
        return 'Invalid input data'
    
    # Use the exception's detail if available
    if hasattr(exc, 'detail'):
        if isinstance(exc.detail, dict):
            # If detail is a dict, get the first error message
            for key, value in exc.detail.items():
                if isinstance(value, list) and len(value) > 0:
                    return str(value[0])
                return str(value)
        return str(exc.detail)
    
    # Fallback to response data
    if response and response.data:
        if isinstance(response.data, dict):
            return response.data.get('detail', 'An error occurred')
        return str(response.data)
    
    return 'An error occurred'
