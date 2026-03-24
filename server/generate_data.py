import os
import django
import random
import uuid
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cafcohome_api.settings')
django.setup()

from products.models import Category, Subcategory, Brand, Product, ProductVariant, Color, Material
from offers.models import Offer

def run():
    print("Clearing existing data...")
    Offer.objects.all().delete()
    ProductVariant.objects.all().delete()
    Product.objects.all().delete()
    Brand.objects.all().delete()
    Subcategory.objects.all().delete()
    Category.objects.all().delete()
    Color.objects.all().delete()
    Material.objects.all().delete()
    
    print("Creating Colors...")
    COLOR_HEX_MAP = {
        "Navy Blue": "#000080",
        "Emerald Green": "#50C878",
        "Charcoal Grey": "#36454F",
        "Cream White": "#FFFDD0",
        "Walnut Brown": "#773F1A",
        "Mustard Yellow": "#FFDB58",
        "Blush Pink": "#FE828C",
        "Jet Black": "#0A0A0A"
    }
    for color_name, hex_code in COLOR_HEX_MAP.items():
        Color.objects.create(name=color_name, hex_code=hex_code, is_active=True)

    print("Creating Categories...")
    category_names = [
        "Living Room", "Bedroom", "Dining Room", "Home Office", 
        "Outdoor", "Decor", "Lighting", "Kitchen", "Bathroom", "Storage"
    ]
    
    # Unsplash image IDs for categories
    cat_images = [
        "https://picsum.photos/seed/livingroom/800/800",
        "https://picsum.photos/seed/bedroom/800/800",
        "https://picsum.photos/seed/diningroom/800/800",
        "https://picsum.photos/seed/homeoffice/800/800",
        "https://picsum.photos/seed/outdoor/800/800",
        "https://picsum.photos/seed/decor/800/800",
        "https://picsum.photos/seed/lighting/800/800",
        "https://picsum.photos/seed/kitchen/800/800",
        "https://picsum.photos/seed/bathroom/800/800",
        "https://picsum.photos/seed/storage/800/800"
    ]
    
    categories = []
    for i, name in enumerate(category_names):
        is_featured = i < 4  # First 4 are featured
        cat = Category.objects.create(
            name=name,
            subtitle=f"Premium {name} Furniture",
            description=f"Explore our exclusive collection of {name} furniture. Elevate your space.",
            image_url=cat_images[i] + "?w=800&q=80",
            display_order=i,
            is_featured=is_featured
        )
        categories.append(cat)
    
    print("Creating Subcategories...")
    subcat_mapping = {
        "Living Room": ["Sofas", "Sectionals", "Coffee Tables", "TV Stands", "Accent Chairs"],
        "Bedroom": ["Beds", "Nightstands", "Dressers", "Mattresses", "Wardrobes"],
        "Dining Room": ["Dining Tables", "Dining Chairs", "Bar Stools", "Sideboards", "Benches"],
        "Home Office": ["Desks", "Office Chairs", "Bookcases", "Filing Cabinets"],
        "Outdoor": ["Patio Sets", "Outdoor Chairs", "Outdoor Tables", "Loungers"],
        "Decor": ["Rugs", "Mirrors", "Wall Art", "Vases", "Clocks"],
        "Lighting": ["Chandeliers", "Table Lamps", "Floor Lamps", "Pendant Lights"],
        "Kitchen": ["Kitchen Islands", "Carts", "Pantry Cabinets"],
        "Bathroom": ["Vanities", "Storage Cabinets", "Mirrors"],
        "Storage": ["Shoe Racks", "Storage Benches", "Shelving Units"]
    }
    
    subcategories = []
    for cat in categories:
        sub_names = subcat_mapping.get(cat.name, ["Misc"])
        for i, sub_name in enumerate(sub_names):
            # Feature some subcategories
            is_featured = random.choice([True, False, False])
            sub = Subcategory.objects.create(
                category=cat,
                name=sub_name,
                description=f"High quality {sub_name} for your home.",
                display_order=i,
                is_featured=is_featured,
                image_url=f"https://picsum.photos/seed/{cat.id}{i}/600/400",
                featured_icon_url=f"https://picsum.photos/seed/icon{cat.id}{i}/100/100"
            )
            subcategories.append(sub)

    print("Creating Brands...")
    brand_names = ["Cafco Signature", "Nordic Haven", "Urban Loft", "Classic Comfort", "Modern Minimalist"]
    brands = []
    for bn in brand_names:
        brand = Brand.objects.create(
            name=bn,
            description=f"{bn} brings you the finest quality furniture.",
            logo_url=f"https://picsum.photos/seed/{bn.replace(' ', '')}/400/200"
        )
        brands.append(brand)

    print("Creating Products and Variants (this may take a minute)...")
    adjectives = ["Elegant", "Modern", "Classic", "Rustic", "Luxury", "Minimalist", "Cozy", "Petite", "Grand", "Sleek"]
    colors = ["Navy Blue", "Emerald Green", "Charcoal Grey", "Cream White", "Walnut Brown", "Mustard Yellow", "Blush Pink", "Jet Black"]
    materials = ["Velvet", "Leather", "Solid Oak", "Linen", "Teak Wood", "Marble", "Brass", "Glass"]
    
    product_count = 0
    # Attempt to create roughly 200 products total -> ~5 per subcategory
    for sub in subcategories:
        for p_idx in range(5):
            adj = random.choice(adjectives)
            brand = random.choice(brands)
            prod_name = f"{adj} {sub.name.rstrip('s')} by {brand.name.split()[0]}"
            
            is_bestseller = random.random() < 0.15  # 15% chance
            is_hot_selling = random.random() < 0.20 # 20% chance
            
            # Dimensions {length, width, height, unit}
            dims = {
                "length": random.randint(40, 200),
                "width": random.randint(40, 200),
                "height": random.randint(30, 150),
                "unit": "cm"
            }
            
            product = Product.objects.create(
                name=prod_name,
                description=f"Discover the perfect blend of style and comfort with our {prod_name}. Perfectly suited for any modern home. Proudly part of the {brand.name} collection.",
                dimensions=dims,
                category=sub.category,
                subcategory=sub,
                brand=brand,
                is_bestseller=is_bestseller,
                is_hot_selling=is_hot_selling
            )
            product_count += 1
            
            # Add 1-3 variants per product
            num_variants = random.randint(1, 3)
            selected_combos = set()
            
            for v_idx in range(num_variants):
                color = random.choice(colors)
                mat = random.choice(materials)
                
                # ensure unique color/material combo for this product
                while (color, mat) in selected_combos:
                    color = random.choice(colors)
                    mat = random.choice(materials)
                selected_combos.add((color, mat))
                
                base_price = Decimal(random.randint(100, 2500))
                mrp = base_price * Decimal(random.uniform(1.1, 1.5)) # MRP is 10-50% higher
                
                images = [
                    {"url": f"https://picsum.photos/seed/{product.id}{v_idx}1/800/800", "alt": prod_name},
                    {"url": f"https://picsum.photos/seed/{product.id}{v_idx}2/800/800", "alt": prod_name}
                ]
                
                is_default = (v_idx == 0)
                
                ProductVariant.objects.create(
                    product=product,
                    color=color,
                    material=mat,
                    mrp=round(mrp, 2),
                    price=round(base_price, 2),
                    stock_quantity=random.randint(0, 50),
                    images=images,
                    is_default=is_default
                )
                
    print(f"Created {product_count} products with multiple variants.")

    print("Creating Offers...")
    now = timezone.now()
    offers_data = [
        {"name": "Summer Clearance Sale", "type": "collection", "discount": 20, "is_featured": True},
        {"name": "Flash Sale: Sofas", "type": "category", "discount": 15, "is_featured": True},
        {"name": "Cafco Signature Exclusive", "type": "brand", "discount": 10, "is_featured": True},
        {"name": "Bestsellers Double Discount", "type": "product", "discount": 25, "is_featured": True},
        {"name": "Minor Decor Discount", "type": "collection", "discount": 5, "is_featured": False},
    ]
    
    for o_data in offers_data:
        offer = Offer.objects.create(
            name=o_data["name"],
            description=f"Enjoy {o_data['discount']}% off during our {o_data['name']}!",
            discount_percentage=o_data['discount'],
            apply_to=o_data["type"],
            start_date=now - timedelta(days=2),
            end_date=now + timedelta(days=30),
            is_active=True,
            is_featured=o_data["is_featured"],
            image_url=f"https://picsum.photos/seed/{o_data['name'].replace(' ', '')}/1200/400"
        )
        
        # apply offer
        if o_data["type"] == "collection":
            # applies to a few categories
            cats = list(Category.objects.all()[:2])
            offer.collections.set(cats)
        elif o_data["type"] == "category":
            subcats = list(Subcategory.objects.filter(name="Sofas")[:2])
            offer.categories.set(subcats)
        elif o_data["type"] == "brand":
            brands_list = list(Brand.objects.filter(name="Cafco Signature"))
            offer.brands.set(brands_list)
        elif o_data["type"] == "product":
            prods = list(Product.objects.filter(is_bestseller=True)[:10])
            offer.products.set(prods)
            
    print("Offers created successfully!")
    print("Mock data generation completed successfully!")

if __name__ == '__main__':
    run()
