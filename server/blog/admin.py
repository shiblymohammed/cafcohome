from django.contrib import admin
from .models import BlogPost


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    """Admin interface for BlogPost model."""
    
    list_display = ('title', 'author', 'status', 'is_featured', 'published_at', 'created_at')
    list_filter = ('status', 'is_featured', 'author', 'published_at', 'created_at')
    search_fields = ('title', 'slug', 'content', 'excerpt')
    prepopulated_fields = {'slug': ('title',)}
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'excerpt', 'content', 'featured_image_url', 'author')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description')
        }),
        ('Publishing', {
            'fields': ('status', 'is_featured', 'published_at')
        }),
    )
    
    readonly_fields = ('published_at',)
