from rest_framework import serializers
from .models import Review, ReviewHelpful
from accounts.models import User
from products.models import Product
from orders.models import Order


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for product reviews."""
    
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    can_edit = serializers.SerializerMethodField()
    user_found_helpful = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 'product', 'product_name', 'user', 'user_name', 'user_email',
            'order', 'rating', 'title', 'comment', 'images',
            'is_verified_purchase', 'is_approved', 'helpful_count',
            'created_at', 'updated_at', 'can_edit', 'user_found_helpful'
        ]
        read_only_fields = [
            'id', 'user', 'is_verified_purchase', 'is_approved',
            'helpful_count', 'created_at', 'updated_at'
        ]
    
    def get_can_edit(self, obj):
        """Check if current user can edit this review."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user == request.user
        return False
    
    def get_user_found_helpful(self, obj):
        """Check if current user marked this review as helpful."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ReviewHelpful.objects.filter(
                review=obj,
                user=request.user
            ).exists()
        return False
    
    def validate(self, data):
        """Validate review data."""
        request = self.context.get('request')
        
        # Check if user already reviewed this product (on create)
        if not self.instance:
            product = data.get('product')
            if Review.objects.filter(product=product, user=request.user).exists():
                raise serializers.ValidationError(
                    "You have already reviewed this product."
                )
        
        # Validate order if provided
        order = data.get('order')
        if order:
            # Check if order belongs to user
            if order.user != request.user:
                raise serializers.ValidationError(
                    "This order does not belong to you."
                )
            
            # Check if order contains the product
            product = data.get('product', self.instance.product if self.instance else None)
            if not order.items.filter(product=product).exists():
                raise serializers.ValidationError(
                    "This product is not in the specified order."
                )
        
        return data
    
    def create(self, validated_data):
        """Create review with current user."""
        request = self.context.get('request')
        validated_data['user'] = request.user
        return super().create(validated_data)


class ReviewSummarySerializer(serializers.Serializer):
    """Serializer for review statistics summary."""
    
    average_rating = serializers.FloatField()
    total_reviews = serializers.IntegerField()
    rating_distribution = serializers.DictField()
    verified_purchase_count = serializers.IntegerField()


class ReviewHelpfulSerializer(serializers.ModelSerializer):
    """Serializer for marking reviews as helpful."""
    
    class Meta:
        model = ReviewHelpful
        fields = ['id', 'review', 'user', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
