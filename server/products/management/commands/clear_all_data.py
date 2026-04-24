from django.core.management.base import BaseCommand
from django.db import transaction
from products.models import (
    Category, Subcategory, Brand, Color, Material,
    Product, ProductVariant, ShopByRoom
)
from orders.models import Order, OrderItem, QuotationLog
from offers.models import Offer
from blog.models import BlogPost
from inventory.models import StockMovement, StockAlert, InventorySnapshot
from accounts.models import User


class Command(BaseCommand):
    help = 'Clear all data from the database (keeps structure and superusers)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--keep-users',
            action='store_true',
            help='Keep all user accounts',
        )

    def handle(self, *args, **options):
        keep_users = options.get('keep_users', False)

        self.stdout.write(self.style.WARNING('⚠️  WARNING: This will delete ALL data from the database!'))
        self.stdout.write(self.style.WARNING('The following will be deleted:'))
        self.stdout.write('  - All Products and Variants')
        self.stdout.write('  - All Categories and Subcategories')
        self.stdout.write('  - All Brands, Colors, Materials')
        self.stdout.write('  - All Orders and Order Items')
        self.stdout.write('  - All Offers')
        self.stdout.write('  - All Blog Posts')
        self.stdout.write('  - All Shop By Room entries')
        self.stdout.write('  - All Inventory Records (Movements, Alerts, Snapshots)')
        if not keep_users:
            self.stdout.write('  - All Users (except superusers)')
        self.stdout.write('')

        confirm = input('Type "DELETE ALL" to confirm: ')
        
        if confirm != 'DELETE ALL':
            self.stdout.write(self.style.ERROR('❌ Operation cancelled'))
            return

        try:
            with transaction.atomic():
                # Delete in correct order to respect foreign key constraints
                
                # 1. Delete Inventory Records
                self.stdout.write('Deleting inventory records...')
                InventorySnapshot.objects.all().delete()
                StockAlert.objects.all().delete()
                StockMovement.objects.all().delete()
                
                # 2. Delete Orders
                self.stdout.write('Deleting orders...')
                QuotationLog.objects.all().delete()
                OrderItem.objects.all().delete()
                Order.objects.all().delete()
                
                # 3. Delete Offers
                self.stdout.write('Deleting offers...')
                Offer.objects.all().delete()
                
                # 4. Delete Blog Posts
                self.stdout.write('Deleting blog posts...')
                BlogPost.objects.all().delete()
                
                # 5. Delete Products
                self.stdout.write('Deleting products...')
                ProductVariant.objects.all().delete()
                Product.objects.all().delete()
                ShopByRoom.objects.all().delete()
                
                # 6. Delete Product Attributes
                self.stdout.write('Deleting product attributes...')
                Material.objects.all().delete()
                Color.objects.all().delete()
                Brand.objects.all().delete()
                
                # 7. Delete Categories
                self.stdout.write('Deleting categories...')
                Subcategory.objects.all().delete()
                Category.objects.all().delete()
                
                # 8. Delete Users (optional)
                if not keep_users:
                    self.stdout.write('Deleting users...')
                    # Delete all users except superusers
                    User.objects.filter(is_superuser=False).delete()
                    self.stdout.write(self.style.SUCCESS(f'✓ Kept {User.objects.filter(is_superuser=True).count()} superuser(s)'))
                
                self.stdout.write('')
                self.stdout.write(self.style.SUCCESS('✅ All data cleared successfully!'))
                self.stdout.write('')
                self.stdout.write('Database is now empty and ready for new data.')
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error: {str(e)}'))
            raise
