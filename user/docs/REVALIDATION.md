# Cache Revalidation Guide

This document explains how to use the on-demand cache revalidation endpoint to refresh cached data in the Next.js application.

## Overview

The application uses Next.js caching with a 1-hour revalidation period for most dynamic content (products, collections, categories, blogs). When content is updated in the backend, you can trigger immediate cache revalidation without waiting for the automatic revalidation period.

## Configuration

### Environment Variable

Set the `REVALIDATE_SECRET` environment variable in your `.env.local` (development) or production environment:

```bash
REVALIDATE_SECRET=your-secure-random-string
```

**Important:** Use a strong, random secret in production. You can generate one using:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## API Endpoint

**URL:** `POST /api/revalidate`

**Headers:**
- `Content-Type: application/json`
- `x-revalidate-secret: <your-secret>`

**Request Body:**
```json
{
  "type": "path" | "tag",
  "value": "string"
}
```

## Revalidation Types

### 1. Path-based Revalidation

Revalidates a specific page path.

**Example:**
```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: your-secret-key-change-in-production" \
  -d '{"type": "path", "value": "/product/sofa-set"}'
```

**Use cases:**
- Revalidate homepage: `{"type": "path", "value": "/"}`
- Revalidate product page: `{"type": "path", "value": "/product/sofa-set"}`
- Revalidate collection: `{"type": "path", "value": "/collections/living-room"}`
- Revalidate blog post: `{"type": "path", "value": "/blogs/design-tips"}`

### 2. Tag-based Revalidation

Revalidates all pages that use a specific cache tag. This is more efficient when multiple pages need to be updated.

**Example:**
```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: your-secret-key-change-in-production" \
  -d '{"type": "tag", "value": "products"}'
```

**Available cache tags:**
- `products` - All product-related pages
- `collections` - All collection pages
- `categories` - All category pages
- `blogs` - All blog pages
- `brands` - All brand pages
- `offers` - All offer pages
- `product-{slug}` - Specific product (e.g., `product-sofa-set`)
- `collection-{slug}` - Specific collection
- `category-{slug}` - Specific category
- `blog-{slug}` - Specific blog post

## Response Format

### Success Response

```json
{
  "revalidated": true,
  "type": "path",
  "value": "/product/sofa-set",
  "timestamp": "2024-03-06T10:30:00.000Z"
}
```

### Error Responses

**Invalid Secret (401):**
```json
{
  "error": "Invalid secret"
}
```

**Missing Fields (400):**
```json
{
  "error": "Missing required fields: type and value"
}
```

**Invalid Type (400):**
```json
{
  "error": "Invalid type. Must be \"path\" or \"tag\""
}
```

## Integration with Backend

You can integrate this endpoint with your Django backend to automatically revalidate caches when content is updated.

### Example: Django Signal

```python
from django.db.models.signals import post_save
from django.dispatch import receiver
import requests
import os

@receiver(post_save, sender=Product)
def revalidate_product_cache(sender, instance, **kwargs):
    """Revalidate Next.js cache when product is updated"""
    revalidate_url = os.getenv('NEXTJS_REVALIDATE_URL')
    revalidate_secret = os.getenv('NEXTJS_REVALIDATE_SECRET')
    
    if not revalidate_url or not revalidate_secret:
        return
    
    try:
        # Revalidate specific product
        requests.post(
            revalidate_url,
            json={
                'type': 'tag',
                'value': f'product-{instance.slug}'
            },
            headers={
                'x-revalidate-secret': revalidate_secret
            },
            timeout=5
        )
        
        # Also revalidate all products
        requests.post(
            revalidate_url,
            json={
                'type': 'tag',
                'value': 'products'
            },
            headers={
                'x-revalidate-secret': revalidate_secret
            },
            timeout=5
        )
    except Exception as e:
        print(f"Failed to revalidate cache: {e}")
```

## Health Check

You can check if the revalidation endpoint is configured correctly:

```bash
curl http://localhost:3000/api/revalidate
```

**Response:**
```json
{
  "status": "ok",
  "message": "Revalidation endpoint is active",
  "configured": true
}
```

## Best Practices

1. **Use tag-based revalidation** when multiple pages need updating (more efficient)
2. **Use path-based revalidation** for single page updates
3. **Keep the secret secure** - never commit it to version control
4. **Handle errors gracefully** in your backend integration
5. **Use timeouts** when calling the endpoint from your backend
6. **Log revalidation events** for debugging and monitoring

## Troubleshooting

### Cache not updating

1. Verify the secret matches in both environments
2. Check the response status code and error message
3. Ensure the path or tag value is correct
4. Check Next.js logs for any errors

### 401 Unauthorized

- The `x-revalidate-secret` header doesn't match `REVALIDATE_SECRET`
- Verify the secret is set correctly in your environment

### 500 Internal Server Error

- `REVALIDATE_SECRET` is not configured
- Check Next.js server logs for details
