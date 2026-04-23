"""
Seed realistic furniture products with variants, images, and pricing.
Run this after seed_furniture_data.py

Usage: python seed_products.py
"""

import os
import sys
import django
from decimal import Decimal

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cafcohome_api.settings')
django.setup()

from products.models import Category, Subcategory, Brand, Color, Material, Product, ProductVariant


# Real furniture images from Unsplash (free high-quality images)
FURNITURE_IMAGES = {
    'sofa': [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80',
    ],
    'bed': [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&h=600&fit=crop&q=80',
    ],
    'dining-table': [
        'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1551298370-9d3d53740c72?w=800&h=600&fit=crop&q=80',
    ],
    'office-chair': [
        'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop&q=80',
    ],
    'coffee-table': [
        'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1565191999001-551c187427bb?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1551298370-9d3d53740c72?w=800&h=600&fit=crop&q=80',
    ],
}


def get_images_for_variant(product_type, variant_index, num_images=4):
    """Get image URLs for a product variant."""
    images_list = FURNITURE_IMAGES.get(product_type, FURNITURE_IMAGES['sofa'])
    
    result = []
    for i in range(num_images):
        # Cycle through available images
        img_url = images_list[(variant_index + i) % len(images_list)]
        result.append({
            "url": img_url,
            "alt": f"{product_type.replace('-', ' ').title()} - View {i+1}",
            "order": i + 1
        })
    
    return result


