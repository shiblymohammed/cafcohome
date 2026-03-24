from django.contrib import admin
from .models import Order, OrderItem, OrderTracking


class OrderItemInline(admin.TabularInline):
    """Inline admin for OrderItem."""
    model = OrderItem
    extra = 0
    readonly_fields = ('product_snapshot', 'total')


class OrderTrackingInline(admin.TabularInline):
    """Inline admin for OrderTracking."""
    model = OrderTracking
    extra = 0
    readonly_fields = ('timestamp',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Admin interface for Order model."""
    
    list_display = ('order_number', 'user', 'stage', 'assigned_to', 'total', 'created_at')
    list_filter = ('stage', 'assigned_to', 'created_at')
    search_fields = ('order_number', 'user__name', 'user__phone_number')
    readonly_fields = ('order_number', 'created_at', 'updated_at')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'user', 'stage', 'assigned_to')
        }),
        ('Delivery Information', {
            'fields': ('delivery_address', 'phone_number')
        }),
        ('Pricing', {
            'fields': ('subtotal', 'discount', 'total')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    inlines = [OrderItemInline, OrderTrackingInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    """Admin interface for OrderItem model."""
    
    list_display = ('order', 'product', 'quantity', 'unit_price', 'total')
    list_filter = ('order__stage', 'created_at')
    search_fields = ('order__order_number', 'product__name')
    readonly_fields = ('product_snapshot', 'created_at')


@admin.register(OrderTracking)
class OrderTrackingAdmin(admin.ModelAdmin):
    """Admin interface for OrderTracking model."""
    
    list_display = ('order', 'stage', 'updated_by', 'timestamp')
    list_filter = ('stage', 'timestamp')
    search_fields = ('order__order_number',)
    readonly_fields = ('timestamp',)
    ordering = ('-timestamp',)
