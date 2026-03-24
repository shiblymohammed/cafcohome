from django.db import models
from django.utils.text import slugify
import uuid


class Color(models.Model):
    """Global color options for products."""
    
    name = models.CharField(max_length=100, unique=True)
    hex_code = models.CharField(max_length=7, blank=True, default='', help_text='Hex color code (e.g., #FF5733)')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'colors'
        ordering = ['name']
        verbose_name = 'Color'
        verbose_name_plural = 'Colors'
    
    def __str__(self):
        return self.name


class Material(models.Model):
    """Global material options for products."""
    
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'materials'
        ordering = ['name']
        verbose_name = 'Material'
        verbose_name_plural = 'Materials'
    
    def __str__(self):
        return self.name


class Category(models.Model):
    """Top-level product grouping (e.g., Living, Dining, Bedroom)."""
    
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True, db_index=True)
    subtitle = models.CharField(max_length=200, blank=True, default='', help_text='Short tagline for the category')
    description = models.TextField()
    image_url = models.URLField(max_length=500, blank=True, default='')
    display_order = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False, help_text='Show as featured category')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'categories'
        ordering = ['display_order', 'name']
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self.generate_unique_slug()
        super().save(*args, **kwargs)
    
    def generate_unique_slug(self):
        """Generate a unique slug for the category."""
        base_slug = slugify(self.name)
        slug = base_slug
        counter = 1
        
        # Keep trying until we find a unique slug
        while Category.objects.filter(slug=slug).exclude(id=self.id).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        return slug
    
    @property
    def product_count(self):
        """Get the number of active products in this category."""
        return self.products.filter(is_active=True).count()


class Subcategory(models.Model):
    """Product type within a category (e.g., Sofas, Chairs, Tables)."""
    
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True, db_index=True)
    description = models.TextField()
    image_url = models.URLField(max_length=500, blank=True, default='')
    featured_icon_url = models.URLField(max_length=500, blank=True, default='', help_text='Icon/SVG for featured subcategory display')
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='subcategories'
    )
    display_order = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False, help_text='Show in featured subcategories section')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'subcategories'
        ordering = ['display_order', 'name']
        verbose_name = 'Subcategory'
        verbose_name_plural = 'Subcategories'
    
    def __str__(self):
        return f"{self.category.name} - {self.name}"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self.generate_unique_slug()
        super().save(*args, **kwargs)
    
    def generate_unique_slug(self):
        """Generate a unique slug for the subcategory."""
        base_slug = slugify(self.name)
        slug = base_slug
        counter = 1
        
        # Keep trying until we find a unique slug
        while Subcategory.objects.filter(slug=slug).exclude(id=self.id).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        return slug


