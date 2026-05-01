from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Category, Subcategory, Brand, Product
from .serializers import (
    CategorySerializer,
    SubcategorySerializer,
    BrandSerializer,
    BrandDetailSerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductAdminSerializer,
    ColorSerializer,
    MaterialSerializer,
    CollectionSerializer
)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Custom permission to only allow admins to edit."""
    
    def has_permission(self, request, view):
        # Read permissions for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for admin
        return request.user and request.user.is_authenticated and hasattr(request.user, 'role') and request.user.role == 'admin'


class CategoryListView(generics.ListCreateAPIView):
    """List all categories or create a new category."""
    
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        from django.db.models import Count, Q
        annotation = Count('products', filter=Q(products__is_active=True), distinct=True)
        # For admin users, show all categories (including inactive)
        if self.request.user and self.request.user.is_authenticated and hasattr(self.request.user, 'role') and self.request.user.role == 'admin':
            return Category.objects.annotate(product_count=annotation).order_by('display_order', 'name')
        # For public, only show active categories
        return Category.objects.filter(is_active=True).annotate(product_count=annotation).order_by('display_order', 'name')


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a category."""
    
    permission_classes = [IsAdminOrReadOnly]
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    def get_queryset(self):
        from django.db.models import Count, Q
        annotation = Count('products', filter=Q(products__is_active=True), distinct=True)
        return Category.objects.annotate(product_count=annotation)


class SubcategoryListView(generics.ListCreateAPIView):
    """List all subcategories or create a new subcategory."""
    
    serializer_class = SubcategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        # For admin users, show all subcategories (including inactive)
        if self.request.user and self.request.user.is_authenticated and hasattr(self.request.user, 'role') and self.request.user.role == 'admin':
            queryset = Subcategory.objects.all().order_by('display_order', 'name')
        else:
            # For public, only show active subcategories
            queryset = Subcategory.objects.filter(is_active=True).order_by('display_order', 'name')
        
        # Filter by category if provided
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        return queryset


class SubcategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a subcategory."""
    
    queryset = Subcategory.objects.all()
    serializer_class = SubcategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'


class BrandListView(generics.ListCreateAPIView):
    """List all brands or create a new brand."""
    
    serializer_class = BrandSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        # For admin users, show all brands (including inactive)
        if self.request.user and self.request.user.is_authenticated and hasattr(self.request.user, 'role') and self.request.user.role == 'admin':
            return Brand.objects.all().order_by('name')
        # For public, only show active brands
        return Brand.objects.filter(is_active=True).order_by('name')


class BrandDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a brand with products."""
    
    queryset = Brand.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return BrandDetailSerializer
        return BrandSerializer


class CollectionListView(generics.ListCreateAPIView):
    """List all collections or create a new collection."""
    
    from .models import Collection
    serializer_class = CollectionSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        from .models import Collection
        # For admin users, show all collections (including inactive)
        if self.request.user and self.request.user.is_authenticated and hasattr(self.request.user, 'role') and self.request.user.role == 'admin':
            return Collection.objects.all().order_by('-created_at')
        # For public, only show active collections
        return Collection.objects.filter(is_active=True).order_by('-created_at')


class CollectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a collection."""
    
    from .models import Collection
    queryset = Collection.objects.all()
    serializer_class = CollectionSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'


class ProductListView(generics.ListCreateAPIView):
    """List all products with filtering or create a new product."""
    
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).select_related(
            'category', 'subcategory', 'brand'
        ).prefetch_related(
            'variants',  # Prefetch all variants to avoid N+1
            'reviews'    # Prefetch reviews for rating calculations
        )
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(Q(category__slug=category) | Q(category__id=category))
        
        # Filter by subcategory
        subcategory = self.request.query_params.get('subcategory', None)
        if subcategory:
            queryset = queryset.filter(Q(subcategory__slug=subcategory) | Q(subcategory__id=subcategory))
        
        # Filter by brand
        brand = self.request.query_params.get('brand', None)
        if brand:
            queryset = queryset.filter(Q(brand__slug=brand) | Q(brand__id=brand))
            
        # Filter by collection
        collection = self.request.query_params.get('collection', None)
        if collection:
            queryset = queryset.filter(Q(collections__slug=collection) | Q(collections__id=collection))
        
        # Filter by material
        material = self.request.query_params.get('material', None)
        if material:
            queryset = queryset.filter(materials__contains=[material])
        
        # Filter by color
        color = self.request.query_params.get('color', None)
        if color:
            queryset = queryset.filter(colors__contains=[color])
        
        # Filter by bestseller
        is_bestseller = self.request.query_params.get('is_bestseller', None)
        if is_bestseller and is_bestseller.lower() == 'true':
            queryset = queryset.filter(is_bestseller=True)
        
        # Filter by hot selling
        is_hot_selling = self.request.query_params.get('is_hot_selling', None)
        if is_hot_selling and is_hot_selling.lower() == 'true':
            queryset = queryset.filter(is_hot_selling=True)
        
        return queryset
    
    def get_serializer_class(self):
        # Use create serializer for POST requests
        if self.request.method == 'POST':
            from .serializers import ProductCreateSerializer
            return ProductCreateSerializer
        # Use admin serializer for authenticated admin users
        if self.request.user and self.request.user.is_authenticated and hasattr(self.request.user, 'role') and self.request.user.role == 'admin':
            return ProductAdminSerializer
        return ProductListSerializer


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a product."""
    
    queryset = Product.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        # Use ProductCreateSerializer for PUT/PATCH requests
        if self.request.method in ['PUT', 'PATCH']:
            from .serializers import ProductCreateSerializer
            return ProductCreateSerializer
        # Use admin serializer for authenticated admin users
        if self.request.user and self.request.user.is_authenticated and hasattr(self.request.user, 'role') and self.request.user.role == 'admin':
            return ProductAdminSerializer
        return ProductDetailSerializer
    
    def get_queryset(self):
        return Product.objects.select_related(
            'category', 'subcategory', 'brand'
        ).prefetch_related(
            'variants',
            'reviews',
            'frequently_bought_together__variants',
            'frequently_bought_together__reviews'
        )



class ProductVariantListView(generics.ListCreateAPIView):
    """List all product variants or create a new variant."""
    
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['sku', 'color', 'material', 'product__name']
    ordering_fields = ['created_at', 'sku', 'stock_quantity']
    ordering = ['-created_at']
    
    def get_queryset(self):
        from .models import ProductVariant
        queryset = ProductVariant.objects.select_related('product').all()
        
        # Filter by product
        product_id = self.request.query_params.get('product', None)
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        
        # Filter by color
        color = self.request.query_params.get('color', None)
        if color:
            queryset = queryset.filter(color__icontains=color)
        
        # Filter by material
        material = self.request.query_params.get('material', None)
        if material:
            queryset = queryset.filter(material__icontains=material)
        
        # Filter by stock status
        in_stock = self.request.query_params.get('in_stock', None)
        if in_stock and in_stock.lower() == 'true':
            queryset = queryset.filter(stock_quantity__gt=0)
        elif in_stock and in_stock.lower() == 'false':
            queryset = queryset.filter(stock_quantity=0)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
    
    def get_serializer_class(self):
        from .serializers import ProductVariantSerializer, ProductVariantListSerializer
        if self.request.method == 'GET':
            return ProductVariantListSerializer
        return ProductVariantSerializer


class ProductVariantDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a product variant."""
    
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'id'
    
    def get_queryset(self):
        from .models import ProductVariant
        return ProductVariant.objects.select_related('product')
    
    def get_serializer_class(self):
        from .serializers import ProductVariantSerializer
        return ProductVariantSerializer


class ProductVariantBySKUView(generics.RetrieveAPIView):
    """Retrieve a product variant by SKU."""
    
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'sku'
    
    def get_queryset(self):
        from .models import ProductVariant
        return ProductVariant.objects.select_related('product')
    
    def get_serializer_class(self):
        from .serializers import ProductVariantSerializer
        return ProductVariantSerializer



class BulkGenerateVariantsView(generics.GenericAPIView):
    """Bulk generate variants for a product based on colors and materials."""
    
    permission_classes = [IsAdminOrReadOnly]
    
    def post(self, request, *args, **kwargs):
        from .models import ProductVariant
        from .serializers import ProductVariantSerializer
        
        product_id = request.data.get('product_id')
        if not product_id:
            return Response(
                {'error': {'message': 'product_id is required'}},
                status=400
            )
        
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {'error': {'message': 'Product not found'}},
                status=404
            )
        
        if not product.colors or not product.materials:
            return Response(
                {'error': {'message': 'Product must have colors and materials defined'}},
                status=400
            )
        
        created_variants = []
        skipped_variants = []
        
        for idx, color in enumerate(product.colors):
            for material in product.materials:
                # Check if variant already exists
                existing = ProductVariant.objects.filter(
                    product=product,
                    color=color,
                    material=material
                ).first()
                
                if existing:
                    skipped_variants.append(f"{color} / {material}")
                    continue
                
                # Create variant
                variant = ProductVariant.objects.create(
                    product=product,
                    color=color,
                    material=material,
                    mrp=product.mrp,
                    price=product.price,
                    stock_quantity=0,  # Start with 0, admin can update
                    low_stock_threshold=product.low_stock_threshold,
                    images=product.images,
                    is_active=True,
                    is_default=(len(created_variants) == 0)  # First variant is default
                )
                created_variants.append(ProductVariantSerializer(variant).data)
        
        return Response({
            'message': f'Created {len(created_variants)} variants',
            'created': created_variants,
            'skipped': skipped_variants
        }, status=201)


from rest_framework.response import Response



class ColorListView(generics.ListCreateAPIView):
    """List all colors or create a new color."""
    
    serializer_class = ColorSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        from .models import Color
        # For admin users, show all colors
        if self.request.user and self.request.user.is_authenticated and hasattr(self.request.user, 'role') and self.request.user.role == 'admin':
            return Color.objects.all()
        # For public, only show active colors
        return Color.objects.filter(is_active=True)


class ColorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a color."""
    
    permission_classes = [IsAdminOrReadOnly]
    serializer_class = ColorSerializer
    
    def get_queryset(self):
        from .models import Color
        return Color.objects.all()


class MaterialListView(generics.ListCreateAPIView):
    """List all materials or create a new material."""
    
    serializer_class = MaterialSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        from .models import Material
        # For admin users, show all materials
        if self.request.user and self.request.user.is_authenticated and hasattr(self.request.user, 'role') and self.request.user.role == 'admin':
            return Material.objects.all()
        # For public, only show active materials
        return Material.objects.filter(is_active=True)


class MaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a material."""
    
    permission_classes = [IsAdminOrReadOnly]
    
    def get_serializer_class(self):
        from .serializers import MaterialSerializer
        return MaterialSerializer
    
    def get_queryset(self):
        from .models import Material
        return Material.objects.all()

class ShopByRoomListView(generics.ListCreateAPIView):
    """List or create ShopByRoom settings."""
    permission_classes = [IsAdminOrReadOnly]
    
    def get_serializer_class(self):
        from .serializers import ShopByRoomSerializer
        return ShopByRoomSerializer

    def get_queryset(self):
        from .models import ShopByRoom
        queryset = ShopByRoom.objects.all().prefetch_related(
            'products', 
            'products__variants', 
            'products__brand',
            'products__category',
            'products__subcategory'
        )
        if not (self.request.user and self.request.user.is_authenticated and hasattr(self.request.user, 'role') and self.request.user.role == 'admin'):
            queryset = queryset.filter(is_active=True)
        return queryset

class ShopByRoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Update ShopByRoom config."""
    permission_classes = [IsAdminOrReadOnly]
    
    def get_serializer_class(self):
        from .serializers import ShopByRoomSerializer
        return ShopByRoomSerializer
        
    def get_queryset(self):
        from .models import ShopByRoom
        return ShopByRoom.objects.all()
