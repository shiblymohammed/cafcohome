"""
Custom Validators

Provides reusable validation functions for common patterns
"""

import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_phone_number(value):
    """
    Validate phone number format.
    
    Accepts formats:
    - +1234567890
    - 1234567890
    - +1 234 567 890
    - (123) 456-7890
    
    Args:
        value: Phone number string
    
    Raises:
        ValidationError: If phone number format is invalid
    """
    # Remove common separators
    cleaned = re.sub(r'[\s\-\(\)]', '', value)
    
    # Remove leading + if present
    if cleaned.startswith('+'):
        cleaned = cleaned[1:]
    
    # Check if remaining characters are digits
    if not cleaned.isdigit():
        raise ValidationError(
            _('Phone number must contain only digits, spaces, hyphens, parentheses, and an optional leading +'),
            code='invalid_phone'
        )
    
    # Check length (typically 10-15 digits)
    if len(cleaned) < 10 or len(cleaned) > 15:
        raise ValidationError(
            _('Phone number must be between 10 and 15 digits'),
            code='invalid_phone_length'
        )


def validate_slug(value):
    """
    Validate slug format (lowercase letters, numbers, hyphens).
    
    Args:
        value: Slug string
    
    Raises:
        ValidationError: If slug format is invalid
    """
    if not re.match(r'^[a-z0-9-]+$', value):
        raise ValidationError(
            _('Slug must contain only lowercase letters, numbers, and hyphens'),
            code='invalid_slug'
        )
    
    if value.startswith('-') or value.endswith('-'):
        raise ValidationError(
            _('Slug cannot start or end with a hyphen'),
            code='invalid_slug'
        )
    
    if '--' in value:
        raise ValidationError(
            _('Slug cannot contain consecutive hyphens'),
            code='invalid_slug'
        )


def validate_positive_decimal(value):
    """
    Validate that a decimal value is positive.
    
    Args:
        value: Decimal value
    
    Raises:
        ValidationError: If value is not positive
    """
    if value <= 0:
        raise ValidationError(
            _('Value must be greater than zero'),
            code='invalid_positive'
        )


def validate_percentage(value):
    """
    Validate that a value is a valid percentage (0-100).
    
    Args:
        value: Decimal value
    
    Raises:
        ValidationError: If value is not between 0 and 100
    """
    if value < 0 or value > 100:
        raise ValidationError(
            _('Percentage must be between 0 and 100'),
            code='invalid_percentage'
        )


def validate_image_url(value):
    """
    Validate that a URL points to an image.
    
    Args:
        value: URL string
    
    Raises:
        ValidationError: If URL doesn't appear to be an image
    """
    if not value:
        return
    
    valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    
    # Check if URL ends with a valid image extension
    if not any(value.lower().endswith(ext) for ext in valid_extensions):
        # Check if it's a Cloudinary URL (which may not have extension)
        if 'cloudinary.com' not in value.lower():
            raise ValidationError(
                _('URL must point to a valid image file'),
                code='invalid_image_url'
            )


def validate_json_structure(value, required_keys=None):
    """
    Validate JSON structure and required keys.
    
    Args:
        value: JSON data (dict or list)
        required_keys: List of required keys (for dict validation)
    
    Raises:
        ValidationError: If JSON structure is invalid
    """
    if required_keys and isinstance(value, dict):
        missing_keys = set(required_keys) - set(value.keys())
        if missing_keys:
            raise ValidationError(
                _(f'Missing required keys: {", ".join(missing_keys)}'),
                code='invalid_json_structure'
            )
