"""
Management command to test API performance

Usage: python manage.py test_performance
"""

from django.core.management.base import BaseCommand
from django.db import connection, reset_queries
from django.test.utils import override_settings
import time

from products.models import Product
from products.serializers import ProductListSerializer, ProductDetailSerializer


class Command(BaseCommand):
    help = 'Test product API performance and query optimization'

    def add_arguments(self, parser):
        parser.add_argument(
            '--products',
            type=int,
            default=20,
            help='Number of products to test (default: 20)',
        )

    @override_settings(DEBUG=True)
    def handle(self, *args, **options):
        num_products = options['products']
        
        self.stdout.write(self.style.SUCCESS('\n' + '='*70))
        self.stdout.write(self.style.SUCCESS('PERFORMANCE TEST: Product API Optimization'))
        self.stdout.write(self.style.SUCCESS('='*70 + '\n'))
        
        # Test 1: Product List
        self.test_product_list(num_products)
        
        # Test 2: Product Detail
        self.test_product_detail()
        
        # Summary
        self.print_summary()

    def test_product_list(self, num_products):
        """Test product list serialization"""
        self.stdout.write(self.style.WARNING(f'\n📋 TEST 1: Product List ({num_products} products)'))
        self.stdout.write('-'*70)
        
        reset_queries()
        start_time = time.time()
        
        # Optimized queryset
        products = Product.objects.filter(is_active=True).select_related(
            'category', 'subcategory', 'brand'
        ).prefetch_related(
            'variants',
            'reviews'
        )[:num_products]
        
        # Serialize
        serializer = ProductListSerializer(products, many=True)
        data = serializer.data
        
        end_time = time.time()
        elapsed = end_time - start_time
        query_count = len(connection.queries)
        
        # Results
        self.stdout.write(f'  Products serialized: {len(data)}')
        self.stdout.write(f'  Time taken: {elapsed:.3f} seconds')
        self.stdout.write(f'  Database queries: {query_count}')
        self.stdout.write(f'  Queries per product: {query_count/len(data):.2f}')
        
        # Assessment
        queries_per_product = query_count / len(data) if len(data) > 0 else 0
        
        if queries_per_product <= 0.5:
            self.stdout.write(self.style.SUCCESS('  ✅ EXCELLENT: Optimal query performance!'))
        elif queries_per_product <= 1:
            self.stdout.write(self.style.SUCCESS('  ✅ GOOD: Well optimized'))
        elif queries_per_product <= 2:
            self.stdout.write(self.style.WARNING('  ⚠️  WARNING: Some N+1 queries detected'))
        else:
            self.stdout.write(self.style.ERROR('  ❌ POOR: Significant N+1 query problem!'))
        
        # Store for summary
        self.list_queries = query_count
        self.list_time = elapsed
        self.list_count = len(data)

    def test_product_detail(self):
        """Test product detail serialization"""
        self.stdout.write(self.style.WARNING('\n📄 TEST 2: Product Detail'))
        self.stdout.write('-'*70)
        
        reset_queries()
        start_time = time.time()
        
        # Optimized queryset
        product = Product.objects.filter(is_active=True).select_related(
            'category', 'subcategory', 'brand'
        ).prefetch_related(
            'variants',
            'reviews',
            'frequently_bought_together__variants',
            'frequently_bought_together__reviews'
        ).first()
        
        if not product:
            self.stdout.write(self.style.ERROR('  ❌ No products found in database'))
            self.detail_queries = 0
            self.detail_time = 0
            return
        
        # Serialize
        serializer = ProductDetailSerializer(product)
        data = serializer.data
        
        end_time = time.time()
        elapsed = end_time - start_time
        query_count = len(connection.queries)
        
        # Results
        self.stdout.write(f'  Product: {product.name}')
        self.stdout.write(f'  Time taken: {elapsed:.3f} seconds')
        self.stdout.write(f'  Database queries: {query_count}')
        
        # Assessment
        if query_count <= 10:
            self.stdout.write(self.style.SUCCESS('  ✅ EXCELLENT: Optimal query performance!'))
        elif query_count <= 20:
            self.stdout.write(self.style.SUCCESS('  ✅ GOOD: Well optimized'))
        else:
            self.stdout.write(self.style.WARNING('  ⚠️  WARNING: Consider further optimization'))
        
        # Store for summary
        self.detail_queries = query_count
        self.detail_time = elapsed

    def print_summary(self):
        """Print performance summary"""
        self.stdout.write(self.style.SUCCESS('\n' + '='*70))
        self.stdout.write(self.style.SUCCESS('📊 PERFORMANCE SUMMARY'))
        self.stdout.write(self.style.SUCCESS('='*70))
        
        self.stdout.write(f'\n📋 Product List ({self.list_count} items):')
        self.stdout.write(f'  Total queries: {self.list_queries}')
        self.stdout.write(f'  Time: {self.list_time:.3f}s')
        self.stdout.write(f'  Queries per product: {self.list_queries/self.list_count:.2f}')
        
        self.stdout.write(f'\n📄 Product Detail (1 item):')
        self.stdout.write(f'  Total queries: {self.detail_queries}')
        self.stdout.write(f'  Time: {self.detail_time:.3f}s')
        
        # Overall assessment
        self.stdout.write('\n' + '-'*70)
        
        total_queries = self.list_queries + self.detail_queries
        total_time = self.list_time + self.detail_time
        
        if total_queries <= 15 and total_time < 1.0:
            self.stdout.write(self.style.SUCCESS('✅ OVERALL: Excellent performance!'))
            self.stdout.write('   Your API is well optimized.')
        elif total_queries <= 30 and total_time < 2.0:
            self.stdout.write(self.style.SUCCESS('✅ OVERALL: Good performance'))
            self.stdout.write('   Your API is reasonably optimized.')
        else:
            self.stdout.write(self.style.WARNING('⚠️  OVERALL: Performance could be improved'))
            self.stdout.write('   Consider reviewing query optimization.')
        
        self.stdout.write('\n' + '='*70 + '\n')
        
        # Recommendations
        self.stdout.write(self.style.WARNING('💡 RECOMMENDATIONS:'))
        self.stdout.write('  1. Ensure database indexes are created (run migrations)')
        self.stdout.write('  2. Use connection pooling (conn_max_age in settings)')
        self.stdout.write('  3. Enable caching for frequently accessed data')
        self.stdout.write('  4. Monitor with Django Debug Toolbar in development')
        self.stdout.write('  5. Use Redis cache in production for better performance')
        self.stdout.write('')
