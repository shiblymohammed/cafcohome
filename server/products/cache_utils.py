"""
Caching utilities for product queries
"""
from django.core.cache import cache
from django.conf import settings


def get_cache_key(prefix, *args):
    """Generate a cache key from prefix and arguments."""
    return f"{prefix}:{'_'.join(str(arg) for arg in args)}"


def cache_product_list(category=None, subcategory=None, brand=None, timeout=300):
    """Cache decorator for product list queries."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Build cache key from filters
            cache_key = get_cache_key(
                'product_list',
                category or 'all',
                subcategory or 'all',
                brand or 'all'
            )
            
            # Try to get from cache
            result = cache.get(cache_key)
            if result is not None:
                return result
            
            # Execute query and cache result
            result = func(*args, **kwargs)
            cache.set(cache_key, result, timeout)
            return result
        return wrapper
    return decorator


def invalidate_product_cache(product_id=None):
    """Invalidate product-related caches."""
    # In production, you'd want to use cache.delete_pattern or similar
    # For now, we'll just clear specific keys
    cache.delete_many([
        'product_list:all_all_all',
        f'product_detail:{product_id}' if product_id else None,
    ])
