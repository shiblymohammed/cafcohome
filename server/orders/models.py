from django.db import models
from django.utils.crypto import get_random_string
from accounts.models import User, Staff
from products.models import Product


def generate_order_number():
    """Generate a unique order number."""
    return f"ORD-{get_random_string(10, allowed_chars='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')}"


class Order(models.Model):
    """Customer order with delivery info and tracking."""
    
    STAGE_CHOICES = [
        ('order_received', 'Order Received'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
    ]
    
    order_number = models.CharField(max_length=20, unique=True, db_index=True, default=generate_order_number)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    
    # Delivery information
    delivery_address = models.TextField()
    phone_number = models.CharField(max_length=15)
    
    # Status
    stage = models.CharField(
        max_length=20,
        choices=STAGE_CHOICES,
        default='order_received',
        db_index=True
    )
    
    # Assignment
    assigned_to = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_orders'
    )
    
    # Totals
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        indexes = [
            models.Index(fields=['order_number']),
            models.Index(fields=['stage']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.order_number} - {self.user.name}"
    
    def save(self, *args, **kwargs):
        # Ensure order_number is set
        if not self.order_number:
            self.order_number = generate_order_number()
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    """Individual product in an order with snapshot and pricing."""
    
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='order_items'
    )
    
    # Product snapshot at order time (stores product details in case product changes)
    product_snapshot = models.JSONField(default=dict)
    
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'order_items'
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'
    
    def __str__(self):
        return f"{self.order.order_number} - {self.product.name} x{self.quantity}"
    
    def save(self, *args, **kwargs):
        # Calculate total if not set
        if not self.total:
            self.total = (self.unit_price * self.quantity) - self.discount
        
        # Create product snapshot if not exists
        if not self.product_snapshot:
            self.product_snapshot = {
                'name': self.product.name,
                'slug': self.product.slug,
                'description': self.product.description,
                'dimensions': self.product.dimensions,
                'colors': self.product.colors,
                'materials': self.product.materials,
                'images': self.product.images,
                'brand': self.product.brand.name if self.product.brand else None,
                'collection': self.product.collection.name,
                'category': self.product.category.name,
            }
        
        super().save(*args, **kwargs)


class OrderTracking(models.Model):
    """Order stage history for tracking progress."""
    
    STAGE_CHOICES = Order.STAGE_CHOICES
    
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='tracking_history'
    )
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES)
    updated_by = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    notes = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'order_tracking'
        ordering = ['-timestamp']
        verbose_name = 'Order Tracking'
        verbose_name_plural = 'Order Tracking'
    
    def __str__(self):
        return f"{self.order.order_number} - {self.get_stage_display()} at {self.timestamp}"
