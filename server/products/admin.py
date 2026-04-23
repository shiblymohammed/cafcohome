from django.contrib import admin
from .models import Category, Subcategory, Brand, Product, ProductVariant, Color, Material, ShopByRoom


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin interface for Category model."""
    
    list_display = ('name', 'slug', 'display_order', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('display_order', 'name')


@admin.register(Subcategory)
class SubcategoryAdmin(admin.ModelAdmin):
    """Admin interface for Subcategory model."""
    
    list_display = ('name', 'category', 'slug', 'display_order', 'is_active', 'created_at')
    list_filter = ('category', 'is_active', 'created_at')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('category', 'display_order', 'name')


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    """Admin interface for Brand model."""
    
    list_display = ('name', 'slug', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('name',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin interface for Product model."""
    
    list_display = ('name', 'category', 'subcategory', 'brand', 'is_bestseller', 'is_hot_selling', 'is_active')
    list_filter = ('category', 'subcategory', 'brand', 'is_bestseller', 'is_hot_selling', 'is_active', 'created_at')
    search_fields = ('name', 'slug', 'description')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description')
        }),
        ('Categorization', {
            'fields': ('category', 'subcategory', 'brand')
        }),
        ('Dimensions', {
            'fields': ('dimensions',)
        }),
        ('Flags', {
            'fields': ('is_bestseller', 'is_hot_selling', 'is_active')
        }),
    )


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    """Admin interface for Product Variant model."""
    
    list_display = ('sku', 'product', 'color', 'material', 'price', 'stock_quantity', 'is_default', 'is_active')
    list_filter = ('is_active', 'is_default', 'product__category', 'product__subcategory', 'created_at')
    search_fields = ('sku', 'color', 'material', 'product__name')
    readonly_fields = ('sku', 'created_at', 'updated_at')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Product', {
            'fields': ('product',)
        }),
        ('Variant Details', {
            'fields': ('color', 'material', 'sku')
        }),
        ('Pricing', {
            'fields': ('mrp', 'price')
        }),
        ('Inventory', {
            'fields': ('stock_quantity', 'low_stock_threshold')
        }),
        ('Images', {
            'fields': ('images',)
        }),
        ('Flags', {
            'fields': ('is_active', 'is_default')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )



@admin.register(Color)
class ColorAdmin(admin.ModelAdmin):
    """Admin interface for Color model."""
    
    list_display = ('name', 'hex_code', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name',)
    ordering = ('name',)


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    """Admin interface for Material model."""
    
    list_display = ('name', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('name',)

@admin.register(ShopByRoom)
class ShopByRoomAdmin(admin.ModelAdmin):
    """Admin interface for ShopByRoom model."""
    list_display = ('get_room_type_display', 'is_active', 'created_at')
    list_filter = ('room_type', 'is_active')
    filter_horizontal = ('products',)
    ordering = ('room_type',)
