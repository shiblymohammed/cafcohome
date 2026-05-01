from django.core.management.base import BaseCommand
from products.models import Collection, Category, Brand, Color, Material, Product, ProductVariant
from blog.models import BlogPost
from offers.models import Offer


class Command(BaseCommand):
    help = 'Add comprehensive sample data with diverse products and images'

    def handle(self, *args, **options):
        self.stdout.write('Adding comprehensive sample data...')

        # Create colors
        colors_data = [
            {'name': 'Black', 'hex_code': '#000000'},
            {'name': 'White', 'hex_code': '#FFFFFF'},
            {'name': 'Brown', 'hex_code': '#8B4513'},
            {'name': 'Navy Blue', 'hex_code': '#000080'},
            {'name': 'Gray', 'hex_code': '#808080'},
            {'name': 'Beige', 'hex_code': '#F5F5DC'},
            {'name': 'Cream', 'hex_code': '#FFFDD0'},
            {'name': 'Charcoal', 'hex_code': '#36454F'},
        ]
        
        colors = []
        for color_data in colors_data:
            color, created = Color.objects.get_or_create(
                name=color_data['name'],
                defaults={'hex_code': color_data['hex_code'], 'is_active': True}
            )
            colors.append(color)
            if created:
                self.stdout.write(f'Created color: {color.name}')

        # Create materials
        materials_data = [
            {'name': 'Leather', 'description': 'Premium genuine leather'},
            {'name': 'Fabric', 'description': 'High-quality upholstery fabric'},
            {'name': 'Velvet', 'description': 'Luxurious velvet upholstery'},
            {'name': 'Solid Wood', 'description': 'Premium solid wood construction'},
            {'name': 'Metal', 'description': 'Durable metal frame'},
            {'name': 'Rattan', 'description': 'Natural rattan weaving'},
        ]
        
        materials = []
        for material_data in materials_data:
            material, created = Material.objects.get_or_create(
                name=material_data['name'],
                defaults={'description': material_data['description'], 'is_active': True}
            )
            materials.append(material)
            if created:
                self.stdout.write(f'Created material: {material.name}')

        # Create brands
        brands_data = [
            {'name': 'DravoHome', 'description': 'Premium furniture brand'},
            {'name': 'Modern Living', 'description': 'Contemporary furniture solutions'},
            {'name': 'Classic Comfort', 'description': 'Traditional and comfortable furniture'},
        ]
        
        brands = []
        for brand_data in brands_data:
            brand, created = Brand.objects.get_or_create(
                name=brand_data['name'],
                defaults={'description': brand_data['description'], 'is_active': True}
            )
            brands.append(brand)
            if created:
                self.stdout.write(f'Created brand: {brand.name}')

        # Create collections
        collections_data = [
            {
                'name': 'Living Room',
                'description': 'Comfortable and stylish living room furniture',
                'image_url': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
                'is_featured': True,
                'categories': [
                    {'name': 'Sofas', 'description': 'Comfortable seating solutions', 'image_url': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop', 'is_featured': True},
                    {'name': 'Chairs', 'description': 'Stylish and comfortable chairs', 'image_url': 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=600&fit=crop', 'is_featured': True},
                    {'name': 'Coffee Tables', 'description': 'Elegant coffee tables', 'image_url': 'https://images.unsplash.com/photo-1549497538-303791108f95?w=800&h=600&fit=crop', 'is_featured': True},
                ]
            },
            {
                'name': 'Bedroom',
                'description': 'Create your perfect bedroom sanctuary',
                'image_url': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop',
                'is_featured': True,
                'categories': [
                    {'name': 'Beds', 'description': 'Comfortable and stylish beds', 'image_url': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop', 'is_featured': True},
                    {'name': 'Wardrobes', 'description': 'Spacious storage solutions', 'image_url': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop', 'is_featured': False},
                ]
            },
            {
                'name': 'Dining',
                'description': 'Elegant dining furniture for memorable meals',
                'image_url': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
                'is_featured': True,
                'categories': [
                    {'name': 'Dining Tables', 'description': 'Beautiful dining tables', 'image_url': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop', 'is_featured': True},
                    {'name': 'Dining Chairs', 'description': 'Comfortable dining chairs', 'image_url': 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=600&fit=crop', 'is_featured': False},
                ]
            }
        ]

        collections = []
        categories = []
        for collection_data in collections_data:
            collection, created = Collection.objects.get_or_create(
                name=collection_data['name'],
                defaults={
                    'description': collection_data['description'],
                    'image_url': collection_data['image_url'],
                    'is_featured': collection_data['is_featured'],
                    'is_active': True
                }
            )
            collections.append(collection)
            if created:
                self.stdout.write(f'Created collection: {collection.name}')

            # Create categories for this collection
            for category_data in collection_data['categories']:
                category, created = Category.objects.get_or_create(
                    name=category_data['name'],
                    collection=collection,
                    defaults={
                        'description': category_data['description'],
                        'image_url': category_data['image_url'],
                        'is_featured': category_data['is_featured'],
                        'is_active': True
                    }
                )
                categories.append(category)
                if created:
                    self.stdout.write(f'  Created category: {category.name}')

        # Create comprehensive products
        products_data = [
            {
                'name': 'Modern 3-Seater Sofa',
                'description': 'A comfortable and stylish 3-seater sofa perfect for any living room. Features premium cushioning and durable construction.',
                'dimensions': {'length': 200, 'width': 90, 'height': 85, 'unit': 'cm'},
                'collection': 'Living Room',
                'category': 'Sofas',
                'brand': 'DravoHome',
                'is_bestseller': True,
                'variants': [
                    {
                        'material': 'Leather', 'color': 'Black', 'mrp': 45000, 'price': 39999, 'stock': 5,
                        'images': [
                            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
                            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'
                        ]
                    },
                    {
                        'material': 'Leather', 'color': 'Brown', 'mrp': 45000, 'price': 39999, 'stock': 3,
                        'images': [
                            'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&h=600&fit=crop',
                            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'
                        ]
                    },
                    {
                        'material': 'Fabric', 'color': 'Gray', 'mrp': 35000, 'price': 29999, 'stock': 8,
                        'images': [
                            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
                            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop'
                        ]
                    },
                ]
            },
            {
                'name': 'Luxury Recliner Chair',
                'description': 'Premium reclining chair with massage function and premium upholstery. Perfect for relaxation and comfort.',
                'dimensions': {'length': 100, 'width': 95, 'height': 110, 'unit': 'cm'},
                'collection': 'Living Room',
                'category': 'Chairs',
                'brand': 'DravoHome',
                'is_hot_selling': True,
                'variants': [
                    {
                        'material': 'Leather', 'color': 'Black', 'mrp': 65000, 'price': 54999, 'stock': 2,
                        'images': [
                            'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=600&fit=crop',
                            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'
                        ]
                    },
                    {
                        'material': 'Leather', 'color': 'Brown', 'mrp': 65000, 'price': 54999, 'stock': 4,
                        'images': [
                            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
                            'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=600&fit=crop'
                        ]
                    },
                ]
            },
            {
                'name': 'Elegant Coffee Table',
                'description': 'Stylish coffee table with storage compartments. Perfect centerpiece for your living room.',
                'dimensions': {'length': 120, 'width': 60, 'height': 45, 'unit': 'cm'},
                'collection': 'Living Room',
                'category': 'Coffee Tables',
                'brand': 'Modern Living',
                'is_bestseller': True,
                'variants': [
                    {
                        'material': 'Solid Wood', 'color': 'Brown', 'mrp': 25000, 'price': 21999, 'stock': 6,
                        'images': [
                            'https://images.unsplash.com/photo-1549497538-303791108f95?w=800&h=600&fit=crop',
                            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'
                        ]
                    },
                    {
                        'material': 'Solid Wood', 'color': 'White', 'mrp': 25000, 'price': 21999, 'stock': 4,
                        'images': [
                            'https://images.unsplash.com/photo-1549497538-303791108f95?w=800&h=600&fit=crop&sat=-100',
                            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'
                        ]
                    },
                ]
            },
            {
                'name': 'King Size Platform Bed',
                'description': 'Modern platform bed with built-in nightstands. Sleek design meets functionality.',
                'dimensions': {'length': 220, 'width': 200, 'height': 90, 'unit': 'cm'},
                'collection': 'Bedroom',
                'category': 'Beds',
                'brand': 'Modern Living',
                'is_hot_selling': True,
                'variants': [
                    {
                        'material': 'Solid Wood', 'color': 'Brown', 'mrp': 55000, 'price': 47999, 'stock': 3,
                        'images': [
                            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop',
                            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
                        ]
                    },
                    {
                        'material': 'Solid Wood', 'color': 'White', 'mrp': 55000, 'price': 47999, 'stock': 2,
                        'images': [
                            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop&sat=-100',
                            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
                        ]
                    },
                ]
            },
            {
                'name': '6-Seater Dining Table Set',
                'description': 'Complete dining set with table and 6 chairs. Perfect for family gatherings and dinner parties.',
                'dimensions': {'length': 180, 'width': 90, 'height': 75, 'unit': 'cm'},
                'collection': 'Dining',
                'category': 'Dining Tables',
                'brand': 'Classic Comfort',
                'is_bestseller': True,
                'variants': [
                    {
                        'material': 'Solid Wood', 'color': 'Brown', 'mrp': 75000, 'price': 64999, 'stock': 2,
                        'images': [
                            'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
                            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'
                        ]
                    },
                ]
            },
        ]

        for product_data in products_data:
            # Find related objects
            collection = next((c for c in collections if c.name == product_data['collection']), None)
            category = next((c for c in categories if c.name == product_data['category'] and c.collection == collection), None)
            brand = next((b for b in brands if b.name == product_data['brand']), None)
            
            if not collection or not category:
                self.stdout.write(f'Skipping product {product_data["name"]} - missing collection or category')
                continue

            product, created = Product.objects.get_or_create(
                name=product_data['name'],
                defaults={
                    'description': product_data['description'],
                    'dimensions': product_data['dimensions'],
                    'collection': collection,
                    'category': category,
                    'brand': brand,
                    'is_bestseller': product_data.get('is_bestseller', False),
                    'is_hot_selling': product_data.get('is_hot_selling', False),
                    'is_active': True
                }
            )
            
            if created:
                self.stdout.write(f'Created product: {product.name}')
                
                # Create variants
                for i, variant_data in enumerate(product_data['variants']):
                    material = next((m for m in materials if m.name == variant_data['material']), None)
                    color = next((c for c in colors if c.name == variant_data['color']), None)
                    
                    if material and color:
                        # Use the images from the variant data
                        variant_images = []
                        for idx, image_url in enumerate(variant_data.get('images', [])):
                            variant_images.append({
                                'url': image_url,
                                'alt': f'{product.name} - {color.name} {material.name}',
                                'order': idx
                            })
                        
                        variant = ProductVariant.objects.create(
                            product=product,
                            color=color.name,
                            material=material.name,
                            mrp=variant_data['mrp'],
                            price=variant_data['price'],
                            stock_quantity=variant_data['stock'],
                            is_default=(i == 0),  # First variant is default
                            images=variant_images
                        )
                        self.stdout.write(f'  Created variant: {variant.color} {variant.material}')

        # Create blog posts
        blog_posts_data = [
            {
                'title': '5 Tips for Choosing the Perfect Sofa',
                'content': 'Choosing the right sofa is crucial for your living room comfort and style. Here are our top 5 tips to help you make the perfect choice...',
                'excerpt': 'Expert tips to help you choose the perfect sofa for your living room.',
                'is_featured': True,
                'featured_image_url': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
                'meta_title': '5 Tips for Choosing the Perfect Sofa',
                'meta_description': 'Expert tips to help you choose the perfect sofa for your living room comfort and style.'
            },
            {
                'title': 'Modern vs Traditional: Finding Your Style',
                'content': 'Discover whether modern or traditional furniture suits your lifestyle and home aesthetic. We explore the key differences and help you decide...',
                'excerpt': 'Discover whether modern or traditional furniture suits your lifestyle and home aesthetic.',
                'is_featured': True,
                'featured_image_url': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
                'meta_title': 'Modern vs Traditional: Finding Your Style',
                'meta_description': 'Discover whether modern or traditional furniture suits your lifestyle and home aesthetic.'
            },
            {
                'title': 'Creating a Cozy Bedroom Sanctuary',
                'content': 'Transform your bedroom into a peaceful retreat with our expert tips on furniture selection, color schemes, and layout optimization...',
                'excerpt': 'Transform your bedroom into a peaceful retreat with expert furniture tips.',
                'is_featured': False,
                'featured_image_url': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop',
                'meta_title': 'Creating a Cozy Bedroom Sanctuary',
                'meta_description': 'Transform your bedroom into a peaceful retreat with expert furniture tips.'
            }
        ]

        for blog_data in blog_posts_data:
            blog_post, created = BlogPost.objects.get_or_create(
                title=blog_data['title'],
                defaults={
                    'content': blog_data['content'],
                    'excerpt': blog_data['excerpt'],
                    'is_featured': blog_data['is_featured'],
                    'featured_image_url': blog_data['featured_image_url'],
                    'meta_title': blog_data['meta_title'],
                    'meta_description': blog_data['meta_description'],
                    'status': 'published'
                }
            )
            if created:
                self.stdout.write(f'Created blog post: {blog_post.title}')

        # Create offers
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        offers_data = [
            {
                'name': 'Summer Sale - Up to 30% Off',
                'description': 'Get amazing discounts on selected furniture items. Limited time offer!',
                'discount_percentage': 30,
                'apply_to': 'collection',
                'is_featured': True,
                'image_url': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
                'start_date': now,
                'end_date': now + timedelta(days=30)
            },
            {
                'name': 'Free Delivery on Orders Above ₹25,000',
                'description': 'Enjoy free home delivery on all orders above ₹25,000. No hidden charges!',
                'discount_percentage': 0,
                'apply_to': 'collection',
                'is_featured': True,
                'image_url': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
                'start_date': now,
                'end_date': now + timedelta(days=60)
            }
        ]

        for offer_data in offers_data:
            offer, created = Offer.objects.get_or_create(
                name=offer_data['name'],
                defaults={
                    'description': offer_data['description'],
                    'discount_percentage': offer_data['discount_percentage'],
                    'apply_to': offer_data['apply_to'],
                    'is_featured': offer_data['is_featured'],
                    'image_url': offer_data['image_url'],
                    'start_date': offer_data['start_date'],
                    'end_date': offer_data['end_date'],
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(f'Created offer: {offer.name}')
                # Add collections to the offer
                if offer.apply_to == 'collection':
                    offer.collections.set(collections[:2])  # Add first 2 collections

        self.stdout.write(self.style.SUCCESS('Comprehensive sample data added successfully!'))