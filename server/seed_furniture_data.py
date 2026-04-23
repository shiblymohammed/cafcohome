"""
Comprehensive seed data script for CAFCO Home furniture e-commerce.
This script clears existing data and populates the database with realistic furniture data.

Usage: python seed_furniture_data.py
"""

import os
import sys
import django
from datetime import datetime, timedelta
from decimal import Decimal

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cafcohome_api.settings')
django.setup()

from django.utils import timezone
from products.models import Category, Subcategory, Brand, Color, Material, Product, ProductVariant
from offers.models import Offer
from blog.models import BlogPost
from accounts.models import Staff, User

def clear_all_data():
    """Clear all existing data from the database."""
    print("🗑️  Clearing existing data...")
    
    ProductVariant.objects.all().delete()
    Product.objects.all().delete()
    Offer.objects.all().delete()
    BlogPost.objects.all().delete()
    Subcategory.objects.all().delete()
    Category.objects.all().delete()
    Brand.objects.all().delete()
    Material.objects.all().delete()
    Color.objects.all().delete()
    
    print("✅ All data cleared successfully!")


def create_colors():
    """Create color options."""
    print("\n🎨 Creating colors...")
    
    colors_data = [
        # Neutrals
        {"name": "White", "hex_code": "#FFFFFF"},
        {"name": "Ivory", "hex_code": "#FFFFF0"},
        {"name": "Beige", "hex_code": "#F5F5DC"},
        {"name": "Cream", "hex_code": "#FFFDD0"},
        {"name": "Light Gray", "hex_code": "#D3D3D3"},
        {"name": "Gray", "hex_code": "#808080"},
        {"name": "Charcoal", "hex_code": "#36454F"},
        {"name": "Black", "hex_code": "#000000"},
        
        # Browns & Woods
        {"name": "Natural Wood", "hex_code": "#DEB887"},
        {"name": "Walnut Brown", "hex_code": "#5C4033"},
        {"name": "Oak Brown", "hex_code": "#806517"},
        {"name": "Mahogany", "hex_code": "#C04000"},
        {"name": "Espresso", "hex_code": "#3D2817"},
        {"name": "Teak", "hex_code": "#B8860B"},
        
        # Blues
        {"name": "Navy Blue", "hex_code": "#000080"},
        {"name": "Royal Blue", "hex_code": "#4169E1"},
        {"name": "Sky Blue", "hex_code": "#87CEEB"},
        {"name": "Teal", "hex_code": "#008080"},
        {"name": "Turquoise", "hex_code": "#40E0D0"},
        
        # Greens
        {"name": "Emerald Green", "hex_code": "#50C878"},
        {"name": "Olive Green", "hex_code": "#808000"},
        {"name": "Sage Green", "hex_code": "#9DC183"},
        {"name": "Forest Green", "hex_code": "#228B22"},
        
        # Warm Colors
        {"name": "Burgundy", "hex_code": "#800020"},
        {"name": "Maroon", "hex_code": "#800000"},
        {"name": "Rust", "hex_code": "#B7410E"},
        {"name": "Terracotta", "hex_code": "#E2725B"},
        {"name": "Mustard Yellow", "hex_code": "#FFDB58"},
        {"name": "Gold", "hex_code": "#FFD700"},
        
        # Pastels
        {"name": "Blush Pink", "hex_code": "#FFB6C1"},
        {"name": "Lavender", "hex_code": "#E6E6FA"},
        {"name": "Mint Green", "hex_code": "#98FF98"},
    ]
    
    colors = []
    for color_data in colors_data:
        color = Color.objects.create(**color_data, is_active=True)
        colors.append(color)
    
    print(f"✅ Created {len(colors)} colors")
    return colors


