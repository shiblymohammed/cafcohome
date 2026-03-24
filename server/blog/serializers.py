from rest_framework import serializers
from django.utils import timezone
from .models import BlogPost


class BlogPostListSerializer(serializers.ModelSerializer):
    """Serializer for BlogPost list."""
    
    author_name = serializers.CharField(source='author.name', read_only=True, allow_null=True)
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'featured_image_url',
            'author', 'author_name', 'status', 'is_featured', 'published_at', 'created_at'
        ]
        read_only_fields = ['id', 'slug', 'published_at', 'created_at']


class BlogPostDetailSerializer(serializers.ModelSerializer):
    """Serializer for BlogPost detail."""
    
    author_name = serializers.CharField(source='author.name', read_only=True, allow_null=True)
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 'featured_image_url',
            'author', 'author_name', 'meta_title', 'meta_description',
            'status', 'is_featured', 'published_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'published_at', 'created_at', 'updated_at']


class BlogPostCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating blog posts."""
    
    class Meta:
        model = BlogPost
        fields = [
            'title', 'content', 'excerpt', 'featured_image_url',
            'meta_title', 'meta_description', 'status', 'is_featured'
        ]
    
    def create(self, validated_data):
        """Create blog post with author."""
        validated_data['author'] = self.context['request'].user
        
        # Set published_at if status is published
        if validated_data.get('status') == 'published' and not validated_data.get('published_at'):
            validated_data['published_at'] = timezone.now()
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Update blog post."""
        # Set published_at when status changes to published
        if validated_data.get('status') == 'published' and instance.status != 'published':
            validated_data['published_at'] = timezone.now()
        
        return super().update(instance, validated_data)
