from django.db import models
from django.utils import timezone
from products.models import ProductVariant
from orders.models import Order
from accounts.models import Staff


class StockMovement(models.Model):
    """Track all stock movements for inventory management."""
    
    MOVEMENT_TYPES = [
        ('restock', 'Restock'),
        ('sale', 'Sale'),
        ('adjustment', 'Manual Adjustment'),
        ('return', 'Return'),
        ('damage', 'Damage/Loss'),
        ('reserved', 'Reserved for Order'),
        ('released', 'Released from Reserve'),
        ('transfer', 'Transfer'),
    ]
    
    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name='stock_movements'
    )
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity_change = models.IntegerField(help_text='Positive for increase, negative for decrease')
    previous_quantity = models.IntegerField()
    new_quantity = models.IntegerField()
    
    # Optional references
    reference_order = models.ForeignKey(
        Order,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stock_movements'
    )
    
    # Metadata
    notes = models.TextField(blank=True, help_text='Additional notes about this movement')
    created_by = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stock_movements'
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'stock_movements'
        ordering = ['-created_at']
        verbose_name = 'Stock Movement'
        verbose_name_plural = 'Stock Movements'
        indexes = [
            models.Index(fields=['variant', '-created_at']),
            models.Index(fields=['movement_type', '-created_at']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.variant.product.name} - {self.get_movement_type_display()}: {self.quantity_change:+d}"


class StockAlert(models.Model):
    """Track stock alerts for low stock, out of stock situations."""
    
    ALERT_TYPES = [
        ('low_stock', 'Low Stock'),
        ('out_of_stock', 'Out of Stock'),
        ('overstock', 'Overstock'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name='stock_alerts'
    )
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='medium')
    
    # Stock levels at time of alert
    current_quantity = models.IntegerField()
    threshold_quantity = models.IntegerField()
    
    # Alert status
    is_resolved = models.BooleanField(default=False)
    resolved_by = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_alerts'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    # Additional info
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'stock_alerts'
        ordering = ['-created_at']
        verbose_name = 'Stock Alert'
        verbose_name_plural = 'Stock Alerts'
        indexes = [
            models.Index(fields=['variant', 'is_resolved']),
            models.Index(fields=['alert_type', 'is_resolved']),
            models.Index(fields=['priority', 'is_resolved']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        status = "Resolved" if self.is_resolved else "Active"
        return f"{self.variant.product.name} - {self.get_alert_type_display()} ({status})"
    
    def resolve(self, resolved_by=None, notes=""):
        """Mark alert as resolved."""
        self.is_resolved = True
        self.resolved_at = timezone.now()
        self.resolved_by = resolved_by
        if notes:
            self.notes = notes
        self.save()
    
    def get_priority_color(self):
        """Get color code for priority level."""
        colors = {
            'low': '#28a745',
            'medium': '#ffc107', 
            'high': '#fd7e14',
            'critical': '#dc3545'
        }
        return colors.get(self.priority, '#6c757d')


class InventorySnapshot(models.Model):
    """Daily inventory snapshots for reporting and analytics."""
    
    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name='inventory_snapshots'
    )
    
    # Stock levels
    stock_quantity = models.IntegerField()
    reserved_quantity = models.IntegerField(default=0)
    available_quantity = models.IntegerField()
    
    # Values
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_value = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Snapshot date
    snapshot_date = models.DateField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'inventory_snapshots'
        ordering = ['-snapshot_date', 'variant']
        verbose_name = 'Inventory Snapshot'
        verbose_name_plural = 'Inventory Snapshots'
        unique_together = ['variant', 'snapshot_date']
        indexes = [
            models.Index(fields=['snapshot_date']),
            models.Index(fields=['variant', 'snapshot_date']),
        ]
    
    def __str__(self):
        return f"{self.variant.product.name} - {self.snapshot_date}"