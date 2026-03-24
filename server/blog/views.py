from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import BlogPost
from .serializers import (
    BlogPostListSerializer,
    BlogPostDetailSerializer,
    BlogPostCreateUpdateSerializer
)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Custom permission to only allow admins to edit."""
    
    def has_permission(self, request, view):
        # Read permissions for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for admin
        return request.user and request.user.is_authenticated and hasattr(request.user, 'role') and request.user.role == 'admin'


class BlogPostListView(generics.ListAPIView):
    """List all published blog posts."""
    
    serializer_class = BlogPostListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        # Public can only see published posts
        if not (self.request.user and self.request.user.is_authenticated and hasattr(self.request.user, 'role') and self.request.user.role == 'admin'):
            return BlogPost.objects.filter(status='published').order_by('-published_at')
        
        # Admin can see all posts
        queryset = BlogPost.objects.all().order_by('-created_at')
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Search by title
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(title__icontains=search)
        
        return queryset


class BlogPostDetailView(generics.RetrieveAPIView):
    """Retrieve blog post detail."""
    
    serializer_class = BlogPostDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    
    def get_queryset(self):
        # Public can only see published posts
        if not (self.request.user and self.request.user.is_authenticated and hasattr(self.request.user, 'role') and self.request.user.role == 'admin'):
            return BlogPost.objects.filter(status='published')
        
        # Admin can see all posts
        return BlogPost.objects.all()


class BlogPostCreateView(generics.CreateAPIView):
    """Create a new blog post (admin only)."""
    
    serializer_class = BlogPostCreateUpdateSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    'error': {
                        'code': 'VALIDATION_ERROR',
                        'message': 'Invalid input data',
                        'details': serializer.errors
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        blog_post = serializer.save()
        
        return Response(
            {
                'blog_post': BlogPostDetailSerializer(blog_post).data,
                'message': 'Blog post created successfully'
            },
            status=status.HTTP_201_CREATED
        )


class BlogPostUpdateView(generics.UpdateAPIView):
    """Update a blog post (admin only)."""
    
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostCreateUpdateSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if not serializer.is_valid():
            return Response(
                {
                    'error': {
                        'code': 'VALIDATION_ERROR',
                        'message': 'Invalid input data',
                        'details': serializer.errors
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        blog_post = serializer.save()
        
        return Response(
            {
                'blog_post': BlogPostDetailSerializer(blog_post).data,
                'message': 'Blog post updated successfully'
            },
            status=status.HTTP_200_OK
        )


class BlogPostDeleteView(generics.DestroyAPIView):
    """Delete a blog post (admin only)."""
    
    queryset = BlogPost.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        
        return Response(
            {
                'message': 'Blog post deleted successfully'
            },
            status=status.HTTP_200_OK
        )