def create_materials():
    """Create material options."""
    print("\n🪵 Creating materials...")
    
    materials_data = [
        {
            "name": "Solid Wood",
            "description": "Premium quality solid wood construction for durability and timeless appeal"
        },
        {
            "name": "Engineered Wood",
            "description": "High-quality engineered wood with excellent stability and finish"
        },
        {
            "name": "Sheesham Wood",
            "description": "Indian rosewood known for its rich grain patterns and durability"
        },
        {
            "name": "Mango Wood",
            "description": "Sustainable hardwood with beautiful natural grain variations"
        },
        {
            "name": "Teak Wood",
            "description": "Premium hardwood with natural oils, perfect for longevity"
        },
        {
            "name": "Oak Wood",
            "description": "Classic hardwood with distinctive grain and exceptional strength"
        },
        {
            "name": "Velvet Fabric",
            "description": "Luxurious soft-touch velvet upholstery for elegant comfort"
        },
        {
            "name": "Linen Fabric",
            "description": "Natural breathable linen fabric with a relaxed, textured look"
        },
        {
            "name": "Leather",
            "description": "Genuine leather upholstery for sophisticated, long-lasting furniture"
        },
        {
            "name": "Faux Leather",
            "description": "Premium synthetic leather that's easy to maintain and durable"
        },
        {
            "name": "Cotton Fabric",
            "description": "Soft, breathable cotton upholstery in various weaves"
        },
        {
            "name": "Microfiber",
            "description": "Stain-resistant synthetic fabric perfect for high-traffic areas"
        },
        {
            "name": "Metal Frame",
            "description": "Powder-coated metal construction for modern industrial aesthetics"
        },
        {
            "name": "Rattan",
            "description": "Natural woven rattan for bohemian and coastal styles"
        },
        {
            "name": "Cane",
            "description": "Traditional cane weaving for vintage and contemporary designs"
        },
        {
            "name": "Marble",
            "description": "Natural marble stone for luxurious table tops and surfaces"
        },
        {
            "name": "Glass",
            "description": "Tempered glass for modern, space-enhancing furniture pieces"
        },
        {
            "name": "Plywood",
            "description": "Multi-layered wood construction for strength and affordability"
        },
    ]
    
    materials = []
    for material_data in materials_data:
        material = Material.objects.create(**material_data, is_active=True)
        materials.append(material)
    
    print(f"✅ Created {len(materials)} materials")
    return materials


def create_brands():
    """Create furniture brands."""
    print("\n🏷️  Creating brands...")
    
    brands_data = [
        {
            "name": "Urban Ladder",
            "description": "Contemporary furniture for modern Indian homes",
            "logo_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/brands/urban-ladder-logo.png"
        },
        {
            "name": "Pepperfry",
            "description": "Stylish and affordable furniture solutions",
            "logo_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/brands/pepperfry-logo.png"
        },
        {
            "name": "Godrej Interio",
            "description": "Trusted Indian brand for quality home furniture",
            "logo_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/brands/godrej-logo.png"
        },
        {
            "name": "Durian",
            "description": "Premium furniture with Italian design influence",
            "logo_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/brands/durian-logo.png"
        },
        {
            "name": "HomeTown",
            "description": "Complete home furniture and decor solutions",
            "logo_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/brands/hometown-logo.png"
        },
        {
            "name": "Nilkamal",
            "description": "India's leading plastic and furniture manufacturer",
            "logo_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/brands/nilkamal-logo.png"
        },
        {
            "name": "Wakefit",
            "description": "Innovative sleep and furniture solutions",
            "logo_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/brands/wakefit-logo.png"
        },
        {
            "name": "IKEA",
            "description": "Swedish furniture giant with affordable modern designs",
            "logo_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/brands/ikea-logo.png"
        },
    ]
    
    brands = []
    for brand_data in brands_data:
        brand = Brand.objects.create(**brand_data, is_active=True)
        brands.append(brand)
    
    print(f"✅ Created {len(brands)} brands")
    return brands


