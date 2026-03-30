"""
Management command to seed blog posts for CAFCO Home.
Creates furniture/interior design themed blog posts.
"""

import os
import sys
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

from blog.models import BlogPost
from accounts.models import Staff


BLOG_POSTS = [
    {
        "title": "The Art of Choosing the Perfect Sofa for Your Living Room",
        "excerpt": "Your sofa is the anchor of your living room. Discover how to select the ideal piece that balances comfort, style, and durability — from fabric choices to frame construction.",
        "content": """
<h2>Why Your Sofa Choice Matters</h2>
<p>The sofa is often the most used — and most seen — piece of furniture in any home. It's where you unwind after a long day, host friends for movie nights, and sometimes even sneak in a weekend nap. Yet, many homeowners rush through this decision, ending up with a piece that doesn't quite fit their space or lifestyle.</p>

<h2>Understanding Frame Construction</h2>
<p>A great sofa starts with a solid frame. Kiln-dried hardwood frames — typically made from oak, birch, or maple — are the gold standard. They resist warping and cracking far better than softwood or engineered wood alternatives. When testing a sofa in-showroom, lift one corner about 6 inches off the floor. If the other front leg also lifts, the frame is sturdy and well-connected.</p>

<h3>What to Avoid</h3>
<p>Stay away from frames held together solely by staples or glue. Look for corner-blocked, doweled, or double-doweled joinery — these techniques have been trusted by craftsmen for centuries.</p>

<h2>Fabric vs. Leather: The Eternal Debate</h2>
<p>Both materials have their merits. Leather develops a beautiful patina over time and is remarkably easy to clean — a huge plus for pet owners. High-quality fabric, on the other hand, offers an endless palette of colors and textures, and modern performance fabrics can resist stains just as effectively as leather.</p>

<h3>Performance Fabrics to Consider</h3>
<ul>
<li><strong>Crypton:</strong> Engineered to resist moisture, stains, and odors</li>
<li><strong>Sunbrella:</strong> Originally designed for outdoor use, it's incredibly durable indoors too</li>
<li><strong>Velvet:</strong> Surprisingly durable and adds a luxurious feel to any space</li>
</ul>

<h2>Proportions and Scale</h2>
<p>Before falling in love with a sofa online, measure your room carefully. A general rule: your sofa should take up roughly two-thirds the length of the wall it sits against. Leave at least 18 inches of walkway space around it, and ensure there's about 18 inches between the sofa and your coffee table.</p>

<h2>Our Top Picks This Season</h2>
<p>At CAFCO Home, we've curated a collection that blends timeless design with modern comfort. From our cloud-soft modular sectionals to our sleek mid-century inspired pieces, every sofa in our range is built to last — and to look stunning while doing it.</p>

<p><em>Visit our showroom or browse our living room collection online to find the sofa that speaks to you.</em></p>
""",
        "featured_image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=800&fit=crop&q=80",
        "meta_title": "How to Choose the Perfect Sofa | CAFCO Home Guide",
        "meta_description": "Expert tips on selecting the ideal sofa for your living room. Learn about frame construction, fabric choices, and proportions from CAFCO Home.",
        "status": "published",
        "is_featured": True,
        "days_ago": 3,
    },
    {
        "title": "Minimalist Dining: Creating an Elegant Table Setting",
        "excerpt": "Less is more when it comes to modern dining. Learn how to create a refined table setting that elevates everyday meals into memorable experiences with thoughtful design choices.",
        "content": """
<h2>The Philosophy of Minimalist Dining</h2>
<p>Minimalist design isn't about having less — it's about making room for what matters. When applied to your dining space, this philosophy transforms everyday meals into intentional moments. A well-set minimalist table puts the focus on the food, the company, and the quiet beauty of carefully chosen objects.</p>

<h2>Start with the Table</h2>
<p>Your dining table is the foundation. Opt for clean lines and natural materials — a solid walnut table with tapered legs, or a sleek marble-top piece with brushed steel supports. The key is to let the material speak for itself without ornate carvings or heavy detailing.</p>

<h3>The Right Size</h3>
<p>Allow 24 inches of table width per person and at least 36 inches between the table edge and any wall or furniture for comfortable movement. For a family of four, a table measuring 48" x 30" is the perfect starting point.</p>

<h2>Curating Your Tableware</h2>
<p>Choose a single color palette — all white, soft grey, or matte black are timeless options. Each piece should feel intentional:</p>
<ul>
<li><strong>Plates:</strong> Opt for flat, rimless designs in matte finishes</li>
<li><strong>Glassware:</strong> Simple, clear tumblers work for both water and wine</li>
<li><strong>Cutlery:</strong> Brushed stainless steel or matte gold in simple silhouettes</li>
<li><strong>Napkins:</strong> Linen in a neutral tone, loosely folded rather than fanned</li>
</ul>

<h2>The Power of One Statement Piece</h2>
<p>A single branch of eucalyptus in a ceramic vase. A hand-thrown candle holder. One perfectly ripe pear on a small plate. Minimalist table settings come alive with one focal point that draws the eye without creating clutter.</p>

<h2>Lighting Sets the Mood</h2>
<p>Hang a sculptural pendant 30–36 inches above the table surface. Warm-toned bulbs (2700K) create an inviting glow. For evening dinners, consider a pair of taper candles in simple brass holders — nothing creates ambiance quite like candlelight.</p>

<p><em>Explore our dining collection at CAFCO Home — where every piece is designed to make the ordinary feel extraordinary.</em></p>
""",
        "featured_image_url": "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200&h=800&fit=crop&q=80",
        "meta_title": "Minimalist Dining Table Setting Ideas | CAFCO Home",
        "meta_description": "Create an elegant minimalist dining experience. Tips on table selection, tableware curation, and lighting for refined everyday meals.",
        "status": "published",
        "is_featured": True,
        "days_ago": 7,
    },
    {
        "title": "Bedroom Sanctuary: Designing a Space for Restful Sleep",
        "excerpt": "Transform your bedroom into a true sanctuary. From choosing the right bed frame to mastering the art of layered bedding, here's your complete guide to designing a sleep-friendly space.",
        "content": """
<h2>Your Bedroom Should Feel Like a Retreat</h2>
<p>In today's always-on world, your bedroom is more important than ever. It should be a refuge — a space that signals to your brain that it's time to rest. Good bedroom design isn't just about aesthetics; it directly impacts the quality of your sleep and, by extension, your health.</p>

<h2>Choosing the Right Bed Frame</h2>
<p>The bed frame sets the tone for the entire room. Upholstered headboards in soft bouclé or linen add warmth and sound absorption. Solid wood frames in walnut or oak bring a grounding, natural element. Platform beds with low profiles create a sense of spaciousness, even in smaller rooms.</p>

<h3>Mattress Height Matters</h3>
<p>The top of your mattress should sit about 25 inches from the floor — roughly knee height — for easy getting in and out. Pair your frame choice with the right mattress thickness to hit this sweet spot.</p>

<h2>The Art of Layered Bedding</h2>
<p>Great bedding isn't about piling on more — it's about the right layers:</p>
<ol>
<li><strong>Fitted sheet:</strong> Crisp cotton or cool linen in white or a soft neutral</li>
<li><strong>Top sheet:</strong> Optional but lovely in percale cotton for breathability</li>
<li><strong>Duvet:</strong> A quality down or down-alternative duvet in a simple linen cover</li>
<li><strong>Throw blanket:</strong> Folded at the foot in a complementary texture — chunky knit, waffle weave, or cashmere</li>
<li><strong>Pillows:</strong> Two sleeping pillows, two Euro shams behind them, and one smaller accent pillow</li>
</ol>

<h2>Color and Light</h2>
<p>Stick to a muted, tonal color palette — soft whites, warm greys, dusty blues, or sage greens. Avoid high-contrast patterns that visually stimulate. For window treatments, blackout curtains in a linen finish block light while maintaining a soft, lived-in look.</p>

<h2>Nightstand Essentials</h2>
<p>Keep your nightstand minimal: a small lamp with warm light, a book, a carafe of water, and perhaps a small plant. Avoid screens and chargers on the nightstand — they disrupt the restful atmosphere you've worked to create.</p>

<p><em>Discover our bedroom collection at CAFCO Home — every piece designed to help you sleep better and wake up refreshed.</em></p>
""",
        "featured_image_url": "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&h=800&fit=crop&q=80",
        "meta_title": "Design a Restful Bedroom Sanctuary | CAFCO Home",
        "meta_description": "Transform your bedroom into a sleep sanctuary. Expert advice on bed frames, layered bedding, colors, and lighting from CAFCO Home.",
        "status": "published",
        "is_featured": True,
        "days_ago": 12,
    },
    {
        "title": "Wood Types Explained: A Guide to Furniture Materials",
        "excerpt": "Oak, walnut, teak, or maple? Understanding wood types is essential to making smart furniture investments. We break down the characteristics, durability, and best uses for each.",
        "content": """
<h2>Why Wood Type Matters</h2>
<p>When you invest in solid wood furniture, you're not just buying a beautiful piece — you're choosing a material that will age, patina, and tell a story over decades. But not all woods are created equal. Understanding the characteristics of different species helps you make informed decisions that match your lifestyle and aesthetic preferences.</p>

<h2>Hardwoods vs. Softwoods</h2>
<p>The terms "hardwood" and "softwood" refer to the tree type, not necessarily the wood's actual hardness. Hardwoods come from deciduous trees (oak, walnut, maple), while softwoods come from conifers (pine, cedar). For furniture, hardwoods are generally preferred for their durability and resilience.</p>

<h2>Popular Furniture Woods</h2>

<h3>Oak</h3>
<p><strong>Character:</strong> Pronounced grain pattern, available in red and white varieties<br/>
<strong>Durability:</strong> Extremely hard and resistant to wear<br/>
<strong>Best for:</strong> Dining tables, bookcases, bed frames<br/>
<strong>Finish note:</strong> White oak takes stain beautifully; red oak has a pinkish undertone</p>

<h3>Walnut</h3>
<p><strong>Character:</strong> Rich, dark brown with occasional purple or grey streaks<br/>
<strong>Durability:</strong> Moderately hard with excellent strength-to-weight ratio<br/>
<strong>Best for:</strong> Statement pieces — dining tables, desks, headboards<br/>
<strong>Finish note:</strong> Best finished with natural oil to enhance its depth</p>

<h3>Teak</h3>
<p><strong>Character:</strong> Golden-brown tone with a slightly oily feel<br/>
<strong>Durability:</strong> Naturally weather-resistant, pest-resistant<br/>
<strong>Best for:</strong> Outdoor furniture, bathroom vanities, mid-century pieces<br/>
<strong>Finish note:</strong> Ages to a beautiful silver-grey if left unsealed</p>

<h3>Maple</h3>
<p><strong>Character:</strong> Light, creamy color with a subtle grain<br/>
<strong>Durability:</strong> One of the hardest domestic woods<br/>
<strong>Best for:</strong> Kitchen furniture, children's furniture, modern/Scandinavian pieces<br/>
<strong>Finish note:</strong> Takes light stains well but can blotch with darker stains</p>

<h3>Sheesham (Indian Rosewood)</h3>
<p><strong>Character:</strong> Deep reddish-brown with dramatic grain patterns<br/>
<strong>Durability:</strong> Very hard and naturally resistant to decay<br/>
<strong>Best for:</strong> Traditional and carved furniture, dining sets, TV units<br/>
<strong>Finish note:</strong> Polish brings out its natural luster beautifully</p>

<h2>Caring for Wood Furniture</h2>
<p>Regardless of wood type, follow these universal care tips:</p>
<ul>
<li>Dust regularly with a soft, dry cloth</li>
<li>Avoid direct sunlight exposure for prolonged periods</li>
<li>Use coasters and trivets to protect from heat and moisture</li>
<li>Re-oil or re-wax sealed pieces every 6–12 months</li>
<li>Address spills immediately — even on sealed wood</li>
</ul>

<p><em>At CAFCO Home, we source our wood from sustainable forests and craft each piece to last generations. Explore our solid wood collections today.</em></p>
""",
        "featured_image_url": "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1200&h=800&fit=crop&q=80",
        "meta_title": "Wood Types Guide for Furniture | CAFCO Home",
        "meta_description": "Learn about oak, walnut, teak, maple, and sheesham wood types. Understand durability, characteristics, and best uses for furniture shopping.",
        "status": "published",
        "is_featured": False,
        "days_ago": 18,
    },
    {
        "title": "Small Space Living: Furniture Ideas That Maximize Every Inch",
        "excerpt": "Living in a compact space doesn't mean sacrificing style. Discover clever furniture solutions, multifunctional pieces, and design tricks that make small rooms feel spacious and luxurious.",
        "content": """
<h2>Embrace the Compact Life</h2>
<p>Small spaces have a superpower that large rooms often lack: intimacy. A well-designed small room feels cozy, curated, and intentional. The secret isn't in making a small space look big — it's in making it work beautifully at the scale it is.</p>

<h2>Multifunctional Furniture is Your Best Friend</h2>
<p>Every piece in a small space should earn its keep. Look for furniture that pulls double (or triple) duty:</p>
<ul>
<li><strong>Ottoman with storage:</strong> Seating, footrest, and hidden storage in one</li>
<li><strong>Expandable dining table:</strong> Seats two daily, expands to six for dinner parties</li>
<li><strong>Sofa bed:</strong> Today's sleeper sofas bear no resemblance to the lumpy fold-outs of the past</li>
<li><strong>Nesting tables:</strong> Stack when not in use, spread out when guests arrive</li>
<li><strong>Wall-mounted desk:</strong> Folds flat against the wall when work is done</li>
</ul>

<h2>Visual Tricks That Create Space</h2>
<h3>Legs Over Skirts</h3>
<p>Choose furniture with visible legs — sofas, chairs, cabinets. When you can see the floor beneath furniture, rooms feel larger and airier.</p>

<h3>Mirrors and Glass</h3>
<p>A large mirror on the wall opposite a window doubles the natural light and visual depth. Glass-top coffee tables and acrylic chairs create function without visual weight.</p>

<h3>Vertical Storage</h3>
<p>Think upward. Tall, narrow bookshelves, wall-mounted shelving, and over-door organizers use space that would otherwise go to waste. Float your nightstands on the wall to free up floor space in the bedroom.</p>

<h2>Color Strategy</h2>
<p>Light walls and floors create a sense of openness, but don't be afraid of depth. A single accent wall in a rich, dark tone (deep navy, forest green) can actually make a room feel deeper. The key is keeping the overall palette cohesive — no more than three main colors.</p>

<h2>The Edit is Everything</h2>
<p>In a small space, every item you add is a choice to not add something else. Be ruthless in your editing. If a piece doesn't serve a function or bring you genuine joy, it doesn't belong. Quality over quantity is the mantra of beautiful small space living.</p>

<p><em>CAFCO Home offers a curated selection of space-smart furniture designed specifically for compact living. Browse our small space solutions online.</em></p>
""",
        "featured_image_url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=800&fit=crop&q=80",
        "meta_title": "Small Space Furniture Ideas & Tips | CAFCO Home",
        "meta_description": "Maximize your small space with clever furniture ideas. Multifunctional pieces, visual tricks, and expert design tips from CAFCO Home.",
        "status": "published",
        "is_featured": False,
        "days_ago": 25,
    },
    {
        "title": "The Rise of Japandi: Where Japanese Minimalism Meets Scandinavian Warmth",
        "excerpt": "Japandi is more than a trend — it's a timeless design philosophy. Explore how this fusion of Japanese wabi-sabi and Scandinavian hygge creates spaces of calm, beauty, and function.",
        "content": """
<h2>What is Japandi?</h2>
<p>Japandi is the aesthetic love child of two design philosophies that share more DNA than you'd expect. Japanese wabi-sabi — the acceptance of imperfection and transience — meets Scandinavian hygge — the pursuit of coziness and contentment. The result is a design style that is clean but warm, minimal but not cold, functional but deeply beautiful.</p>

<h2>Core Principles</h2>
<h3>1. Craftsmanship Over Mass Production</h3>
<p>Both Japanese and Scandinavian design traditions value the handmade, the considered, and the well-built. In a Japandi space, you'll find furniture that shows the maker's hand — visible joinery, turned wood, hand-glazed ceramics.</p>

<h3>2. Natural Materials</h3>
<p>Wood is the hero material — especially light-toned woods like ash and birch (Scandinavian) combined with darker tones like walnut and bamboo (Japanese). Other natural materials include linen, wool, rattan, stone, and clay.</p>

<h3>3. Muted Color Palette</h3>
<p>Think earth tones with occasional dark accents. Warm whites, soft taupes, sage greens, dusty blues, and charcoal. The palette draws from nature and creates a sense of calm that unifies the space.</p>

<h3>4. Purposeful Simplicity</h3>
<p>Every object in a Japandi room has a purpose — either functional or contemplative. There's no clutter, no decorating for decoration's sake. But unlike stark minimalism, Japandi spaces feel lived-in and welcoming.</p>

<h2>How to Create a Japandi Living Room</h2>
<ul>
<li><strong>Sofa:</strong> Low-profile with clean lines, upholstered in linen or bouclé</li>
<li><strong>Coffee table:</strong> Round, in solid wood with visible grain — no glass or chrome</li>
<li><strong>Lighting:</strong> Paper lantern-style pendants or sculptural wooden floor lamps</li>
<li><strong>Textiles:</strong> Layered rugs in jute and wool, linen throws, cotton cushions</li>
<li><strong>Decor:</strong> A single ikebana arrangement, a handmade ceramic bowl, a stack of books</li>
</ul>

<h2>Japandi Furniture Shopping Tips</h2>
<p>Look for pieces that feel timeless rather than trendy. Avoid anything overly ornate or heavily branded. The best Japandi furniture looks like it could exist in any era — it's designed to age gracefully and outlast passing trends.</p>

<p><em>CAFCO Home's Natural Living collection embodies the Japandi spirit. Discover pieces that bring serenity and warmth to your home.</em></p>
""",
        "featured_image_url": "https://images.unsplash.com/photo-1598928506311-c55ez637a267?w=1200&h=800&fit=crop&q=80",
        "meta_title": "Japandi Design Style Guide | CAFCO Home",
        "meta_description": "Discover the Japandi design trend — a fusion of Japanese minimalism and Scandinavian warmth. Tips, principles, and furniture ideas from CAFCO Home.",
        "status": "published",
        "is_featured": False,
        "days_ago": 30,
    },
]


