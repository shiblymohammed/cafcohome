from django.urls import path
from .views import PromotionSettingsView

urlpatterns = [
    path('settings/promotions/', PromotionSettingsView.as_view(), name='promotion-settings'),
]
