from django.urls import path
from .views import (
    OrderCreateView,
    OrderListView,
    OrderDetailView,
    OrderStageUpdateView,
    OrderAssignmentView,
    QuotationSentView
)

app_name = 'orders'

urlpatterns = [
    path('orders/', OrderListView.as_view(), name='order-list'),
    path('orders/create/', OrderCreateView.as_view(), name='order-create'),
    path('orders/<str:order_number>/', OrderDetailView.as_view(), name='order-detail'),
    path('orders/<str:order_number>/stage/', OrderStageUpdateView.as_view(), name='order-stage-update'),
    path('orders/<str:order_number>/assign/', OrderAssignmentView.as_view(), name='order-assignment'),
    path('orders/<str:order_number>/quotation-sent/', QuotationSentView.as_view(), name='quotation-sent'),
]
