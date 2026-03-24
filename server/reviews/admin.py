from django.contrib import admin
from .models import Review, ReviewHelpful


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'user', 'rating', 'is_verified_purchase', 'is_approved', 'created_at']
    list_filter = ['rating', 'is_verified_purchase', 'is_approved', 'created_at']
    search_fields = ['product__name', 'user__name', 'user__email', 'title', 'comment']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(ReviewHelpful)
class ReviewHelpfulAdmin(admin.ModelAdmin):
    list_display = ['id', 'review', 'user', 'created_at']
    search_fields = ['review__product__name', 'user__name']
    readonly_fields = ['created_at']
