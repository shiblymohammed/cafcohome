from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from products.models import Product, Category, Subcategory, Brand


class Offer(models.Model):
    """Discount promotion applicable to products, categories, subcategories, or brands."""
    
    APPLY_TO_CHOICES = [
        ('product', 'Product'),
        ('collection', 'Category'),  # Keep 'collection' for backward compatibility but maps to Category
        ('category', 'Subcategory'),  # Keep 'category' for backward compatibility but maps to Subcategory
        ('brand', 'Brand'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField()
    image_url = models.URLField(max_length=500, blank=True, default='')
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Applicability
    apply_to = models.CharField(max_length=20, choices=APPLY_TO_CHOICES)
    
    # Relations (nullable based on apply_to)
    products = models.ManyToManyField(
        Product,
        blank=True,
        related_name='offers'
    )
    collections = models.ManyToManyField(
        Category,  # Now points to Category (old Collection)
        blank=True,
        related_name='offers'
    )
    categories = models.ManyToManyField(
        Subcategory,  # Now points to Subcategory (old Category)
        blank=True,
        related_name='offers'
    )
    brands = models.ManyToManyField(
        Brand,
        blank=True,
        related_name='offers'
    )
    
    # Validity
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'offers'
        ordering = ['-is_featured', '-created_at']
        verbose_name = 'Offer'
        verbose_name_plural = 'Offers'
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['is_featured']),
            models.Index(fields=['start_date', 'end_date']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.discount_percentage}% off"
    
    def is_valid(self):
        """Check if offer is currently valid."""
        from django.utils import timezone
        now = timezone.now()
        return self.is_active and self.start_date <= now <= self.end_date
    
    def get_applicable_products(self):
        """Get all products this offer applies to."""
        if self.apply_to == 'product':
            return self.products.all()
        elif self.apply_to == 'collection':
            return Product.objects.filter(category__in=self.collections.all())
        elif self.apply_to == 'category':
            return Product.objects.filter(subcategory__in=self.categories.all())
        elif self.apply_to == 'brand':
            return Product.objects.filter(brand__in=self.brands.all())
        return Product.objects.none()
    
    def get_applicable_items_display(self):
        """Get display text for applicable items."""
        if self.apply_to == 'product':
            items = [p.name for p in self.products.all()[:3]]
            count = self.products.count()
        elif self.apply_to == 'collection':
            items = [c.name for c in self.collections.all()[:3]]
            count = self.collections.count()
        elif self.apply_to == 'category':
            items = [c.name for c in self.categories.all()[:3]]
            count = self.categories.count()
        elif self.apply_to == 'brand':
            items = [b.name for b in self.brands.all()[:3]]
            count = self.brands.count()
        else:
            return ""
        
        display = ", ".join(items)
        if count > 3:
            display += f" and {count - 3} more"
        return display
    
    def save(self, *args, **kwargs):
        """Override save to ensure max 4 featured offers."""
        if self.is_featured:
            # Count current featured offers
            featured_count = Offer.objects.filter(is_featured=True).exclude(id=self.id).count()
            if featured_count >= 4:
                raise ValueError("Maximum 4 featured offers allowed. Please unfeature another offer first.")
        super().save(*args, **kwargs)
