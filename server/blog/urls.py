from django.urls import path
from .views import (
    BlogPostListView,
    BlogPostDetailView,
    BlogPostCreateView,
    BlogPostUpdateView,
    BlogPostDeleteView
)

app_name = 'blog'

urlpatterns = [
    path('blog/', BlogPostListView.as_view(), name='blog-list'),
    path('blog/create/', BlogPostCreateView.as_view(), name='blog-create'),
    path('blog/<slug:slug>/', BlogPostDetailView.as_view(), name='blog-detail'),
    path('blog/<int:pk>/update/', BlogPostUpdateView.as_view(), name='blog-update'),
    path('blog/<int:pk>/delete/', BlogPostDeleteView.as_view(), name='blog-delete'),
]
