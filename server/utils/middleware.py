"""
Custom Middleware

Provides request/response logging and error handling
"""

import logging
import time
import json
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('api.requests')


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log all API requests and responses.
    """
    
    def process_request(self, request):
        """Log incoming request."""
        
        # Store request start time
        request._start_time = time.time()
        
        # Log request details
        log_data = {
            'method': request.method,
            'path': request.path,
            'user': str(request.user) if hasattr(request, 'user') and request.user.is_authenticated else 'Anonymous',
            'ip': self.get_client_ip(request),
        }
        
        # Log request body for POST/PUT/PATCH (excluding sensitive data)
        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                body = json.loads(request.body) if request.body else {}
                # Remove sensitive fields
                sensitive_fields = ['password', 'token', 'access_token']
                for field in sensitive_fields:
                    if field in body:
                        body[field] = '***REDACTED***'
                log_data['body'] = body
            except:
                pass
        
        logger.info(f"Request: {request.method} {request.path}", extra=log_data)
        
        return None
    
    def process_response(self, request, response):
        """Log response."""
        
        # Calculate request duration
        if hasattr(request, '_start_time'):
            duration = time.time() - request._start_time
        else:
            duration = 0
        
        log_data = {
            'method': request.method,
            'path': request.path,
            'status_code': response.status_code,
            'duration_ms': round(duration * 1000, 2),
        }
        
        # Log response
        if response.status_code >= 500:
            logger.error(f"Response: {request.method} {request.path} - {response.status_code}", extra=log_data)
        elif response.status_code >= 400:
            logger.warning(f"Response: {request.method} {request.path} - {response.status_code}", extra=log_data)
        else:
            logger.info(f"Response: {request.method} {request.path} - {response.status_code}", extra=log_data)
        
        return response
    
    def process_exception(self, request, exception):
        """Log exceptions."""
        
        logger.error(
            f"Exception in {request.method} {request.path}: {str(exception)}",
            exc_info=True,
            extra={
                'method': request.method,
                'path': request.path,
                'exception_type': type(exception).__name__,
            }
        )
        
        return None
    
    @staticmethod
    def get_client_ip(request):
        """Get client IP address from request."""
        
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class ErrorHandlingMiddleware(MiddlewareMixin):
    """
    Middleware to catch and handle unexpected errors.
    """
    
    def process_exception(self, request, exception):
        """Handle unexpected exceptions."""
        
        logger.critical(
            f"Unhandled exception in {request.method} {request.path}: {str(exception)}",
            exc_info=True,
            extra={
                'method': request.method,
                'path': request.path,
                'user': str(request.user) if hasattr(request, 'user') and request.user.is_authenticated else 'Anonymous',
            }
        )
        
        # Let Django's default error handling take over
        return None
