from django.http import JsonResponse
from django.db import connection
from django.conf import settings


def health_check(request):
    """
    Health check endpoint to verify API is running and database is accessible.
    
    Returns:
        JSON response with status and checks
    """
    checks = {
        'api': 'ok',
        'database': 'error',
        'debug_mode': settings.DEBUG
    }
    
    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        checks['database'] = 'ok'
    except Exception as e:
        checks['database'] = f'error: {str(e)}'
    
    # Determine overall status
    status = 'healthy' if checks['database'] == 'ok' else 'unhealthy'
    status_code = 200 if status == 'healthy' else 503
    
    return JsonResponse({
        'status': status,
        'checks': checks
    }, status=status_code)
