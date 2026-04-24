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


class ShopByRoom(models.Model):
    """Curated products grouped by room type, e.g., Living, Bedroom."""
    
    ROOM_CHOICES = (
        ('living', 'Living Room'),
        ('bedroom', 'Bedroom'),
        ('dining', 'Dining Room'),
        ('office', 'Home Office'),
    )
    
    room_type = models.CharField(max_length=20, choices=ROOM_CHOICES, unique=True, help_text="Select one of the fixed room types.")
    products = models.ManyToManyField('Product', related_name='shop_by_rooms', blank=True, help_text="Select products to feature in this room.")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'shop_by_rooms'
        ordering = ['room_type']
        verbose_name = 'Shop by Room'
        verbose_name_plural = 'Shop by Rooms'
    
    def __str__(self):
        return self.get_room_type_display()


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
    reserved_quantity = models.IntegerField(default=0, help_text='Stock reserved for pending orders')
    low_stock_threshold = models.IntegerField(default=5, help_text='Alert threshold for low stock')
    
    # Cost and pricing
    cost_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text='Cost price for inventory valuation'
    )
    
    # Inventory tracking
    last_restocked = models.DateTimeField(null=True, blank=True, help_text='Last restock date')
    reorder_point = models.IntegerField(default=10, help_text='Automatic reorder point')
    reorder_quantity = models.IntegerField(default=50, help_text='Quantity to reorder')
    
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
    
    @property
    def available_quantity(self):
        """Calculate available quantity (stock - reserved)."""
        return max(0, self.stock_quantity - self.reserved_quantity)
    
    @property
    def is_in_stock(self):
        """Check if variant is in stock."""
        return self.available_quantity > 0
    
    @property
    def is_low_stock(self):
        """Check if variant stock is low."""
        return 0 < self.available_quantity <= self.low_stock_threshold
    
    @property
    def is_out_of_stock(self):
        """Check if variant is out of stock."""
        return self.available_quantity == 0
    
    @property
    def stock_status(self):
        """Get stock status string."""
        if self.is_out_of_stock:
            return 'out_of_stock'
        elif self.is_low_stock:
            return 'low_stock'
        else:
            return 'in_stock'
    
    @property
    def stock_status_display(self):
        """Get human-readable stock status."""
        status_map = {
            'out_of_stock': 'Out of Stock',
            'low_stock': 'Low Stock',
            'in_stock': 'In Stock'
        }
        return status_map.get(self.stock_status, 'Unknown')
    
    @property
    def inventory_value(self):
        """Calculate total inventory value at cost price."""
        if self.cost_price:
            return self.stock_quantity * self.cost_price
        return None
    
    @property
    def retail_value(self):
        """Calculate total retail value at selling price."""
        return self.stock_quantity * self.price
    
    def can_fulfill_quantity(self, quantity):
        """Check if we can fulfill the requested quantity."""
        return self.available_quantity >= quantity
    
    def reserve_stock(self, quantity, order=None):
        """Reserve stock for an order."""
        if not self.can_fulfill_quantity(quantity):
            raise ValueError(f"Cannot reserve {quantity} units. Only {self.available_quantity} available.")
        
        self.reserved_quantity += quantity
        self.save(update_fields=['reserved_quantity'])
        
        # Log the movement
        self._log_stock_movement(
            movement_type='reserved',
            quantity_change=-quantity,
            reference_order=order,
            notes=f"Reserved {quantity} units for order"
        )
    
    def release_reserved_stock(self, quantity, order=None):
        """Release reserved stock."""
        release_qty = min(quantity, self.reserved_quantity)
        self.reserved_quantity -= release_qty
        self.save(update_fields=['reserved_quantity'])
        
        # Log the movement
        self._log_stock_movement(
            movement_type='released',
            quantity_change=release_qty,
            reference_order=order,
            notes=f"Released {release_qty} reserved units"
        )
        
        return release_qty
    
    def reduce_stock(self, quantity, movement_type='sale', order=None, notes=""):
        """Reduce stock quantity and log movement."""
        if quantity > self.stock_quantity:
            raise ValueError(f"Cannot reduce stock by {quantity}. Only {self.stock_quantity} available.")
        
        previous_quantity = self.stock_quantity
        self.stock_quantity -= quantity
        
        # Also reduce reserved if applicable
        if self.reserved_quantity > 0:
            reserved_to_reduce = min(quantity, self.reserved_quantity)
            self.reserved_quantity -= reserved_to_reduce
        
        self.save(update_fields=['stock_quantity', 'reserved_quantity'])
        
        # Log the movement
        self._log_stock_movement(
            movement_type=movement_type,
            quantity_change=-quantity,
            previous_quantity=previous_quantity,
            reference_order=order,
            notes=notes or f"Stock reduced by {quantity}"
        )
        
        # Check for alerts
        self._check_stock_alerts()
        
        return True
    
    def increase_stock(self, quantity, movement_type='restock', notes="", cost_price=None):
        """Increase stock quantity and log movement."""
        from django.utils import timezone
        
        previous_quantity = self.stock_quantity
        self.stock_quantity += quantity
        
        # Update cost price if provided
        if cost_price is not None:
            self.cost_price = cost_price
        
        # Update last restocked date for restock operations
        if movement_type == 'restock':
            self.last_restocked = timezone.now()
        
        self.save(update_fields=['stock_quantity', 'cost_price', 'last_restocked'])
        
        # Log the movement
        self._log_stock_movement(
            movement_type=movement_type,
            quantity_change=quantity,
            previous_quantity=previous_quantity,
            notes=notes or f"Stock increased by {quantity}"
        )
        
        # Resolve any existing alerts
        self._resolve_stock_alerts()
        
        return True
    
    def adjust_stock(self, new_quantity, notes="", created_by=None):
        """Adjust stock to a specific quantity."""
        previous_quantity = self.stock_quantity
        quantity_change = new_quantity - previous_quantity
        
        self.stock_quantity = new_quantity
        self.save(update_fields=['stock_quantity'])
        
        # Log the movement
        self._log_stock_movement(
            movement_type='adjustment',
            quantity_change=quantity_change,
            previous_quantity=previous_quantity,
            notes=notes or f"Stock adjusted to {new_quantity}",
            created_by=created_by
        )
        
        # Check for alerts
        if quantity_change < 0:
            self._check_stock_alerts()
        else:
            self._resolve_stock_alerts()
        
        return True
    
    def _log_stock_movement(self, movement_type, quantity_change, previous_quantity=None, reference_order=None, notes="", created_by=None):
        """Log stock movement."""
        from inventory.models import StockMovement
        
        if previous_quantity is None:
            previous_quantity = self.stock_quantity - quantity_change
        
        StockMovement.objects.create(
            variant=self,
            movement_type=movement_type,
            quantity_change=quantity_change,
            previous_quantity=previous_quantity,
            new_quantity=self.stock_quantity,
            reference_order=reference_order,
            notes=notes,
            created_by=created_by
        )
    
    def _check_stock_alerts(self):
        """Check and create stock alerts if needed."""
        from inventory.models import StockAlert
        
        # Check for out of stock
        if self.is_out_of_stock:
            StockAlert.objects.get_or_create(
                variant=self,
                alert_type='out_of_stock',
                is_resolved=False,
                defaults={
                    'current_quantity': self.stock_quantity,
                    'threshold_quantity': 0,
                    'priority': 'critical'
                }
            )
        # Check for low stock
        elif self.is_low_stock:
            StockAlert.objects.get_or_create(
                variant=self,
                alert_type='low_stock',
                is_resolved=False,
                defaults={
                    'current_quantity': self.stock_quantity,
                    'threshold_quantity': self.low_stock_threshold,
                    'priority': 'high' if self.stock_quantity <= 2 else 'medium'
                }
            )
    
    def _resolve_stock_alerts(self):
        """Resolve existing stock alerts when stock is replenished."""
        from inventory.models import StockAlert
        
        # Resolve alerts if stock is now above threshold
        if not self.is_low_stock and not self.is_out_of_stock:
            active_alerts = StockAlert.objects.filter(
                variant=self,
                is_resolved=False
            )
            for alert in active_alerts:
                alert.resolve(notes="Stock replenished")
    
    def get_stock_movements(self, limit=10):
        """Get recent stock movements for this variant."""
        return self.stock_movements.all()[:limit]
    
    def get_active_alerts(self):
        """Get active stock alerts for this variant."""
        return self.stock_alerts.filter(is_resolved=False)
