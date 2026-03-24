from django.db import models
from django.utils.text import slugify
from accounts.models import Staff


class BlogPost(models.Model):
    """Blog post with content, SEO fields, and author."""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
    ]
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, db_index=True)
    content = models.TextField()  # Rich text HTML
    excerpt = models.TextField()
    featured_image_url = models.URLField(max_length=500)
    author = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        related_name='blog_posts'
    )
    
    # SEO
    meta_title = models.CharField(max_length=60)
    meta_description = models.CharField(max_length=160)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        db_index=True
    )
    is_featured = models.BooleanField(
        default=False,
        help_text='Show this post in featured sections (homepage, etc.)'
    )
    published_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'blog_posts'
        ordering = ['-published_at', '-created_at']
        verbose_name = 'Blog Post'
        verbose_name_plural = 'Blog Posts'
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['status']),
            models.Index(fields=['published_at']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        
        # Set published_at when status changes to published
        if self.status == 'published' and not self.published_at:
            from django.utils import timezone
            self.published_at = timezone.now()
        
        super().save(*args, **kwargs)
