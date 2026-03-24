// Shared categories data used across the site
export interface Category {
  id: number;
  name: string;
  caption: string;
  description: string;
  image: string;
  itemCount: number;
  featured?: boolean;
}

export const categories: Category[] = [
  {
    id: 1,
    name: "Sofas",
    caption: "Sofas, armchairs & more",
    description: "Discover our curated selection of sofas and seating. From minimalist designs to statement pieces, find the perfect centerpiece for your living space.",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
    itemCount: 48,
    featured: true,
  },
  {
    id: 2,
    name: "Tables",
    caption: "Dining & side tables",
    description: "Elegant tables crafted for gathering and conversation. Our collection spans dining tables, console tables, and accent pieces for every room.",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&h=400&fit=crop",
    itemCount: 36,
  },
  {
    id: 3,
    name: "Coffee Tables",
    caption: "Center pieces",
    description: "The heart of your living room. Browse our selection of coffee tables that balance form and function with exceptional craftsmanship.",
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&h=400&fit=crop",
    itemCount: 28,
  },
  {
    id: 4,
    name: "Chairs",
    caption: "Seating solutions",
    description: "From dining chairs to accent seating, our chair collection offers comfort and style for every space and occasion.",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&h=400&fit=crop",
    itemCount: 52,
  },
  {
    id: 5,
    name: "Storage",
    caption: "Organize beautifully",
    description: "Thoughtfully designed storage solutions that keep your space organized while adding visual interest. Cabinets, shelving, and more.",
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&h=600&fit=crop",
    itemCount: 31,
  },
  {
    id: 6,
    name: "Rugs",
    caption: "Floor coverings",
    description: "Handcrafted rugs that anchor your space with texture and warmth. Natural fibers and artisanal techniques define our collection.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&h=400&fit=crop",
    itemCount: 24,
  },
  {
    id: 7,
    name: "Lamps",
    caption: "Illuminate your space",
    description: "Lighting that transforms atmosphere. From sculptural floor lamps to elegant table lights, illuminate your home with intention.",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=400&fit=crop",
    itemCount: 38,
  },
  {
    id: 8,
    name: "Beds",
    caption: "Rest & rejuvenate",
    description: "Luxurious beds designed for the ultimate in comfort and style. Create your personal sanctuary with our bedroom collection.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop",
    itemCount: 22,
  },
  {
    id: 9,
    name: "Outdoor",
    caption: "Al fresco living",
    description: "Extend your living space outdoors with furniture built to withstand the elements while maintaining exceptional design standards.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
    itemCount: 29,
  },
  {
    id: 10,
    name: "Decor",
    caption: "Finishing touches",
    description: "Curated accessories and decorative objects that complete your space. Vases, sculptures, and artisanal pieces for the discerning eye.",
    image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&h=400&fit=crop",
    itemCount: 64,
  },
];