def create_categories_and_subcategories():
    """Create categories and their subcategories."""
    print("\n📁 Creating categories and subcategories...")
    
    categories_data = [
        {
            "name": "Living Room",
            "subtitle": "Comfort meets style",
            "description": "Transform your living space with our curated collection of sofas, coffee tables, TV units, and accent chairs designed for modern living.",
            "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=800&fit=crop&q=80",
            "display_order": 1,
            "is_featured": True,
            "subcategories": [
                {
                    "name": "Sofas",
                    "description": "Comfortable and stylish sofas in various sizes and designs",
                    "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/subcategories/sofas.jpg",
                    "featured_icon_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/icons/sofa-icon.svg",
                    "display_order": 1,
                    "is_featured": True
                },
                {
                    "name": "Coffee Tables",
                    "description": "Functional and decorative coffee tables for your living room",
                    "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/subcategories/coffee-tables.jpg",
                    "featured_icon_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/icons/table-icon.svg",
                    "display_order": 2,
                    "is_featured": True
                },
                {
                    "name": "TV Units",
                    "description": "Modern TV stands and entertainment centers",
                    "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/subcategories/tv-units.jpg",
                    "featured_icon_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/icons/tv-unit-icon.svg",
                    "display_order": 3,
                    "is_featured": True
                },
                {
                    "name": "Accent Chairs",
                    "description": "Statement chairs to elevate your living room decor",
                    "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/subcategories/accent-chairs.jpg",
                    "featured_icon_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/icons/chair-icon.svg",
                    "display_order": 4,
                    "is_featured": False
                },
                {
                    "name": "Recliners",
                    "description": "Comfortable recliners for ultimate relaxation",
                    "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/subcategories/recliners.jpg",
                    "featured_icon_url": "",
                    "display_order": 5,
                    "is_featured": False
                },
            ]
        },
        {
            "name": "Bedroom",
            "subtitle": "Your personal sanctuary",
            "description": "Create the perfect retreat with our range of beds, wardrobes, nightstands, and dressers crafted for comfort and style.",
            "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/categories/bedroom.jpg",
            "display_order": 2,
            "is_featured": True,
            "subcategories": [
                {
                    "name": "Beds",
                    "description": "Comfortable beds in various sizes from single to king",
                    "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/subcategories/beds.jpg",
                    "featured_icon_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/icons/bed-icon.svg",
                    "display_order": 1,
                    "is_featured": True
                },
                {
                    "name": "Wardrobes",
                    "description": "Spacious wardrobes with smart storage solutions",
                    "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/subcategories/wardrobes.jpg",
                    "featured_icon_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/icons/wardrobe-icon.svg",
                    "display_order": 2,
                    "is_featured": True
                },
                {
                    "name": "Nightstands",
                    "description": "Bedside tables for convenience and style",
                    "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/subcategories/nightstands.jpg",
                    "featured_icon_url": "",
                    "display_order": 3,
                    "is_featured": False
                },
                {
                    "name": "Dressers",
                    "description": "Elegant dressers with ample storage",
                    "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/subcategories/dressers.jpg",
                    "featured_icon_url": "",
                    "display_order": 4,
                    "is_featured": False
                },
            ]
        },
        {
            "name": "Dining Room",
            "subtitle": "Gather and celebrate",
            "description": "Make every meal memorable with our dining tables, chairs, and storage solutions designed for family gatherings.",
            "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/categories/dining-room.jpg",
            "display_order": 3,
            "is_featured": True,
            "subcategories": [
                {
                    "name": "Dining Tables",
                    "description": "Elegant dining tables for 4, 6, or 8 seaters",
                    "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/subcategories/dining-tables.jpg",
                    "featured_icon_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/icons/dining-table-icon.svg",
                    "display_order": 1,
                    "is_featured": True
                },
                {
                    "name": "Dining Chairs",
                    "description": "Comfortable dining chairs in various styles",
                    "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/subcategories/dining-chairs.jpg",
                    "featured_icon_url": "",
                    "display_order": 2,
                    "is_featured": False
                },
                {
                    "name": "Bar Stools",
                    "description": "Modern bar stools for kitchen counters and bars",
                    "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/subcategories/bar-stools.jpg",
                    "featured_icon_url": "",
                    "display_order": 3,
                    "is_featured": False
                },
                {
                    "name": "Buffets & Sideboards",
                    "description": "Storage solutions for your dining room",
                    "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/subcategories/buffets.jpg",
                    "featured_icon_url": "",
                    "display_order": 4,
                    "is_featured": False
                },
            ]
        },
        {
            "name": "Office",
            "subtitle": "Productivity in style",
            "description": "Boost your work-from-home setup with ergonomic office chairs, functional desks, and smart storage solutions.",
            "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/categories/office.jpg",
            "display_order": 4,
            "is_featured": True,
            "subcategories": [
                {
                    "name": "Office Chairs",
                    "description": "Ergonomic chairs for comfortable work sessions",
                    "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/subcategories/office-chairs.jpg",
                    "featured_icon_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/icons/office-chair-icon.svg",
                    "display_order": 1,
                    "is_featured": True
                },
                {
                    "name": "Office Desks",
                    "description": "Functional desks for home and office use",
                    "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/subcategories/office-desks.jpg",
                    "featured_icon_url": "",
                    "display_order": 2,
                    "is_featured": False
                },
                {
                    "name": "Bookshelves",
                    "description": "Display and storage solutions for books and decor",
                    "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/subcategories/bookshelves.jpg",
                    "featured_icon_url": "",
                    "display_order": 3,
                    "is_featured": False
                },
                {
                    "name": "Filing Cabinets",
                    "description": "Organized storage for documents and supplies",
                    "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/subcategories/filing-cabinets.jpg",
                    "featured_icon_url": "",
                    "display_order": 4,
                    "is_featured": False
                },
            ]
        },
        {
            "name": "Outdoor",
            "subtitle": "Extend your living space",
            "description": "Enjoy the outdoors with our weather-resistant patio furniture, garden seating, and outdoor dining sets.",
            "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/categories/outdoor.jpg",
            "display_order": 5,
            "is_featured": False,
            "subcategories": [
                {
                    "name": "Patio Sets",
                    "description": "Complete outdoor seating arrangements",
                    "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/subcategories/patio-sets.jpg",
                    "featured_icon_url": "",
                    "display_order": 1,
                    "is_featured": False
                },
                {
                    "name": "Garden Chairs",
                    "description": "Comfortable seating for your garden or balcony",
                    "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/subcategories/garden-chairs.jpg",
                    "featured_icon_url": "",
                    "display_order": 2,
                    "is_featured": False
                },
                {
                    "name": "Outdoor Tables",
                    "description": "Durable tables for outdoor dining and entertaining",
                    "image_url": "https://res.cloudinary.com/djlgcbpkq/image/upload/v1/subcategories/outdoor-tables.jpg",
                    "featured_icon_url": "",
                    "display_order": 3,
                    "is_featured": False
                },
            ]
        },
    ]
    
    categories = []
    subcategories = []
    
    for cat_data in categories_data:
        subcat_data_list = cat_data.pop('subcategories')
        category = Category.objects.create(**cat_data, is_active=True)
        categories.append(category)
        
        for subcat_data in subcat_data_list:
            subcategory = Subcategory.objects.create(
                **subcat_data,
                category=category,
                is_active=True
            )
            subcategories.append(subcategory)
    
    print(f"✅ Created {len(categories)} categories and {len(subcategories)} subcategories")
    return categories, subcategories


def main():
    """Main execution function."""
    print("=" * 60)
    print("🏠 CAFCO HOME - Furniture Database Seeding")
    print("=" * 60)
    
    # Step 1: Clear existing data
    clear_all_data()
    
    # Step 2: Create base data
    colors = create_colors()
    materials = create_materials()
    brands = create_brands()
    categories, subcategories = create_categories_and_subcategories()
    
    print("\n" + "=" * 60)
    print("✅ Database seeding completed successfully!")
    print("=" * 60)
    print(f"\n📊 Summary:")
    print(f"   • Colors: {len(colors)}")
    print(f"   • Materials: {len(materials)}")
    print(f"   • Brands: {len(brands)}")
    print(f"   • Categories: {len(categories)}")
    print(f"   • Subcategories: {len(subcategories)}")
    print("\n🎉 Ready to add products through the admin panel!")
    print("=" * 60)


if __name__ == '__main__':
    main()
