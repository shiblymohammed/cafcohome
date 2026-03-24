from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count, Q
from .models import Review, ReviewHelpful
from .serializers import ReviewSerializer, ReviewSummarySerializer, ReviewHelpfulSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for product reviews."""
    
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """Get reviews with filtering options."""
        queryset = Review.objects.select_related('user', 'product', 'order')
        
        # Filter by product
        product_id = self.request.query_params.get('product')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        
        # Filter by user (for user's own reviews)
        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by rating
        rating = self.request.query_params.get('rating')
        if rating:
            queryset = queryset.filter(rating=rating)
        
        # Filter by verified purchases only
        verified_only = self.request.query_params.get('verified_only')
        if verified_only == 'true':
            queryset = queryset.filter(is_verified_purchase=True)
        
        # Only show approved reviews to non-staff users
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_approved=True)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """Create review with current user."""
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        """Only allow users to update their own reviews."""
        if serializer.instance.user != self.request.user:
            raise permissions.PermissionDenied("You can only edit your own reviews.")
        serializer.save()
    
    def perform_destroy(self, instance):
        """Only allow users to delete their own reviews."""
        if instance.user != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You can only delete your own reviews.")
        instance.delete()
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get review summary statistics for a product."""
        product_id = request.query_params.get('product')
        if not product_id:
            return Response(
                {'error': 'product parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reviews = Review.objects.filter(
            product_id=product_id,
            is_approved=True
        )
        
        # Calculate statistics
        stats = reviews.aggregate(
            average_rating=Avg('rating'),
            total_reviews=Count('id'),
            verified_purchase_count=Count('id', filter=Q(is_verified_purchase=True))
        )
        
        # Rating distribution
        rating_distribution = {}
        for i in range(1, 6):
            rating_distribution[str(i)] = reviews.filter(rating=i).count()
        
        summary_data = {
            'average_rating': round(stats['average_rating'], 1) if stats['average_rating'] else 0,
            'total_reviews': stats['total_reviews'],
            'rating_distribution': rating_distribution,
            'verified_purchase_count': stats['verified_purchase_count']
        }
        
        serializer = ReviewSummarySerializer(summary_data)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def mark_helpful(self, request, pk=None):
        """Mark a review as helpful."""
        review = self.get_object()
        
        # Check if user already marked this review as helpful
        helpful, created = ReviewHelpful.objects.get_or_create(
            review=review,
            user=request.user
        )
        
        if created:
            # Increment helpful count
            review.helpful_count += 1
            review.save(update_fields=['helpful_count'])
            return Response(
                {'message': 'Review marked as helpful', 'helpful_count': review.helpful_count},
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {'message': 'You already marked this review as helpful'},
                status=status.HTTP_200_OK
            )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def unmark_helpful(self, request, pk=None):
        """Remove helpful mark from a review."""
        review = self.get_object()
        
        try:
            helpful = ReviewHelpful.objects.get(review=review, user=request.user)
            helpful.delete()
            
            # Decrement helpful count
            if review.helpful_count > 0:
                review.helpful_count -= 1
                review.save(update_fields=['helpful_count'])
            
            return Response(
                {'message': 'Helpful mark removed', 'helpful_count': review.helpful_count},
                status=status.HTTP_200_OK
            )
        except ReviewHelpful.DoesNotExist:
            return Response(
                {'message': 'You have not marked this review as helpful'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_reviews(self, request):
        """Get current user's reviews."""
        reviews = Review.objects.filter(user=request.user).select_related('product')
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def can_review(self, request):
        """Check if user can review a product."""
        product_id = request.query_params.get('product')
        if not product_id:
            return Response(
                {'error': 'product parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already reviewed this product
        already_reviewed = Review.objects.filter(
            product_id=product_id,
            user=request.user
        ).exists()
        
        if already_reviewed:
            return Response({
                'can_review': False,
                'reason': 'You have already reviewed this product'
            })
        
        # Check if user purchased this product
        from orders.models import OrderItem
        has_purchased = OrderItem.objects.filter(
            order__user=request.user,
            product_id=product_id
        ).exists()
        
        return Response({
            'can_review': True,
            'has_purchased': has_purchased,
            'message': 'You can review this product'
        })
