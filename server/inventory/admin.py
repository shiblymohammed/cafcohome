from django.contrib import admin
from .models import StockMovement, StockAlert, InventorySnapshot


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ['id', 'variant', 'movement_type', 'quantity_change', 'new_quantity', 'created_at']
    list_filter = ['movement_type', 'created_at']
    search_fields = ['variant__product__name', 'variant__sku', 'notes']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'


@admin.register(StockAlert)
class StockAlertAdmin(admin.ModelAdmin):
    list_display = ['id', 'variant', 'alert_type', 'priority', 'current_quantity', 'is_resolved', 'created_at']
    list_filter = ['alert_type', 'priority', 'is_resolved', 'created_at']
    search_fields = ['variant__product__name', 'variant__sku']
    readonly_fields = ['created_at', 'resolved_at']
    date_hierarchy = 'created_at'


@admin.register(InventorySnapshot)
class InventorySnapshotAdmin(admin.ModelAdmin):
    list_display = ['id', 'variant', 'stock_quantity', 'available_quantity', 'total_value', 'snapshot_date']
    list_filter = ['snapshot_date']
    search_fields = ['variant__product__name', 'variant__sku']
    readonly_fields = ['created_at']
    date_hierarchy = 'snapshot_date'
