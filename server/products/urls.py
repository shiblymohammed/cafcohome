from django.urls import path
from .views import (
    CategoryListView,
    CategoryDetailView,
    SubcategoryListView,
    SubcategoryDetailView,
    BrandListView,
    BrandDetailView,
    ProductListView,
    ProductDetailView,
    ProductVariantListView,
    ProductVariantDetailView,
    ProductVariantBySKUView,
    BulkGenerateVariantsView,
    ColorListView,
    ColorDetailView,
    MaterialListView,
    MaterialDetailView
)

app_name = 'products'

urlpatterns = [
    # Categories (old Collections)
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('categories/<slug:slug>/', CategoryDetailView.as_view(), name='category-detail'),
    
    # Subcategories (old Categories)
    path('subcategories/', SubcategoryListView.as_view(), name='subcategory-list'),
    path('subcategories/<slug:slug>/', SubcategoryDetailView.as_view(), name='subcategory-detail'),
    
    # Brands
    path('brands/', BrandListView.as_view(), name='brand-list'),
    path('brands/<slug:slug>/', BrandDetailView.as_view(), name='brand-detail'),
    
    # Products
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),
    
    # Product Variants
    path('variants/', ProductVariantListView.as_view(), name='variant-list'),
    path('variants/<int:id>/', ProductVariantDetailView.as_view(), name='variant-detail'),
    path('variants/sku/<str:sku>/', ProductVariantBySKUView.as_view(), name='variant-by-sku'),
    path('variants/bulk-generate/', BulkGenerateVariantsView.as_view(), name='bulk-generate-variants'),
    
    # Colors
    path('colors/', ColorListView.as_view(), name='color-list'),
    path('colors/<int:pk>/', ColorDetailView.as_view(), name='color-detail'),
    
    # Materials
    path('materials/', MaterialListView.as_view(), name='material-list'),
    path('materials/<int:pk>/', MaterialDetailView.as_view(), name='material-detail'),
]
