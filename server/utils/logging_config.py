"""
Logging Configuration

Configures structured logging for the application
"""

import logging
import sys
from datetime import datetime


class ColoredFormatter(logging.Formatter):
    """Custom formatter with colors for console output."""
    
    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
        'RESET': '\033[0m'        # Reset
    }
    
    def format(self, record):
        log_color = self.COLORS.get(record.levelname, self.COLORS['RESET'])
        reset_color = self.COLORS['RESET']
        
        # Add color to level name
        record.levelname = f"{log_color}{record.levelname}{reset_color}"
        
        return super().format(record)


def configure_logging(debug=False):
    """Configure application logging."""
    
    # Root logger configuration
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG if debug else logging.INFO)
    
    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Console handler with colored output
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG if debug else logging.INFO)
    
    console_format = '%(levelname)s [%(asctime)s] %(name)s: %(message)s'
    console_formatter = ColoredFormatter(
        console_format,
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)
    
    # File handler for errors
    try:
        error_handler = logging.FileHandler('logs/error.log')
        error_handler.setLevel(logging.ERROR)
        
        file_format = '%(levelname)s [%(asctime)s] %(name)s (%(filename)s:%(lineno)d): %(message)s'
        file_formatter = logging.Formatter(
            file_format,
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        error_handler.setFormatter(file_formatter)
        root_logger.addHandler(error_handler)
    except Exception as e:
        print(f"Warning: Could not create error log file: {e}")
    
    # Reduce noise from third-party libraries
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('requests').setLevel(logging.WARNING)
    logging.getLogger('django.db.backends').setLevel(logging.WARNING)
    
    return root_logger


# API call logger
def log_api_call(service_name, endpoint, method='POST', success=True, error=None, **kwargs):
    """Log external API calls."""
    
    logger = logging.getLogger(f'api.{service_name}')
    
    log_data = {
        'service': service_name,
        'endpoint': endpoint,
        'method': method,
        'success': success,
        'timestamp': datetime.now().isoformat(),
        **kwargs
    }
    
    if success:
        logger.info(f"API call successful: {service_name} {endpoint}", extra=log_data)
    else:
        logger.error(f"API call failed: {service_name} {endpoint} - {error}", extra=log_data)
