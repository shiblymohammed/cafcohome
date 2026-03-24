"""
Cloudinary Integration Utilities

This module provides utility functions for uploading and managing images
with Cloudinary, including upload helpers and URL generation.
"""

import cloudinary
import cloudinary.uploader
import cloudinary.api
from decouple import config
from typing import Dict, Optional, Any
import logging

logger = logging.getLogger(__name__)

# Configure Cloudinary
cloudinary.config(
    cloud_name=config('CLOUDINARY_CLOUD_NAME', default=''),
    api_key=config('CLOUDINARY_API_KEY', default=''),
    api_secret=config('CLOUDINARY_API_SECRET', default=''),
)


def validate_cloudinary_config() -> bool:
    """
    Validates that Cloudinary is properly configured
    
    Returns:
        bool: True if configuration is valid, False otherwise
    """
    cloud_name = config('CLOUDINARY_CLOUD_NAME', default='')
    api_key = config('CLOUDINARY_API_KEY', default='')
    api_secret = config('CLOUDINARY_API_SECRET', default='')
    
    if not all([cloud_name, api_key, api_secret]):
        logger.warning('Cloudinary configuration is incomplete')
        return False
    
    return True


def upload_image(
    file,
    folder: str = 'cafcohome',
    public_id: Optional[str] = None,
    transformation: Optional[Dict[str, Any]] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Uploads an image to Cloudinary
    
    Args:
        file: File object or file path to upload
        folder: Cloudinary folder to upload to (default: 'cafcohome')
        public_id: Optional custom public ID for the image
        transformation: Optional transformation to apply during upload
        **kwargs: Additional Cloudinary upload parameters
    
    Returns:
        Dict containing upload response with url, public_id, etc.
    
    Raises:
        Exception: If upload fails
    """
    if not validate_cloudinary_config():
        raise Exception('Cloudinary is not properly configured')
    
    try:
        upload_params = {
            'folder': folder,
            'resource_type': 'image',
            **kwargs
        }
        
        if public_id:
            upload_params['public_id'] = public_id
        
        if transformation:
            upload_params['transformation'] = transformation
        
        result = cloudinary.uploader.upload(file, **upload_params)
        
        logger.info(f"Successfully uploaded image: {result.get('public_id')}")
        
        return {
            'url': result.get('secure_url'),
            'public_id': result.get('public_id'),
            'width': result.get('width'),
            'height': result.get('height'),
            'format': result.get('format'),
            'resource_type': result.get('resource_type'),
        }
    
    except Exception as e:
        logger.error(f"Error uploading image to Cloudinary: {str(e)}")
        raise


def delete_image(public_id: str) -> bool:
    """
    Deletes an image from Cloudinary
    
    Args:
        public_id: The public ID of the image to delete
    
    Returns:
        bool: True if deletion was successful, False otherwise
    """
    if not validate_cloudinary_config():
        logger.warning('Cloudinary is not properly configured')
        return False
    
    try:
        result = cloudinary.uploader.destroy(public_id)
        
        if result.get('result') == 'ok':
            logger.info(f"Successfully deleted image: {public_id}")
            return True
        else:
            logger.warning(f"Failed to delete image: {public_id}")
            return False
    
    except Exception as e:
        logger.error(f"Error deleting image from Cloudinary: {str(e)}")
        return False


def get_image_url(
    public_id: str,
    width: Optional[int] = None,
    height: Optional[int] = None,
    crop: str = 'fill',
    quality: str = 'auto',
    format: str = 'auto',
    **kwargs
) -> str:
    """
    Generates a Cloudinary URL with transformations
    
    Args:
        public_id: The public ID of the image
        width: Desired width
        height: Desired height
        crop: Crop mode (fill, fit, scale, etc.)
        quality: Image quality (auto, or 1-100)
        format: Image format (auto, webp, jpg, png)
        **kwargs: Additional transformation parameters
    
    Returns:
        str: Transformed image URL
    """
    transformation = {}
    
    if width:
        transformation['width'] = width
    if height:
        transformation['height'] = height
    if crop:
        transformation['crop'] = crop
    if quality:
        transformation['quality'] = quality
    if format:
        transformation['fetch_format'] = format
    
    transformation.update(kwargs)
    
    url = cloudinary.CloudinaryImage(public_id).build_url(**transformation)
    
    return url


def get_responsive_image_url(public_id: str, width: int) -> str:
    """
    Generates a responsive image URL optimized for web
    
    Args:
        public_id: The public ID of the image
        width: Desired width
    
    Returns:
        str: Optimized image URL
    """
    return get_image_url(
        public_id,
        width=width,
        quality='auto',
        format='auto',
        crop='fill'
    )


def get_thumbnail_url(public_id: str, size: int = 200) -> str:
    """
    Generates a thumbnail URL
    
    Args:
        public_id: The public ID of the image
        size: Thumbnail size (default: 200)
    
    Returns:
        str: Thumbnail URL
    """
    return get_image_url(
        public_id,
        width=size,
        height=size,
        crop='thumb',
        gravity='auto',
        quality='auto',
        format='auto'
    )


def upload_product_image(
    file,
    product_slug: str,
    index: int = 0
) -> Dict[str, Any]:
    """
    Uploads a product image with standardized naming and transformations
    
    Args:
        file: File object to upload
        product_slug: Product slug for organizing images
        index: Image index for multiple product images
    
    Returns:
        Dict containing upload response
    """
    public_id = f"{product_slug}_{index}"
    
    return upload_image(
        file,
        folder='cafcohome/products',
        public_id=public_id,
        transformation={
            'quality': 'auto',
            'fetch_format': 'auto',
        }
    )


def upload_collection_image(file, collection_slug: str) -> Dict[str, Any]:
    """
    Uploads a collection image
    
    Args:
        file: File object to upload
        collection_slug: Collection slug for organizing images
    
    Returns:
        Dict containing upload response
    """
    return upload_image(
        file,
        folder='cafcohome/collections',
        public_id=collection_slug
    )


def upload_brand_logo(file, brand_slug: str) -> Dict[str, Any]:
    """
    Uploads a brand logo
    
    Args:
        file: File object to upload
        brand_slug: Brand slug for organizing images
    
    Returns:
        Dict containing upload response
    """
    return upload_image(
        file,
        folder='cafcohome/brands',
        public_id=brand_slug
    )


def upload_blog_image(file, blog_slug: str) -> Dict[str, Any]:
    """
    Uploads a blog post featured image
    
    Args:
        file: File object to upload
        blog_slug: Blog post slug for organizing images
    
    Returns:
        Dict containing upload response
    """
    return upload_image(
        file,
        folder='cafcohome/blog',
        public_id=blog_slug
    )
