from rest_framework import serializers
from django.utils import timezone
from .models import Offer
from products.models import Product, Category, Subcategory, Brand


class ProductWithPricingSerializer(serializers.ModelSerializer):
    """Serializer for Product with pricing information (for offers)."""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    subcategory_name = serializers.CharField(source='subcategory.name', read_only=True)
    subcategory_slug = serializers.CharField(source='subcategory.slug', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, allow_null=True)
    brand_slug = serializers.CharField(source='brand.slug', read_only=True, allow_null=True)
    
    # Add variant information with pricing
    colors = serializers.SerializerMethodField()
    materials = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    is_in_stock = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    mrp = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'dimensions',
            'category', 'category_name', 'category_slug',
            'subcategory', 'subcategory_name', 'subcategory_slug',
            'brand', 'brand_name', 'brand_slug',
            'colors', 'materials', 'images', 'is_in_stock',
            'price', 'mrp', 'is_bestseller', 'is_hot_selling', 'created_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at']
    
    def get_colors(self, obj):
        """Get unique colors from active variants."""
        return list(set(
            variant.color for variant in obj.variants.filter(is_active=True)
        ))
    
    def get_materials(self, obj):
        """Get unique materials from active variants."""
        return list(set(
            variant.material for variant in obj.variants.filter(is_active=True)
        ))
    
    def get_images(self, obj):
        """Get images from default variant or first active variant."""
        default_variant = obj.variants.filter(is_active=True, is_default=True).first()
        if not default_variant:
            default_variant = obj.variants.filter(is_active=True).first()
        
        if default_variant and default_variant.images:
            return default_variant.images
        return []
    
    def get_is_in_stock(self, obj):
        """Check if any variant is in stock."""
        return obj.variants.filter(is_active=True, stock_quantity__gt=0).exists()
    
    def get_price(self, obj):
        """Get price from default variant or first active variant."""
        default_variant = obj.variants.filter(is_active=True, is_default=True).first()
        if not default_variant:
            default_variant = obj.variants.filter(is_active=True).first()
        
        if default_variant:
            return float(default_variant.price)
        return None
    
    def get_mrp(self, obj):
        """Get MRP from default variant or first active variant."""
        default_variant = obj.variants.filter(is_active=True, is_default=True).first()
        if not default_variant:
            default_variant = obj.variants.filter(is_active=True).first()
        
        if default_variant:
            return float(default_variant.mrp)
        return None


class OfferSerializer(serializers.ModelSerializer):
    """Serializer for Offer model with applicable products."""
    
    is_valid = serializers.SerializerMethodField()
    applicable_products_count = serializers.SerializerMethodField()
    applicable_products = serializers.SerializerMethodField()
    applicable_items_display = serializers.SerializerMethodField()
    days_left = serializers.SerializerMethodField()
    
    class Meta:
        model = Offer
        fields = [
            'id', 'name', 'description', 'image_url', 'discount_percentage', 'apply_to',
            'products', 'collections', 'categories', 'brands',
            'start_date', 'end_date', 'is_active', 'is_featured', 'is_valid',
            'applicable_products_count', 'applicable_products', 'applicable_items_display',
            'days_left', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_is_valid(self, obj):
        """Check if offer is currently valid."""
        return obj.is_valid()
    
    def get_applicable_products_count(self, obj):
        """Get count of products this offer applies to."""
        return obj.get_applicable_products().count()
    
    def get_applicable_products(self, obj):
        """Get list of applicable products with pricing (limited to 50 for performance)."""
        products = obj.get_applicable_products()[:50]
        return ProductWithPricingSerializer(products, many=True).data
    
    def get_applicable_items_display(self, obj):
        """Get display text for applicable items."""
        return obj.get_applicable_items_display()
    
    def get_days_left(self, obj):
        """Get number of days left until offer expires."""
        from django.utils import timezone
        if not obj.is_valid():
            return 0
        delta = obj.end_date - timezone.now()
        return max(0, delta.days)
    
    def validate(self, data):
        """Validate offer data."""
        apply_to = data.get('apply_to')
        
        # Validate that appropriate relations are set based on apply_to
        if apply_to == 'product' and not data.get('products'):
            raise serializers.ValidationError('Products must be specified when apply_to is "product"')
        elif apply_to == 'collection' and not data.get('collections'):
            raise serializers.ValidationError('Collections must be specified when apply_to is "collection"')
        elif apply_to == 'category' and not data.get('categories'):
            raise serializers.ValidationError('Categories must be specified when apply_to is "category"')
        elif apply_to == 'brand' and not data.get('brands'):
            raise serializers.ValidationError('Brands must be specified when apply_to is "brand"')
        
        # Validate date range
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError('End date must be after start date')
        
        return data


class OfferListSerializer(serializers.ModelSerializer):
    """Serializer for Offer list (minimal data)."""
    
    is_valid = serializers.SerializerMethodField()
    applicable_products_count = serializers.SerializerMethodField()
    applicable_items_display = serializers.SerializerMethodField()
    days_left = serializers.SerializerMethodField()
    
    class Meta:
        model = Offer
        fields = [
            'id', 'name', 'description', 'image_url', 'discount_percentage', 'apply_to',
            'products', 'collections', 'categories', 'brands',  # Added ManyToMany fields
            'start_date', 'end_date', 'is_active', 'is_featured', 'is_valid', 
            'applicable_products_count', 'applicable_items_display', 'days_left', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_is_valid(self, obj):
        """Check if offer is currently valid."""
        return obj.is_valid()
    
    def get_applicable_products_count(self, obj):
        """Get count of products this offer applies to."""
        return obj.get_applicable_products().count()
    
    def get_applicable_items_display(self, obj):
        """Get display text for applicable items."""
        return obj.get_applicable_items_display()
    
    def get_days_left(self, obj):
        """Get number of days left until offer expires."""
        from django.utils import timezone
        if not obj.is_valid():
            return 0
        delta = obj.end_date - timezone.now()
        return max(0, delta.days)


class OfferCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating offers."""
    
    class Meta:
        model = Offer
        fields = [
            'name', 'description', 'image_url', 'discount_percentage', 'apply_to',
            'products', 'collections', 'categories', 'brands',
            'start_date', 'end_date', 'is_active', 'is_featured'
        ]
    
    def validate(self, data):
        """Validate offer data."""
        apply_to = data.get('apply_to')
        
        # Validate that appropriate relations are set based on apply_to
        if apply_to == 'product':
            if not data.get('products'):
                raise serializers.ValidationError({'products': 'Products must be specified when apply_to is "product"'})
        elif apply_to == 'collection':
            if not data.get('collections'):
                raise serializers.ValidationError({'collections': 'Categories must be specified when apply_to is "collection"'})
        elif apply_to == 'category':
            if not data.get('categories'):
                raise serializers.ValidationError({'categories': 'Subcategories must be specified when apply_to is "category"'})
        elif apply_to == 'brand':
            if not data.get('brands'):
                raise serializers.ValidationError({'brands': 'Brands must be specified when apply_to is "brand"'})
        
        # Validate date range
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError({'end_date': 'End date must be after start date'})
        
        # Validate featured offers limit
        if data.get('is_featured'):
            instance_id = self.instance.id if self.instance else None
            featured_count = Offer.objects.filter(is_featured=True).exclude(id=instance_id).count()
            if featured_count >= 4:
                raise serializers.ValidationError({'is_featured': 'Maximum 4 featured offers allowed. Please unfeature another offer first.'})
        
        return data