def create_products():
    """Create all furniture products."""
    print("\n🛋️  Creating furniture products...")
    
    # Get categories and subcategories
    living_room = Category.objects.get(name="Living Room")
    bedroom = Category.objects.get(name="Bedroom")
    dining_room = Category.objects.get(name="Dining Room")
    office = Category.objects.get(name="Office")
    
    sofas_subcat = Subcategory.objects.get(name="Sofas")
    beds_subcat = Subcategory.objects.get(name="Beds")
    dining_tables_subcat = Subcategory.objects.get(name="Dining Tables")
    office_chairs_subcat = Subcategory.objects.get(name="Office Chairs")
    coffee_tables_subcat = Subcategory.objects.get(name="Coffee Tables")
    
    # Get materials and colors
    velvet = Material.objects.get(name="Velvet Fabric")
    linen = Material.objects.get(name="Linen Fabric")
    leather = Material.objects.get(name="Leather")
    sheesham = Material.objects.get(name="Sheesham Wood")
    engineered = Material.objects.get(name="Engineered Wood")
    oak = Material.objects.get(name="Oak Wood")
    mango = Material.objects.get(name="Mango Wood")
    glass = Material.objects.get(name="Glass")
    metal = Material.objects.get(name="Metal Frame")
    marble = Material.objects.get(name="Marble")
    mesh = Material.objects.get(name="Microfiber")
    faux_leather = Material.objects.get(name="Faux Leather")
    
    navy = Color.objects.get(name="Navy Blue")
    gray = Color.objects.get(name="Gray")
    beige = Color.objects.get(name="Beige")
    charcoal = Color.objects.get(name="Charcoal")
    emerald = Color.objects.get(name="Emerald Green")
    walnut = Color.objects.get(name="Walnut Brown")
    natural = Color.objects.get(name="Natural Wood")
    espresso = Color.objects.get(name="Espresso")
    white = Color.objects.get(name="White")
    black = Color.objects.get(name="Black")
    gold = Color.objects.get(name="Gold")
    
    # Get brands
    urban_ladder = Brand.objects.get(name="Urban Ladder")
    pepperfry = Brand.objects.get(name="Pepperfry")
    godrej = Brand.objects.get(name="Godrej Interio")
    durian = Brand.objects.get(name="Durian")
    hometown = Brand.objects.get(name="HomeTown")
    nilkamal = Brand.objects.get(name="Nilkamal")
    wakefit = Brand.objects.get(name="Wakefit")
    
    all_products = []
    
    # SOFAS
    print("  Creating sofas...")
    sofas_data = [
        {
            "name": "Valencia 3-Seater Sofa",
            "description": "Experience luxury with the Valencia 3-seater sofa. Featuring deep cushioning, solid wood frame, and premium upholstery, this sofa combines comfort with contemporary design. Perfect for modern living rooms, it seats three comfortably and includes removable cushion covers for easy maintenance.",
            "dimensions": {"length": 210, "width": 90, "height": 85, "unit": "cm"},
            "brand": urban_ladder,
            "is_bestseller": True,
            "is_hot_selling": True,
            "variants": [
                {"material": velvet, "color": navy, "mrp": "54999", "price": "42999", "stock": 15, "is_default": True},
                {"material": velvet, "color": emerald, "mrp": "54999", "price": "42999", "stock": 12},
                {"material": linen, "color": beige, "mrp": "49999", "price": "39999", "stock": 20},
            ]
        },
        {
            "name": "Modena L-Shaped Sectional Sofa",
            "description": "Maximize your living space with the Modena L-shaped sectional. This spacious sofa features a chaise lounge, premium foam cushioning, and a sturdy engineered wood frame. Ideal for large families or entertaining guests, with reversible chaise configuration.",
            "dimensions": {"length": 280, "width": 180, "height": 88, "unit": "cm"},
            "brand": durian,
            "is_bestseller": True,
            "is_hot_selling": False,
            "variants": [
                {"material": leather, "color": charcoal, "mrp": "89999", "price": "74999", "stock": 8, "is_default": True},
                {"material": velvet, "color": gray, "mrp": "79999", "price": "67999", "stock": 10},
            ]
        },
        {
            "name": "Compact 2-Seater Loveseat",
            "description": "Perfect for apartments and small spaces, this 2-seater loveseat offers comfort without compromising on style. Features high-density foam, solid wood legs, and contemporary design. Easy to move and maintain.",
            "dimensions": {"length": 150, "width": 85, "height": 82, "unit": "cm"},
            "brand": pepperfry,
            "is_bestseller": False,
            "is_hot_selling": True,
            "variants": [
                {"material": linen, "color": gray, "mrp": "29999", "price": "24999", "stock": 25, "is_default": True},
                {"material": linen, "color": beige, "mrp": "29999", "price": "24999", "stock": 18},
            ]
        },
    ]
    
    for prod_data in sofas_data:
        variants_data = prod_data.pop('variants')
        product = Product.objects.create(**prod_data, category=living_room, subcategory=sofas_subcat, is_active=True)
        
        for idx, var_data in enumerate(variants_data):
            material = var_data.pop('material')
            color = var_data.pop('color')
            stock = var_data.pop('stock')
            
            ProductVariant.objects.create(
                product=product,
                material=material.name,
                color=color.name,
                mrp=Decimal(var_data['mrp']),
                price=Decimal(var_data['price']),
                stock_quantity=stock,
                images=get_images_for_variant('sofa', idx, 4),
                is_active=True,
                is_default=var_data.get('is_default', False)
            )
        
        all_products.append(product)
    
    # BEDS
    print("  Creating beds...")
    beds_data = [
        {
            "name": "Royale King Size Bed with Storage",
            "description": "Sleep like royalty in this king-size bed with built-in hydraulic storage. Crafted from premium Sheesham wood with a rich finish, this bed features a high headboard, sturdy slats, and spacious under-bed storage. Perfect for master bedrooms.",
            "dimensions": {"length": 215, "width": 195, "height": 120, "unit": "cm"},
            "brand": godrej,
            "is_bestseller": True,
            "is_hot_selling": True,
            "variants": [
                {"material": sheesham, "color": walnut, "mrp": "64999", "price": "52999", "stock": 12, "is_default": True},
                {"material": sheesham, "color": natural, "mrp": "64999", "price": "52999", "stock": 10},
            ]
        },
        {
            "name": "Nordic Queen Size Platform Bed",
            "description": "Minimalist Scandinavian design meets functionality. This queen-size platform bed features clean lines, solid oak construction, and a low-profile design. No box spring required. Includes wooden slats for mattress support.",
            "dimensions": {"length": 210, "width": 165, "height": 95, "unit": "cm"},
            "brand": urban_ladder,
            "is_bestseller": True,
            "is_hot_selling": False,
            "variants": [
                {"material": oak, "color": natural, "mrp": "45999", "price": "38999", "stock": 15, "is_default": True},
                {"material": oak, "color": white, "mrp": "45999", "price": "38999", "stock": 12},
            ]
        },
        {
            "name": "Classic Single Bed",
            "description": "Space-saving single bed perfect for kids' rooms or guest bedrooms. Features durable engineered wood construction, smooth finish, and simple assembly. Compact yet comfortable design.",
            "dimensions": {"length": 200, "width": 100, "height": 90, "unit": "cm"},
            "brand": nilkamal,
            "is_bestseller": False,
            "is_hot_selling": True,
            "variants": [
                {"material": engineered, "color": white, "mrp": "18999", "price": "14999", "stock": 30, "is_default": True},
                {"material": engineered, "color": walnut, "mrp": "18999", "price": "14999", "stock": 25},
            ]
        },
    ]
    
    for prod_data in beds_data:
        variants_data = prod_data.pop('variants')
        product = Product.objects.create(**prod_data, category=bedroom, subcategory=beds_subcat, is_active=True)
        
        for idx, var_data in enumerate(variants_data):
            material = var_data.pop('material')
            color = var_data.pop('color')
            stock = var_data.pop('stock')
            
            ProductVariant.objects.create(
                product=product,
                material=material.name,
                color=color.name,
                mrp=Decimal(var_data['mrp']),
                price=Decimal(var_data['price']),
                stock_quantity=stock,
                images=get_images_for_variant('bed', idx, 3),
                is_active=True,
                is_default=var_data.get('is_default', False)
            )
        
        all_products.append(product)
    
    # DINING TABLES
    print("  Creating dining tables...")
    dining_data = [
        {
            "name": "Farmhouse 6-Seater Dining Table",
            "description": "Bring rustic charm to your dining room with this solid mango wood farmhouse table. Features a thick tabletop, sturdy legs, and natural wood grain. Seats 6 comfortably. Perfect for family dinners and gatherings.",
            "dimensions": {"length": 180, "width": 90, "height": 76, "unit": "cm"},
            "brand": hometown,
            "is_bestseller": True,
            "is_hot_selling": True,
            "variants": [
                {"material": mango, "color": natural, "mrp": "42999", "price": "35999", "stock": 18, "is_default": True},
                {"material": mango, "color": walnut, "mrp": "42999", "price": "35999", "stock": 15},
            ]
        },
        {
            "name": "Modern Glass Top 4-Seater Dining Table",
            "description": "Contemporary dining table with tempered glass top and metal frame. Space-saving design perfect for apartments. Easy to clean and maintain. Seats 4 people comfortably.",
            "dimensions": {"length": 120, "width": 75, "height": 75, "unit": "cm"},
            "brand": pepperfry,
            "is_bestseller": False,
            "is_hot_selling": True,
            "variants": [
                {"material": glass, "color": black, "mrp": "24999", "price": "19999", "stock": 22, "is_default": True},
            ]
        },
        {
            "name": "Grand 8-Seater Extendable Dining Table",
            "description": "Luxurious extendable dining table in premium Sheesham wood. Extends from 6 to 8 seaters with a smooth mechanism. Features intricate carving and a rich finish. Perfect for large families and dinner parties.",
            "dimensions": {"length": 210, "width": 100, "height": 78, "unit": "cm"},
            "brand": durian,
            "is_bestseller": True,
            "is_hot_selling": False,
            "variants": [
                {"material": sheesham, "color": walnut, "mrp": "69999", "price": "59999", "stock": 8, "is_default": True},
            ]
        },
    ]
    
    for prod_data in dining_data:
        variants_data = prod_data.pop('variants')
        product = Product.objects.create(**prod_data, category=dining_room, subcategory=dining_tables_subcat, is_active=True)
        
        for idx, var_data in enumerate(variants_data):
            material = var_data.pop('material')
            color = var_data.pop('color')
            stock = var_data.pop('stock')
            
            ProductVariant.objects.create(
                product=product,
                material=material.name,
                color=color.name,
                mrp=Decimal(var_data['mrp']),
                price=Decimal(var_data['price']),
                stock_quantity=stock,
                images=get_images_for_variant('dining-table', idx, 3),
                is_active=True,
                is_default=var_data.get('is_default', False)
            )
        
        all_products.append(product)
    
    # OFFICE CHAIRS
    print("  Creating office chairs...")
    chairs_data = [
        {
            "name": "ErgoMax Executive Office Chair",
            "description": "Premium ergonomic office chair with lumbar support, adjustable armrests, and breathable mesh back. Features 360-degree swivel, tilt mechanism, and height adjustment. Perfect for long work hours. Weight capacity: 120kg.",
            "dimensions": {"length": 65, "width": 65, "height": 120, "unit": "cm"},
            "brand": wakefit,
            "is_bestseller": True,
            "is_hot_selling": True,
            "variants": [
                {"material": mesh, "color": black, "mrp": "14999", "price": "11999", "stock": 35, "is_default": True},
                {"material": mesh, "color": gray, "mrp": "14999", "price": "11999", "stock": 28},
            ]
        },
        {
            "name": "Luxury Leather Boss Chair",
            "description": "High-back executive chair in genuine leather. Features thick padding, chrome base, and premium finish. Adjustable height and tilt. Makes a statement in any office. Weight capacity: 130kg.",
            "dimensions": {"length": 70, "width": 70, "height": 125, "unit": "cm"},
            "brand": godrej,
            "is_bestseller": True,
            "is_hot_selling": False,
            "variants": [
                {"material": leather, "color": black, "mrp": "24999", "price": "21999", "stock": 15, "is_default": True},
            ]
        },
        {
            "name": "Budget Study Chair",
            "description": "Affordable and comfortable study chair for students and home offices. Features padded seat, backrest support, and smooth-rolling casters. Easy assembly. Weight capacity: 100kg.",
            "dimensions": {"length": 55, "width": 55, "height": 95, "unit": "cm"},
            "brand": nilkamal,
            "is_bestseller": False,
            "is_hot_selling": True,
            "variants": [
                {"material": faux_leather, "color": black, "mrp": "5999", "price": "4499", "stock": 50, "is_default": True},
            ]
        },
    ]
    
    for prod_data in chairs_data:
        variants_data = prod_data.pop('variants')
        product = Product.objects.create(**prod_data, category=office, subcategory=office_chairs_subcat, is_active=True)
        
        for idx, var_data in enumerate(variants_data):
            material = var_data.pop('material')
            color = var_data.pop('color')
            stock = var_data.pop('stock')
            
            ProductVariant.objects.create(
                product=product,
                material=material.name,
                color=color.name,
                mrp=Decimal(var_data['mrp']),
                price=Decimal(var_data['price']),
                stock_quantity=stock,
                images=get_images_for_variant('office-chair', idx, 3),
                is_active=True,
                is_default=var_data.get('is_default', False)
            )
        
        all_products.append(product)
    
    # COFFEE TABLES
    print("  Creating coffee tables...")
    coffee_data = [
        {
            "name": "Industrial Metal & Wood Coffee Table",
            "description": "Urban industrial design with solid mango wood top and metal frame. Features lower shelf for storage. Perfect for modern and industrial-style living rooms. Easy to assemble.",
            "dimensions": {"length": 120, "width": 60, "height": 45, "unit": "cm"},
            "brand": urban_ladder,
            "is_bestseller": True,
            "is_hot_selling": True,
            "variants": [
                {"material": mango, "color": natural, "mrp": "16999", "price": "13999", "stock": 25, "is_default": True},
            ]
        },
        {
            "name": "Luxury Marble Top Coffee Table",
            "description": "Elegant coffee table with genuine marble top and gold-finished metal base. Makes a stunning centerpiece. Heat and stain resistant. Perfect for contemporary and luxury interiors.",
            "dimensions": {"length": 100, "width": 100, "height": 42, "unit": "cm"},
            "brand": durian,
            "is_bestseller": True,
            "is_hot_selling": False,
            "variants": [
                {"material": marble, "color": white, "mrp": "34999", "price": "29999", "stock": 10, "is_default": True},
                {"material": marble, "color": black, "mrp": "34999", "price": "29999", "stock": 8},
            ]
        },
        {
            "name": "Minimalist Glass Coffee Table",
            "description": "Sleek and modern glass coffee table with chrome legs. Tempered glass top for safety. Space-enhancing design perfect for small living rooms. Easy to clean and maintain.",
            "dimensions": {"length": 90, "width": 50, "height": 40, "unit": "cm"},
            "brand": pepperfry,
            "is_bestseller": False,
            "is_hot_selling": True,
            "variants": [
                {"material": glass, "color": black, "mrp": "9999", "price": "7999", "stock": 30, "is_default": True},
            ]
        },
    ]
    
    for prod_data in coffee_data:
        variants_data = prod_data.pop('variants')
        product = Product.objects.create(**prod_data, category=living_room, subcategory=coffee_tables_subcat, is_active=True)
        
        for idx, var_data in enumerate(variants_data):
            material = var_data.pop('material')
            color = var_data.pop('color')
            stock = var_data.pop('stock')
            
            ProductVariant.objects.create(
                product=product,
                material=material.name,
                color=color.name,
                mrp=Decimal(var_data['mrp']),
                price=Decimal(var_data['price']),
                stock_quantity=stock,
                images=get_images_for_variant('coffee-table', idx, 3),
                is_active=True,
                is_default=var_data.get('is_default', False)
            )
        
        all_products.append(product)
    
    print(f"✅ Created {len(all_products)} products with {ProductVariant.objects.count()} variants")
    return all_products


def main():
    """Main execution function."""
    print("=" * 60)
    print("🛋️  CAFCO HOME - Product Seeding with Real Images")
    print("=" * 60)
    
    products = create_products()
    
    print("\n" + "=" * 60)
    print("✅ Product seeding completed successfully!")
    print("=" * 60)
    print(f"\n📊 Summary:")
    print(f"   • Total Products: {len(products)}")
    print(f"   • Total Variants: {ProductVariant.objects.count()}")
    print(f"   • Images: Real furniture photos from Unsplash")
    print("\n🎉 All products now have working images!")
    print("=" * 60)


if __name__ == '__main__':
    main()
