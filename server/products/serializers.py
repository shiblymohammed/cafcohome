from rest_framework import serializers
from .models import Category, Subcategory, Brand, Product, ProductVariant, Color, Material, Collection


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model."""
    
    product_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'subtitle', 'description', 'image_url', 'display_order', 'is_featured', 'is_active', 'product_count', 'created_at']
        read_only_fields = ['id', 'slug', 'product_count', 'created_at']


class CollectionSerializer(serializers.ModelSerializer):
    """Serializer for Collection model."""
    
    product_count = serializers.SerializerMethodField()
    products = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Product.objects.all(), 
        required=False
    )
    
    class Meta:
        model = Collection
        fields = ['id', 'name', 'slug', 'subtitle', 'description', 'tags', 'image_url', 'is_active', 'products', 'product_count', 'created_at']
        read_only_fields = ['id', 'slug', 'product_count', 'created_at']
        
    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class SubcategorySerializer(serializers.ModelSerializer):
    """Serializer for Subcategory model."""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Subcategory
        fields = ['id', 'name', 'slug', 'description', 'image_url', 'featured_icon_url', 'category', 'category_name', 'display_order', 'is_featured', 'is_active', 'product_count', 'created_at']
        read_only_fields = ['id', 'slug', 'product_count', 'created_at']
    
    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class BrandSerializer(serializers.ModelSerializer):
    """Serializer for Brand model."""
    
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'description', 'logo_url', 'is_active', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']


class ProductListSerializer(serializers.ModelSerializer):
    """Serializer for Product list (customer-facing)."""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    subcategory_name = serializers.CharField(source='subcategory.name', read_only=True)
    subcategory_slug = serializers.CharField(source='subcategory.slug', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, allow_null=True)
    brand_slug = serializers.CharField(source='brand.slug', read_only=True, allow_null=True)
    
    # Add variant information for listings
    colors = serializers.SerializerMethodField()
    materials = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    is_in_stock = serializers.SerializerMethodField()
    
    # Add review statistics
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    
    # Add pricing info
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
            'price', 'mrp',
            'average_rating', 'review_count',
            'is_bestseller', 'is_hot_selling', 'created_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at']
    
    def get_colors(self, obj):
        """Get unique colors from active variants with hex codes."""
        from .models import Color
        
        # Use prefetched variants to avoid query
        active_variants = [v for v in obj.variants.all() if v.is_active]
        color_names = set(variant.color for variant in active_variants)
        
        if not color_names:
            return []
        
        # Batch fetch all colors in one query
        color_objs = Color.objects.filter(name__in=color_names, is_active=True).only('name', 'hex_code')
        color_map = {c.name: c.hex_code or '#CCCCCC' for c in color_objs}
        
        # Build colors data
        colors_data = []
        for color_name in color_names:
            colors_data.append({
                'name': color_name,
                'hex': color_map.get(color_name, '#CCCCCC')
            })
        
        return colors_data
    
    def get_materials(self, obj):
        """Get unique materials from active variants."""
        # Use prefetched variants to avoid query
        active_variants = [v for v in obj.variants.all() if v.is_active]
        return list(set(variant.material for variant in active_variants))
    
    def get_images(self, obj):
        """Get images from default variant or first active variant."""
        # Use prefetched variants to avoid query
        active_variants = [v for v in obj.variants.all() if v.is_active]
        
        # Find default variant
        default_variant = next((v for v in active_variants if v.is_default), None)
        if not default_variant and active_variants:
            default_variant = active_variants[0]
        
        if default_variant and default_variant.images:
            return default_variant.images
        return []
    
    def get_is_in_stock(self, obj):
        """Check if any variant is in stock."""
        # Use prefetched variants to avoid query
        active_variants = [v for v in obj.variants.all() if v.is_active]
        return any(v.stock_quantity > 0 for v in active_variants)
    
    def get_average_rating(self, obj):
        """Get average rating from approved reviews."""
        # Use prefetched reviews to avoid query
        approved_reviews = [r for r in obj.reviews.all() if r.is_approved]
        if not approved_reviews:
            return 0
        avg = sum(r.rating for r in approved_reviews) / len(approved_reviews)
        return round(avg, 1)
    
    def get_review_count(self, obj):
        """Get count of approved reviews."""
        # Use prefetched reviews to avoid query
        return sum(1 for r in obj.reviews.all() if r.is_approved)
        
    def get_price(self, obj):
        # Use prefetched variants to avoid query
        active_variants = [v for v in obj.variants.all() if v.is_active]
        default_variant = next((v for v in active_variants if v.is_default), None)
        if not default_variant and active_variants:
            default_variant = active_variants[0]
        return default_variant.price if default_variant else 0

    def get_mrp(self, obj):
        # Use prefetched variants to avoid query
        active_variants = [v for v in obj.variants.all() if v.is_active]
        default_variant = next((v for v in active_variants if v.is_default), None)
        if not default_variant and active_variants:
            default_variant = active_variants[0]
        return default_variant.mrp if default_variant else 0


class ProductDetailSerializer(serializers.ModelSerializer):
    """Serializer for Product detail (customer-facing)."""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    subcategory_name = serializers.CharField(source='subcategory.name', read_only=True)
    subcategory_slug = serializers.CharField(source='subcategory.slug', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, allow_null=True)
    brand_slug = serializers.CharField(source='brand.slug', read_only=True, allow_null=True)
    brand_logo = serializers.URLField(source='brand.logo_url', read_only=True, allow_null=True)
    variants = serializers.SerializerMethodField()
    applicable_offers = serializers.SerializerMethodField()
    frequently_bought_together = ProductListSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'dimensions',
            'category', 'category_name', 'category_slug',
            'subcategory', 'subcategory_name', 'subcategory_slug',
            'brand', 'brand_name', 'brand_slug', 'brand_logo',
            'variants', 'applicable_offers', 'frequently_bought_together',
            'average_rating', 'review_count', 'is_bestseller', 'is_hot_selling', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    
    def get_variants(self, obj):
        # Use prefetched variants to avoid query
        active_variants = [v for v in obj.variants.all() if v.is_active]
        return ProductVariantSerializer(active_variants, many=True).data
        
    def get_average_rating(self, obj):
        # Use prefetched reviews to avoid query
        approved_reviews = [r for r in obj.reviews.all() if r.is_approved]
        if not approved_reviews:
            return 0
        avg = sum(r.rating for r in approved_reviews) / len(approved_reviews)
        return round(avg, 1)
    
    def get_review_count(self, obj):
        # Use prefetched reviews to avoid query
        return sum(1 for r in obj.reviews.all() if r.is_approved)
    
    def get_applicable_offers(self, obj):
        """Get active offers that apply to this product."""
        from django.utils import timezone
        from offers.models import Offer
        
        now = timezone.now()
        
        # Get active and valid offers
        offers = Offer.objects.filter(
            is_active=True,
            start_date__lte=now,
            end_date__gte=now
        )
        
        applicable_offers = []
        
        for offer in offers:
            is_applicable = False
            
            # Check if offer applies to this product
            if offer.apply_to == 'product' and obj in offer.products.all():
                is_applicable = True
            elif offer.apply_to == 'collection' and obj.category in offer.collections.all():
                is_applicable = True
            elif offer.apply_to == 'category' and obj.subcategory in offer.categories.all():
                is_applicable = True
            elif offer.apply_to == 'brand' and obj.brand and obj.brand in offer.brands.all():
                is_applicable = True
            
            if is_applicable:
                applicable_offers.append({
                    'id': offer.id,
                    'name': offer.name,
                    'description': offer.description,
                    'discount_percentage': float(offer.discount_percentage),
                    'apply_to': offer.apply_to,
                    'end_date': offer.end_date,
                    'is_featured': offer.is_featured,
                })
        
        # Sort by discount percentage (highest first)
        applicable_offers.sort(key=lambda x: x['discount_percentage'], reverse=True)
        
        return applicable_offers


class ProductAdminSerializer(serializers.ModelSerializer):
    """Serializer for Product (admin-facing)."""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    subcategory_name = serializers.CharField(source='subcategory.name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, allow_null=True)
    variants = serializers.SerializerMethodField()
    frequently_bought_together = serializers.PrimaryKeyRelatedField(many=True, queryset=Product.objects.all(), required=False)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'dimensions',
            'category', 'category_name',
            'subcategory', 'subcategory_name',
            'brand', 'brand_name',
            'is_bestseller', 'is_hot_selling', 'is_active',
            'variants', 'frequently_bought_together',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    
    def get_variants(self, obj):
        variants = obj.variants.all()
        return ProductVariantListSerializer(variants, many=True).data


class BrandDetailSerializer(serializers.ModelSerializer):
    """Serializer for Brand detail with products."""
    
    products = ProductListSerializer(many=True, read_only=True)
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'description', 'logo_url', 'is_active', 'product_count', 'products', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']
    
    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductVariantSerializer(serializers.ModelSerializer):
    """Serializer for Product Variants (admin-facing)."""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    discount_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    color_hex = serializers.SerializerMethodField()
    material_image = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'product', 'product_name', 'product_slug',
            'color', 'color_hex', 'material', 'material_image', 'sku',
            'mrp', 'price', 'discount_percentage',
            'stock_quantity', 'low_stock_threshold', 'is_in_stock', 'is_low_stock',
            'images', 'is_active', 'is_default',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'sku', 'discount_percentage', 'is_in_stock', 'is_low_stock', 'created_at', 'updated_at']
    
    def get_color_hex(self, obj):
        """Get hex code for the color."""
        try:
            from products.models import Color
            color = Color.objects.filter(name__iexact=obj.color, is_active=True).first()
            if color and color.hex_code:
                return color.hex_code
            return '#CCCCCC'
        except Exception:
            return '#CCCCCC'
    
    def get_material_image(self, obj):
        """Get texture image URL for the material."""
        try:
            from products.models import Material
            material = Material.objects.filter(name__iexact=obj.material, is_active=True).first()
            if material and material.image_url:
                return material.image_url
            return None
        except Exception:
            return None


class ProductVariantListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing variants."""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    color_hex = serializers.SerializerMethodField()
    material_image = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'product', 'product_name',
            'color', 'color_hex', 'material', 'material_image', 'sku',
            'mrp', 'price', 'stock_quantity',
            'images', 'is_active', 'is_default', 'is_in_stock'
        ]
        read_only_fields = ['id', 'sku', 'is_in_stock']
    
    def get_color_hex(self, obj):
        """Get hex code for the color."""
        try:
            from products.models import Color
            color = Color.objects.filter(name__iexact=obj.color, is_active=True).first()
            if color and color.hex_code:
                return color.hex_code
            return '#CCCCCC'
        except Exception:
            return '#CCCCCC'
    
    def get_material_image(self, obj):
        """Get texture image URL for the material."""
        try:
            from products.models import Material
            material = Material.objects.filter(name__iexact=obj.material, is_active=True).first()
            if material and material.image_url:
                return material.image_url
            return None
        except Exception:
            return None