class Brand(models.Model):
    """Furniture manufacturer or brand identity."""
    
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True, db_index=True)
    description = models.TextField()
    logo_url = models.URLField(max_length=500, blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'brands'
        ordering = ['name']
        verbose_name = 'Brand'
        verbose_name_plural = 'Brands'
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self.generate_unique_slug()
        super().save(*args, **kwargs)
    
    def generate_unique_slug(self):
        """Generate a unique slug for the brand."""
        base_slug = slugify(self.name)
        slug = base_slug
        counter = 1
        
        # Keep trying until we find a unique slug
        while Brand.objects.filter(slug=slug).exclude(id=self.id).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        return slug


class Product(models.Model):
    """Furniture product with all attributes, pricing, and relationships."""
    
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, db_index=True)
    description = models.TextField()
    
    # Dimensions stored as JSON: {length, width, height, unit}
    dimensions = models.JSONField(default=dict)
    
    # Relationships
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='products'
    )
    subcategory = models.ForeignKey(
        Subcategory,
        on_delete=models.CASCADE,
        related_name='products'
    )
    brand = models.ForeignKey(
        Brand,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products'
    )
    
    frequently_bought_together = models.ManyToManyField(
        'self',
        blank=True,
        symmetrical=False,
        help_text='Products frequently bought together with this one'
    )
    
    # Flags
    is_bestseller = models.BooleanField(default=False, help_text='Show in bestsellers section')
    is_hot_selling = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        ordering = ['-created_at']
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['is_bestseller']),
            models.Index(fields=['is_hot_selling']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self.generate_unique_slug()
        super().save(*args, **kwargs)
    
    def generate_unique_slug(self):
        """Generate a unique slug for the product."""
        base_slug = slugify(self.name)
        slug = base_slug
        counter = 1
        
        # Keep trying until we find a unique slug
        while Product.objects.filter(slug=slug).exclude(id=self.id).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        return slug
    
    def generate_base_sku(self):
        """Generate base SKU for the product."""
        # Format: BRAND-SUBCATEGORY-PRODUCTID
        brand_code = self.brand.slug[:3].upper() if self.brand else 'GEN'
        subcategory_code = self.subcategory.slug[:3].upper()
        product_id = str(self.id).zfill(4)
        return f"{brand_code}-{subcategory_code}-{product_id}"


class ProductVariant(models.Model):
    """Product variants with specific color, material, pricing, and stock."""
    
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='variants'
    )
    
    # Variant attributes
    color = models.CharField(max_length=100, help_text='Color variant (e.g., Navy Blue, Walnut Brown)')
    material = models.CharField(max_length=100, help_text='Material variant (e.g., Velvet, Solid Oak)')
    
    # Unique SKU for this variant
    sku = models.CharField(max_length=100, unique=True, db_index=True, help_text='Stock Keeping Unit')
    
    # Variant-specific pricing
    mrp = models.DecimalField(max_digits=10, decimal_places=2, help_text='Maximum Retail Price')
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text='Selling Price')
    
    # Variant-specific inventory
    stock_quantity = models.IntegerField(default=0, help_text='Available stock for this variant')
    low_stock_threshold = models.IntegerField(default=5, help_text='Alert threshold for low stock')
    
    # Variant-specific images (JSON array)
    images = models.JSONField(default=list, help_text='Variant-specific images')
    
    # Flags
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False, help_text='Default variant to display')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'product_variants'
        ordering = ['-is_default', 'color', 'material']
        verbose_name = 'Product Variant'
        verbose_name_plural = 'Product Variants'
        unique_together = [['product', 'color', 'material']]
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['product', 'is_active']),
            models.Index(fields=['is_default']),
        ]
    
    def __str__(self):
        return f"{self.product.name} - {self.color} / {self.material} ({self.sku})"
    
    def save(self, *args, **kwargs):
        # Generate SKU if not provided
        if not self.sku:
            self.sku = self.generate_sku()
        
        # Ensure only one default variant per product
        if self.is_default:
            ProductVariant.objects.filter(product=self.product, is_default=True).exclude(id=self.id).update(is_default=False)
        
        super().save(*args, **kwargs)
    
    def generate_sku(self):
        """Generate unique SKU for this variant."""
        # Format: BASE-COLOR-MATERIAL-UNIQUE
        base_sku = self.product.generate_base_sku() if self.product.id else 'TEMP'
        color_code = ''.join([c[0] for c in self.color.split()[:2]]).upper()
        material_code = ''.join([c[0] for c in self.material.split()[:2]]).upper()
        unique_suffix = str(uuid.uuid4())[:4].upper()
        
        sku = f"{base_sku}-{color_code}{material_code}-{unique_suffix}"
        
        # Ensure uniqueness
        while ProductVariant.objects.filter(sku=sku).exists():
            unique_suffix = str(uuid.uuid4())[:4].upper()
            sku = f"{base_sku}-{color_code}{material_code}-{unique_suffix}"
        
        return sku
    
    @property
    def discount_percentage(self):
        """Calculate discount percentage from MRP."""
        if self.mrp > 0:
            return round(((self.mrp - self.price) / self.mrp) * 100, 2)
        return 0
    
    @property
    def is_in_stock(self):
        """Check if variant is in stock."""
        return self.stock_quantity > 0
    
    @property
    def is_low_stock(self):
        """Check if variant stock is low."""
        return 0 < self.stock_quantity <= self.low_stock_threshold
    
    def reduce_stock(self, quantity):
        """Reduce stock quantity."""
        if self.stock_quantity >= quantity:
            self.stock_quantity -= quantity
            self.save(update_fields=['stock_quantity'])
            return True
        return False
    
    def increase_stock(self, quantity):
        """Increase stock quantity."""
        self.stock_quantity += quantity
        self.save(update_fields=['stock_quantity'])
