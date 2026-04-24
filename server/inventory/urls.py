from django.urls import path
from .views import (
    InventoryDashboardView,
    InventoryListView,
    StockAdjustmentView,
    BulkStockUpdateView,
    StockMovementListView,
    StockAlertListView,
    ResolveStockAlertView
)

app_name = 'inventory'

urlpatterns = [
    path('inventory/dashboard/', InventoryDashboardView.as_view(), name='inventory-dashboard'),
    path('inventory/', InventoryListView.as_view(), name='inventory-list'),
    path('inventory/adjust/', StockAdjustmentView.as_view(), name='stock-adjustment'),
    path('inventory/bulk-update/', BulkStockUpdateView.as_view(), name='bulk-stock-update'),
    path('inventory/movements/', StockMovementListView.as_view(), name='stock-movements'),
    path('inventory/alerts/', StockAlertListView.as_view(), name='stock-alerts'),
    path('inventory/alerts/<int:alert_id>/resolve/', ResolveStockAlertView.as_view(), name='resolve-alert'),
]
