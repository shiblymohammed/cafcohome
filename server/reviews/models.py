from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from accounts.models import User
from products.models import Product
from orders.models import Order


class Review(models.Model):
    """Customer product reviews with ratings and verification."""
    
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    order = models.ForeignKey(
        Order,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviews',
        help_text='Order that verifies this purchase'
    )
    
    # Review content
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text='Rating from 1 to 5 stars'
    )
    title = models.CharField(max_length=200, help_text='Review headline')
    comment = models.TextField(help_text='Detailed review text')
    
    # Review images (optional)
    images = models.JSONField(
        default=list,
        blank=True,
        help_text='Customer uploaded images'
    )
    
    # Verification and moderation
    is_verified_purchase = models.BooleanField(
        default=False,
        help_text='User purchased this product'
    )
    is_approved = models.BooleanField(
        default=True,
        help_text='Review is approved and visible'
    )
    
    # Helpfulness tracking
    helpful_count = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reviews'
        ordering = ['-created_at']
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'
        unique_together = [['product', 'user']]  # One review per user per product
        indexes = [
            models.Index(fields=['product', 'is_approved']),
            models.Index(fields=['user']),
            models.Index(fields=['rating']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.name} - {self.product.name} ({self.rating}★)"
    
    def save(self, *args, **kwargs):
        # Auto-verify if order is provided
        if self.order and not self.is_verified_purchase:
            # Check if user actually purchased this product in this order
            if self.order.items.filter(product=self.product).exists():
                self.is_verified_purchase = True
        
        super().save(*args, **kwargs)


class ReviewHelpful(models.Model):
    """Track which users found reviews helpful."""
    
    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        related_name='helpful_votes'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='helpful_reviews'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'review_helpful'
        unique_together = [['review', 'user']]  # One vote per user per review
        verbose_name = 'Review Helpful Vote'
        verbose_name_plural = 'Review Helpful Votes'
    
    def __str__(self):
        return f"{self.user.name} found review #{self.review.id} helpful"
