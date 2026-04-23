"""
Seed offers and blog posts for CAFCO Home.
Run this after seed_products.py

Usage: python seed_offers_blogs.py
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
from products.models import Category, Subcategory, Brand, Product
from offers.models import Offer
from blog.models import BlogPost
from accounts.models import Staff


def create_offers():
    """Create promotional offers."""
    print("\n🎁 Creating offers...")
    
    now = timezone.now()
    
    # Get some products, categories, and brands
    living_room = Category.objects.get(name="Living Room")
    bedroom = Category.objects.get(name="Bedroom")
    sofas_subcat = Subcategory.objects.get(name="Sofas")
    beds_subcat = Subcategory.objects.get(name="Beds")
    urban_ladder = Brand.objects.get(name="Urban Ladder")
    
    offers_data = [
        {
            "name": "Mega Living Room Sale",
            "description": "Transform your living space with up to 25% off on all sofas, coffee tables, and TV units. Limited time offer!",
            "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=400&fit=crop&q=80",
            "discount_percentage": Decimal("25.00"),
            "apply_to": "collection",
            "start_date": now - timedelta(days=5),
            "end_date": now + timedelta(days=25),
            "is_active": True,
            "is_featured": True,
            "collections": [living_room]
        },
        {
            "name": "Bedroom Bonanza",
            "description": "Create your dream bedroom! Get 20% off on all beds, wardrobes, and nightstands. Hurry, offer ends soon!",
            "image_url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&h=400&fit=crop&q=80",
            "discount_percentage": Decimal("20.00"),
            "apply_to": "collection",
            "start_date": now - timedelta(days=3),
            "end_date": now + timedelta(days=27),
            "is_active": True,
            "is_featured": True,
            "collections": [bedroom]
        },
        {
            "name": "Sofa Spectacular",
            "description": "Sink into comfort with 30% off on all sofas. From 2-seaters to L-shaped sectionals, find your perfect match!",
            "image_url": "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&h=400&fit=crop&q=80",
            "discount_percentage": Decimal("30.00"),
            "apply_to": "category",
            "start_date": now - timedelta(days=2),
            "end_date": now + timedelta(days=18),
            "is_active": True,
            "is_featured": True,
            "categories": [sofas_subcat]
        },
        {
            "name": "Urban Ladder Brand Days",
            "description": "Exclusive Urban Ladder collection at 15% off. Premium quality furniture at unbeatable prices!",
            "image_url": "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=1200&h=400&fit=crop&q=80",
            "discount_percentage": Decimal("15.00"),
            "apply_to": "brand",
            "start_date": now - timedelta(days=1),
            "end_date": now + timedelta(days=14),
            "is_active": True,
            "is_featured": True,
            "brands": [urban_ladder]
        },
        {
            "name": "Clearance Sale - Beds",
            "description": "Last chance! Get 35% off on selected bed models. Stock clearance - while supplies last!",
            "image_url": "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&h=400&fit=crop&q=80",
            "discount_percentage": Decimal("35.00"),
            "apply_to": "category",
            "start_date": now,
            "end_date": now + timedelta(days=10),
            "is_active": True,
            "is_featured": False,
            "categories": [beds_subcat]
        },
        {
            "name": "Festive Home Makeover",
            "description": "Celebrate with style! Flat 18% off on all furniture categories. Make your home festive-ready!",
            "image_url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=400&fit=crop&q=80",
            "discount_percentage": Decimal("18.00"),
            "apply_to": "collection",
            "start_date": now + timedelta(days=5),
            "end_date": now + timedelta(days=35),
            "is_active": True,
            "is_featured": False,
            "collections": [living_room, bedroom]
        },
    ]
    
    offers = []
    for offer_data in offers_data:
        # Extract many-to-many fields
        collections = offer_data.pop('collections', [])
        categories = offer_data.pop('categories', [])
        brands = offer_data.pop('brands', [])
        products = offer_data.pop('products', [])
        
        # Create offer
        offer = Offer.objects.create(**offer_data)
        
        # Add many-to-many relationships
        if collections:
            offer.collections.set(collections)
        if categories:
            offer.categories.set(categories)
        if brands:
            offer.brands.set(brands)
        if products:
            offer.products.set(products)
        
        offers.append(offer)
    
    print(f"✅ Created {len(offers)} offers")
    return offers


def create_blog_posts():
    """Create blog posts."""
    print("\n📝 Creating blog posts...")
    
    # Try to get or create a staff member for blog authorship
    try:
        author = Staff.objects.first()
        if not author:
            author = Staff.objects.create(
                username="admin",
                email="admin@cafcohome.com",
                first_name="Admin",
                last_name="User",
                role="admin",
                is_active=True
            )
            author.set_password("admin123")
            author.save()
    except Exception as e:
        print(f"⚠️  Could not create author: {e}")
        author = None
    
    now = timezone.now()
    
    blog_posts_data = [
        {
            "title": "10 Tips for Choosing the Perfect Sofa for Your Living Room",
            "content": """
                <h2>Finding Your Perfect Sofa</h2>
                <p>Choosing the right sofa is one of the most important decisions you'll make for your living room. Here are our top 10 tips to help you find the perfect match:</p>
                
                <h3>1. Measure Your Space</h3>
                <p>Before falling in love with a sofa, measure your living room carefully. Consider doorways, hallways, and the space around the sofa for comfortable movement.</p>
                
                <h3>2. Consider Your Lifestyle</h3>
                <p>Do you have kids or pets? Opt for durable, stain-resistant fabrics like microfiber or leather. For formal spaces, velvet or linen might be perfect.</p>
                
                <h3>3. Think About Comfort</h3>
                <p>Test the sofa in person if possible. Sit on it, lean back, and imagine spending hours there. The right depth and firmness matter!</p>
                
                <h3>4. Choose the Right Size</h3>
                <p>From compact 2-seaters to spacious L-shaped sectionals, size matters. A sofa should fit your space without overwhelming it.</p>
                
                <h3>5. Pick a Timeless Color</h3>
                <p>While trendy colors are tempting, neutral tones like gray, beige, or navy offer longevity and versatility.</p>
                
                <p>Visit our showroom to explore our curated collection of sofas designed for every style and budget!</p>
            """,
            "excerpt": "Discover expert tips for selecting the perfect sofa that combines style, comfort, and functionality for your living space.",
            "featured_image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=600&fit=crop&q=80",
            "meta_title": "10 Tips for Choosing the Perfect Sofa | CAFCO Home",
            "meta_description": "Expert guide to choosing the perfect sofa for your living room. Learn about size, fabric, comfort, and style considerations.",
            "status": "published",
            "is_featured": True,
            "published_at": now - timedelta(days=15)
        },
        {
            "title": "Small Space Living: Furniture Solutions for Compact Homes",
            "content": """
                <h2>Maximize Your Small Space</h2>
                <p>Living in a compact home doesn't mean compromising on style or functionality. Here's how to make the most of every square foot:</p>
                
                <h3>Multi-Functional Furniture</h3>
                <p>Invest in pieces that serve multiple purposes. Storage beds, sofa-cum-beds, and extendable dining tables are game-changers for small spaces.</p>
                
                <h3>Vertical Storage Solutions</h3>
                <p>Think upward! Wall-mounted shelves, tall bookcases, and vertical cabinets maximize storage without eating up floor space.</p>
                
                <h3>Light Colors and Mirrors</h3>
                <p>Light-colored furniture and strategic mirror placement can make rooms feel larger and more open.</p>
                
                <h3>Compact Furniture Designs</h3>
                <p>Choose furniture with slim profiles and raised legs. This creates visual space and makes cleaning easier.</p>
                
                <p>Explore our small space collection designed specifically for urban apartments and compact homes!</p>
            """,
            "excerpt": "Transform your compact home with smart furniture choices and space-saving solutions that don't compromise on style.",
            "featured_image_url": "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&h=600&fit=crop&q=80",
            "meta_title": "Small Space Furniture Solutions | CAFCO Home Blog",
            "meta_description": "Discover furniture solutions and design tips for maximizing small living spaces without sacrificing style or comfort.",
            "status": "published",
            "is_featured": True,
            "published_at": now - timedelta(days=10)
        },
        {
            "title": "Bedroom Makeover: Creating Your Personal Sanctuary",
            "content": """
                <h2>Transform Your Bedroom</h2>
                <p>Your bedroom should be a peaceful retreat from the world. Here's how to create the perfect sanctuary:</p>
                
                <h3>Start with the Right Bed</h3>
                <p>The bed is the centerpiece of any bedroom. Choose a size that fits your space and needs - from single to king size.</p>
                
                <h3>Storage Solutions</h3>
                <p>Clutter-free spaces promote better sleep. Invest in wardrobes, dressers, and under-bed storage to keep everything organized.</p>
                
                <h3>Lighting Matters</h3>
                <p>Layer your lighting with ambient, task, and accent lights. Bedside lamps are essential for reading and creating ambiance.</p>
                
                <h3>Color Psychology</h3>
                <p>Soft, calming colors like blues, greens, and neutrals promote relaxation and better sleep quality.</p>
                
                <h3>Personal Touches</h3>
                <p>Add artwork, plants, and textiles that reflect your personality and make the space truly yours.</p>
                
                <p>Browse our bedroom collection for inspiration and quality furniture pieces!</p>
            """,
            "excerpt": "Learn how to transform your bedroom into a peaceful sanctuary with the right furniture, colors, and design elements.",
            "featured_image_url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&h=600&fit=crop&q=80",
            "meta_title": "Bedroom Makeover Guide | Create Your Sanctuary",
            "meta_description": "Expert tips for creating a peaceful bedroom sanctuary with the right furniture, lighting, and design choices.",
            "status": "published",
            "is_featured": True,
            "published_at": now - timedelta(days=7)
        },
        {
            "title": "Work From Home: Setting Up an Ergonomic Home Office",
            "content": """
                <h2>Your Home Office Setup Guide</h2>
                <p>With remote work becoming the norm, creating an ergonomic and productive home office is essential:</p>
                
                <h3>Invest in a Good Chair</h3>
                <p>An ergonomic office chair with lumbar support is non-negotiable. Your back will thank you after long work hours!</p>
                
                <h3>Desk Height Matters</h3>
                <p>Your desk should allow your arms to rest at a 90-degree angle when typing. Consider adjustable height desks for flexibility.</p>
                
                <h3>Monitor Positioning</h3>
                <p>Your screen should be at eye level, about an arm's length away. This prevents neck strain and eye fatigue.</p>
                
                <h3>Lighting and Ambiance</h3>
                <p>Natural light is best, but supplement with task lighting. Avoid glare on your screen.</p>
                
                <h3>Organization is Key</h3>
                <p>Filing cabinets, desk organizers, and bookshelves keep your workspace clutter-free and productive.</p>
                
                <p>Check out our office furniture collection designed for comfort and productivity!</p>
            """,
            "excerpt": "Create a productive and comfortable home office with ergonomic furniture and smart setup strategies.",
            "featured_image_url": "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=1200&h=600&fit=crop&q=80",
            "meta_title": "Ergonomic Home Office Setup Guide | CAFCO Home",
            "meta_description": "Learn how to set up an ergonomic home office with the right furniture and equipment for maximum productivity and comfort.",
            "status": "published",
            "is_featured": False,
            "published_at": now - timedelta(days=5)
        },
        {
            "title": "Dining Room Design: Creating the Perfect Gathering Space",
            "content": """
                <h2>Design Your Dream Dining Room</h2>
                <p>The dining room is where families gather and memories are made. Here's how to create the perfect space:</p>
                
                <h3>Choose the Right Table Size</h3>
                <p>Measure your space and allow at least 36 inches around the table for comfortable movement. Consider extendable tables for flexibility.</p>
                
                <h3>Seating Comfort</h3>
                <p>Dining chairs should be comfortable enough for long meals. Consider upholstered options for extra comfort.</p>
                
                <h3>Lighting is Crucial</h3>
                <p>A statement chandelier or pendant light centered over the table creates ambiance and provides functional lighting.</p>
                
                <h3>Storage Solutions</h3>
                <p>Buffets and sideboards provide storage for dinnerware while adding style to your dining room.</p>
                
                <h3>Style Consistency</h3>
                <p>Whether modern, traditional, or eclectic, maintain a consistent style throughout your dining space.</p>
                
                <p>Explore our dining room collection for tables, chairs, and storage solutions!</p>
            """,
            "excerpt": "Design a dining room that brings family and friends together with the perfect furniture and layout.",
            "featured_image_url": "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200&h=600&fit=crop&q=80",
            "meta_title": "Dining Room Design Guide | CAFCO Home Blog",
            "meta_description": "Create the perfect dining room for family gatherings with expert tips on furniture selection and layout.",
            "status": "published",
            "is_featured": False,
            "published_at": now - timedelta(days=3)
        },
        {
            "title": "Furniture Care 101: Maintaining Your Investment",
            "content": """
                <h2>Keep Your Furniture Looking New</h2>
                <p>Quality furniture is an investment. Here's how to maintain it for years to come:</p>
                
                <h3>Wood Furniture Care</h3>
                <p>Dust regularly with a soft cloth. Use wood polish occasionally. Avoid direct sunlight and heat sources to prevent fading and cracking.</p>
                
                <h3>Upholstery Maintenance</h3>
                <p>Vacuum regularly to remove dust and debris. Treat stains immediately. Consider professional cleaning annually.</p>
                
                <h3>Leather Care</h3>
                <p>Wipe with a damp cloth weekly. Use leather conditioner every 6-12 months to prevent cracking.</p>
                
                <h3>Metal Furniture</h3>
                <p>Wipe with a damp cloth and dry immediately. Touch up scratches with matching paint to prevent rust.</p>
                
                <h3>General Tips</h3>
                <p>Use coasters and placemats. Rotate cushions regularly. Keep furniture away from direct heat and sunlight.</p>
                
                <p>Follow these tips to keep your CAFCO Home furniture looking beautiful for years!</p>
            """,
            "excerpt": "Learn essential furniture care tips to protect your investment and keep your pieces looking beautiful for years.",
            "featured_image_url": "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&h=600&fit=crop&q=80",
            "meta_title": "Furniture Care and Maintenance Guide | CAFCO Home",
            "meta_description": "Expert tips for maintaining and caring for your furniture to ensure it stays beautiful and functional for years.",
            "status": "published",
            "is_featured": False,
            "published_at": now - timedelta(days=1)
        },
    ]
    
    blog_posts = []
    for post_data in blog_posts_data:
        post = BlogPost.objects.create(**post_data, author=author)
        blog_posts.append(post)
    
    print(f"✅ Created {len(blog_posts)} blog posts")
    return blog_posts


def main():
    """Main execution function."""
    print("=" * 60)
    print("🎁 CAFCO HOME - Offers & Blog Seeding")
    print("=" * 60)
    
    # Create offers and blog posts
    offers = create_offers()
    blog_posts = create_blog_posts()
    
    print("\n" + "=" * 60)
    print("✅ Offers and blog seeding completed successfully!")
    print("=" * 60)
    print(f"\n📊 Summary:")
    print(f"   • Offers: {len(offers)}")
    print(f"   • Blog Posts: {len(blog_posts)}")
    print("\n🎉 Your e-commerce database is fully populated!")
    print("=" * 60)


if __name__ == '__main__':
    main()