class Command(BaseCommand):
    help = "Seed the database with sample blog posts for CAFCO Home"

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing blog posts before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            count = BlogPost.objects.count()
            BlogPost.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Deleted {count} existing blog posts."))

        # Get or create a staff author
        author = Staff.objects.filter(role='admin').first()
        if not author:
            author = Staff.objects.first()
        if not author:
            self.stdout.write(self.style.WARNING("No Staff users found. Creating a default admin author..."))
            author = Staff(
                username='admin',
                name='CAFCO Editorial',
                phone_number='0000000000',
                role='admin',
                is_staff=True,
                is_superuser=True,
            )
            author.set_password('admin123')
            author.save()
            self.stdout.write(self.style.SUCCESS(f"Created admin staff: {author.username}"))

        created_count = 0
        skipped_count = 0

        for post_data in BLOG_POSTS:
            days_ago = post_data.pop("days_ago")
            published_at = timezone.now() - timedelta(days=days_ago)

            # Check if post already exists by title
            if BlogPost.objects.filter(title=post_data["title"]).exists():
                self.stdout.write(self.style.WARNING(f"  SKIPPED (exists): {post_data['title']}"))
                skipped_count += 1
                continue

            blog_post = BlogPost(
                author=author,
                published_at=published_at,
                **post_data,
            )
            blog_post.save()
            created_count += 1
            self.stdout.write(self.style.SUCCESS(f"  CREATED: {blog_post.title} (slug: {blog_post.slug})"))

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(f"Done! Created {created_count} blog posts, skipped {skipped_count}."))
        self.stdout.write(f"Author: {author.name} ({author.username})")