class ProductVariantCreateSerializer(serializers.Serializer):
    """Serializer for creating product variants (without product field)."""
    
    color = serializers.CharField(max_length=100)
    material = serializers.CharField(max_length=100)
    mrp = serializers.DecimalField(max_digits=10, decimal_places=2)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = serializers.IntegerField(default=0)
    low_stock_threshold = serializers.IntegerField(default=5)
    images = serializers.JSONField(default=list)
    is_active = serializers.BooleanField(default=True)
    is_default = serializers.BooleanField(default=False)


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating products with variants."""
    
    variants = ProductVariantCreateSerializer(many=True, write_only=True)
    
    frequently_bought_together = serializers.PrimaryKeyRelatedField(many=True, queryset=Product.objects.all(), required=False)

    class Meta:
        model = Product
        fields = [
            'name', 'description', 'dimensions',
            'category', 'subcategory', 'brand',
            'frequently_bought_together',
            'is_bestseller', 'is_hot_selling', 'is_active',
            'variants'
        ]
    
    def validate(self, data):
        """Custom validation for product creation."""
        # Validate that at least one variant is provided
        variants = data.get('variants', [])
        if not variants:
            raise serializers.ValidationError({
                'variants': 'At least one variant is required.'
            })
        
        # Validate variant combinations are unique
        combinations = []
        for variant in variants:
            combo = (variant['color'], variant['material'])
            if combo in combinations:
                raise serializers.ValidationError({
                    'variants': f'Duplicate color-material combination: {variant["color"]} + {variant["material"]}'
                })
            combinations.append(combo)
        
        return data
    
    def create(self, validated_data):
        variants_data = validated_data.pop('variants')
        fbt_data = validated_data.pop('frequently_bought_together', [])
        product = Product.objects.create(**validated_data)
        
        if fbt_data:
            product.frequently_bought_together.set(fbt_data)
        
        # Create variants
        for idx, variant_data in enumerate(variants_data):
            # Set first variant as default if none specified
            if idx == 0 and not any(v.get('is_default') for v in variants_data):
                variant_data['is_default'] = True
            ProductVariant.objects.create(product=product, **variant_data)
        
        return product
    
    def update(self, instance, validated_data):
        variants_data = validated_data.pop('variants', None)
        fbt_data = validated_data.pop('frequently_bought_together', None)
        
        # Update product fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if fbt_data is not None:
            instance.frequently_bought_together.set(fbt_data)
        
        # Update variants if provided
        if variants_data is not None:
            # Delete existing variants
            instance.variants.all().delete()
            
            # Create new variants
            for idx, variant_data in enumerate(variants_data):
                # Set first variant as default if none specified
                if idx == 0 and not any(v.get('is_default') for v in variants_data):
                    variant_data['is_default'] = True
                ProductVariant.objects.create(product=instance, **variant_data)
        
        return instance



class ColorSerializer(serializers.ModelSerializer):
    """Serializer for Color model."""
    
    class Meta:
        model = Color
        fields = ['id', 'name', 'hex_code', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class MaterialSerializer(serializers.ModelSerializer):
    """Serializer for Material model."""
    
    class Meta:
        model = Material
        fields = ['id', 'name', 'title', 'description', 'image_url', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

class ShopByRoomSerializer(serializers.ModelSerializer):
    """Serializer for ShopByRoom model."""
    room_type_display = serializers.CharField(source='get_room_type_display', read_only=True)
    products = ProductListSerializer(many=True, read_only=True)
    product_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Product.objects.all(), 
        source='products', 
        write_only=True,
        required=False
    )
    
    class Meta:
        from .models import ShopByRoom
        model = ShopByRoom
        fields = ['id', 'room_type', 'room_type_display', 'is_active', 'products', 'product_ids']
        read_only_fields = ['id']
