from django.contrib import admin
from .models import Offer


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    """Admin interface for Offer model."""
    
    list_display = ('name', 'discount_percentage', 'apply_to', 'start_date', 'end_date', 'is_active')
    list_filter = ('apply_to', 'is_active', 'start_date', 'end_date')
    search_fields = ('name', 'description')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'discount_percentage')
        }),
        ('Applicability', {
            'fields': ('apply_to', 'products', 'collections', 'categories', 'brands')
        }),
        ('Validity', {
            'fields': ('start_date', 'end_date', 'is_active')
        }),
    )
    
    filter_horizontal = ('products', 'collections', 'categories', 'brands')
