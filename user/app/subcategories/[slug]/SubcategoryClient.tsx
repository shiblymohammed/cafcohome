"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FilterBar } from "@/src/components/ui/FilterBar";
import { Pagination } from "@/src/components/ui/Pagination";
import {
  ProductCard,
  ProductCardImage,
  ProductCardImageContainer,
  ProductCardTitle,
  ProductCardDescription,
  ProductCardMeta,
  ProductCardRating,
  ProductCardWishlist,
  ProductCardBadgeGroup,
} from "@/src/components/ui/ProductCard";

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  featured_icon_url: string;
  category: number;
  category_name: string;
  category_slug?: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  product_count: number;
  created_at: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  colors: any[];
  materials: any[];
  price: number;
  mrp: number;
  average_rating?: number;
  review_count?: number;
  category: number;
  category_name: string;
  category_slug: string;
  subcategory: number;
  subcategory_name: string;
  subcategory_slug: string;
  brand: number | null;
  brand_name: string | null;
  brand_slug: string | null;
  images: Array<{
    url: string;
    alt?: string;
    order?: number;
  }>;
  variants?: Array<{
    images?: Array<{ url: string }>;
  }>;
  is_bestseller: boolean;
  is_hot_selling: boolean;
  is_in_stock: boolean;
  created_at: string;
}

interface SubcategoryClientProps {
  subcategory: Subcategory;
  products: Product[];
  allSubcategories: Subcategory[];
}

export default function SubcategoryClient({
  subcategory,
  products,
  allSubcategories,
}: SubcategoryClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filter states - initialized from URL parameters
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "featured");
  const [selectedColors, setSelectedColors] = useState<string[]>(
    searchParams.get("colors") ? searchParams.get("colors")!.split(",") : []
  );
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(
    searchParams.get("materials") ? searchParams.get("materials")!.split(",") : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get("brands") ? searchParams.get("brands")!.split(",") : []
  );
  const [currentPage, setCurrentPage] = useState(
    searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1
  );
  const productsPerPage = 12;

  // Sync state back to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (sortBy !== 'featured') params.set('sort', sortBy);
    else params.delete('sort');
    
    if (selectedColors.length > 0) params.set('colors', selectedColors.join(','));
    else params.delete('colors');
    
    if (selectedMaterials.length > 0) params.set('materials', selectedMaterials.join(','));
    else params.delete('materials');
    
    if (selectedBrands.length > 0) params.set('brands', selectedBrands.join(','));
    else params.delete('brands');
    
    if (currentPage > 1) params.set('page', currentPage.toString());
    else params.delete('page');

    const newUrl = `${pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [sortBy, selectedColors, selectedMaterials, selectedBrands, currentPage, pathname, router]);

  // Extract unique colors, materials, and brands
  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach(p => p.colors?.forEach(c => {
      const colorVal = typeof c === "string" ? c : (c as any).name;
      if (colorVal) colors.add(colorVal);
    }));
    return Array.from(colors);
  }, [products]);

  const availableMaterials = useMemo(() => {
    const materials = new Set<string>();
    products.forEach(p => p.materials?.forEach(m => {
      const materialVal = typeof m === "string" ? m : (m as any).name;
      if (materialVal) materials.add(materialVal);
    }));
    return Array.from(materials);
  }, [products]);

  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach(p => {
      if (p.brand_name) brands.add(p.brand_name);
    });
    return Array.from(brands);
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter(p =>
        p.colors?.some(c => {
          const colorVal = typeof c === "string" ? c : (c as any).name;
          return selectedColors.includes(colorVal);
        })
      );
    }

    // Material filter
    if (selectedMaterials.length > 0) {
      filtered = filtered.filter(p =>
        p.materials?.some(m => {
          const materialVal = typeof m === "string" ? m : (m as any).name;
          return selectedMaterials.includes(materialVal);
        })
      );
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => 
        p.brand_name && selectedBrands.includes(p.brand_name)
      );
    }

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "best-selling":
        filtered = filtered.filter(p => p.is_hot_selling).concat(filtered.filter(p => !p.is_hot_selling));
        break;
      default:
        // Featured - keep original order
        break;
    }

    return filtered;
  }, [products, sortBy, selectedColors, selectedMaterials, selectedBrands]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 500, behavior: "smooth" });
  };

  const handleClearFilters = () => {
    setSortBy("featured");
    setSelectedColors([]);
    setSelectedMaterials([]);
    setSelectedBrands([]);
    setCurrentPage(1);
  };

  return (
    <main className="pt-20 bg-creme min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        {subcategory.image_url ? (
          <Image
            src={subcategory.image_url}
            alt={subcategory.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-ivory flex items-center justify-center">
            <div className="w-24 h-24 text-alpha/10">
              <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="12" y="12" width="40" height="40" rx="2" />
              </svg>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-alpha/80 via-alpha/40 to-alpha/20" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-[1440px] mx-auto px-4 pb-10 md:pb-14 w-full">
            <nav className="flex items-center gap-2 text-xs text-creme/70 mb-3">
              <Link href="/" className="hover:text-creme transition-colors">Home</Link>
              <span>/</span>
              <Link href="/categories" className="hover:text-creme transition-colors">Categories</Link>
              <span>/</span>
              <Link href={`/categories/${subcategory.category_slug}`} className="hover:text-creme transition-colors">{subcategory.category_name}</Link>
              <span>/</span>
              <span className="text-creme">{subcategory.name}</span>
            </nav>
            <span className="text-xs font-primary uppercase tracking-[0.2em] text-creme/70 mb-1 block">
              {subcategory.category_name}
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-secondary text-creme leading-[0.95] tracking-tight mb-3">
              {subcategory.name}
            </h1>
            <p className="text-sm text-creme/80 font-primary max-w-lg leading-relaxed">
              {subcategory.description}
            </p>
          </div>
        </div>
      </section>

      {/* Subcategory Story */}
      <section className="py-10 md:py-14 border-b border-alpha/10">
        <div className="max-w-[1440px] mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs font-primary uppercase tracking-[0.2em] text-alpha/60 mb-2">
              The Subcategory
            </p>
            <p className="text-base md:text-lg text-alpha/80 font-primary leading-relaxed">
              Discover our carefully selected {subcategory.name.toLowerCase()} that combine form and function. 
              Each piece is chosen to bring character and comfort to your space.
            </p>
          </div>
        </div>
      </section>

      {/* Results Count */}
      <section className="py-5 md:py-6 border-b border-alpha/10">
        <div className="max-w-[1440px] mx-auto px-4">
          <p className="text-sm text-alpha/60 font-primary">
            <span className="text-alpha font-medium">{filteredProducts.length}</span> products in this subcategory
          </p>
        </div>
      </section>

      {/* Products Layout container */}
      <section className="py-6 md:py-10">
        <div className="max-w-[1440px] mx-auto px-2 md:px-4 lg:px-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            
            {/* Desktop Sidebar Filter (Hidden on mobile) */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-40">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-secondary text-2xl text-alpha">Filters</h3>
                  {(selectedColors.length > 0 || selectedMaterials.length > 0 || selectedBrands.length > 0) && (
                    <button onClick={handleClearFilters} className="text-xs font-primary uppercase tracking-widest text-tango hover:underline">
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-8">
                  {/* Sort Desktop */}
                  <div className="mb-6">
                    <h4 className="text-xs uppercase tracking-widest text-alpha/60 mb-3 font-primary border-b border-alpha/10 pb-2">Sort By</h4>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-transparent border border-alpha/20 py-2 px-3 text-sm font-primary focus:outline-none focus:border-alpha"
                    >
                      <option value="featured">Featured</option>
                      <option value="newest">Newest</option>
                      <option value="best-selling">Best Selling</option>
                    </select>
                  </div>

                  {/* Brands */}
                  {availableBrands.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-xs uppercase tracking-widest text-alpha/60 mb-3 font-primary border-b border-alpha/10 pb-2">Brand</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {availableBrands.map(brand => (
                          <div key={brand} className="flex items-center gap-2">
                            <input type="checkbox" id={`brand-${brand}`} checked={selectedBrands.includes(brand)} onChange={() => {
                              setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
                            }} className="w-4 h-4 text-alpha focus:ring-alpha border-alpha/30 rounded-sm" />
                            <label htmlFor={`brand-${brand}`} className="text-sm font-primary text-alpha/80 cursor-pointer flex-1 truncate">{brand}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Colors */}
                  {availableColors.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-xs uppercase tracking-widest text-alpha/60 mb-3 font-primary border-b border-alpha/10 pb-2">Colors</h4>
                      <div className="flex flex-wrap gap-2">
                        {availableColors.map(color => (
                          <button
                            key={color}
                            onClick={() => setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color])}
                            className={`px-3 py-1.5 text-xs font-primary border transition-colors ${selectedColors.includes(color) ? "bg-alpha text-creme border-alpha" : "bg-transparent text-alpha/70 border-alpha/20 hover:border-alpha"}`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Materials */}
                  {availableMaterials.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-xs uppercase tracking-widest text-alpha/60 mb-3 font-primary border-b border-alpha/10 pb-2">Materials</h4>
                      <div className="flex flex-wrap gap-2">
                        {availableMaterials.map(m => (
                          <button
                            key={m}
                            onClick={() => setSelectedMaterials(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])}
                            className={`px-3 py-1.5 text-xs font-primary border transition-colors ${selectedMaterials.includes(m) ? "bg-alpha text-creme border-alpha" : "bg-transparent text-alpha/70 border-alpha/20 hover:border-alpha"}`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* Main Products Container */}
            <div className="flex-1">
              {paginatedProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[3px] md:gap-1 lg:gap-1">
                    {paginatedProducts.map((product) => (
                      <ProductItem key={product.id} product={product} />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="mt-10 md:mt-14">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-14">
                  <div className="w-16 h-16 mx-auto mb-4 text-alpha/20">
                    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="12" y="12" width="40" height="40" rx="2" />
                      <path d="M32 24v16M24 32h16" />
                    </svg>
                  </div>
                  <p className="text-alpha/60 font-primary mb-4">
                    {selectedColors.length > 0 || selectedMaterials.length > 0 || selectedBrands.length > 0
                      ? "No products match your filters."
                      : "No products available in this subcategory yet."}
                  </p>
                  {(selectedColors.length > 0 || selectedMaterials.length > 0 || selectedBrands.length > 0) && (
                    <button
                      onClick={handleClearFilters}
                      className="text-xs uppercase tracking-widest font-primary border-b border-alpha pb-1 hover:text-tango hover:border-tango transition-colors"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Subcategories */}
      {allSubcategories.length > 1 && (
        <section className="py-10 md:py-14 bg-ivory border-t border-alpha/10">
          <div className="max-w-[1440px] mx-auto px-4">
            <div className="text-center mb-8 md:mb-10">
              <p className="text-xs font-primary uppercase tracking-[0.2em] text-alpha/60 mb-1.5">
                Explore More
              </p>
              <h2 className="text-2xl md:text-3xl font-secondary text-alpha font-medium tracking-tight">
                Other Subcategories
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {allSubcategories
                .filter(s => s.slug !== subcategory.slug && s.is_active)
                .slice(0, 4)
                .map(s => (
                  <Link
                    key={s.id}
                    href={`/subcategories/${s.slug}`}
                    className="group relative aspect-[4/3] overflow-hidden"
                  >
                    {s.image_url ? (
                      <Image
                        src={s.image_url}
                        alt={s.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-ivory flex items-center justify-center">
                        <div className="w-12 h-12 text-alpha/20">
                          <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="12" y="12" width="40" height="40" rx="2" />
                          </svg>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-alpha/70 via-alpha/20 to-transparent" />
                    <div className="absolute inset-0 flex items-end p-4 md:p-5">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-creme/70 mb-1">{s.category_name}</p>
                        <h3 className="text-lg md:text-xl font-secondary text-creme group-hover:text-creme/90 transition-colors">
                          {s.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Filter Bar */}
      <FilterBar
        colors={availableColors}
        materials={availableMaterials}
        brands={availableBrands}
        onSortChange={setSortBy}
        onColorChange={setSelectedColors}
        onMaterialChange={setSelectedMaterials}
        onBrandChange={setSelectedBrands}
        onClearFilters={handleClearFilters}
      />
    </main>
  );
}

import { ProductCardPrice } from "@/src/components/ui/ProductCard";

function ProductItem({ product }: { product: Product }) {
  // Get image from product images (from default variant) or use placeholder
  const mainImage = product.images && product.images.length > 0
    ? product.images[0].url 
    : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=800&fit=crop';

  const applicableOffers = (product as any).applicable_offers || [];
  const bestOffer = applicableOffers.length > 0 ? applicableOffers[0] : null;
  const hasOffer = !!bestOffer;

  const badges = [
    ...(bestOffer ? [{ label: `${bestOffer.discount_percentage}% OFF`, variant: "sale" as const }] : []),
    ...(product.is_bestseller ? [{ label: "Bestseller", variant: "gold" as const }] : []),
    ...(product.is_hot_selling ? [{ label: "Hot", variant: "sale" as const }] : []),
    ...(!product.is_in_stock ? [{ label: "Out of Stock", variant: "limited" as const }] : []),
  ];

  return (
    <ProductCard href={`/product/${product.slug}`} hasOffer={hasOffer}>
      <ProductCardImageContainer>
        {badges.length > 0 && <ProductCardBadgeGroup badges={badges} />}
        <ProductCardImage src={mainImage} alt={product.name} />
        <ProductCardWishlist product={product} />
      </ProductCardImageContainer>
      <div className="flex flex-col items-start px-1.5 md:px-2 py-2 md:py-3">
        <ProductCardTitle>{product.name}</ProductCardTitle>
        <ProductCardDescription>{product.description}</ProductCardDescription>
        <ProductCardMeta collection={product.brand_name || product.category_name} category={product.subcategory_name} />
        <ProductCardRating rating={product.average_rating || 0} reviewCount={product.review_count || 0} />
        
        <ProductCardPrice 
          price={product.price || (product as any).selling_price} 
          mrp={product.mrp} 
          hasOffer={hasOffer} 
          offerPercentage={bestOffer?.discount_percentage} 
        />
        
        <div className="flex items-center justify-between w-full mt-2">
          <div className="flex items-center gap-2">
            {!product.is_in_stock && (
              <span className="text-xs text-red-600 font-primary">Out of Stock</span>
            )}
          </div>
        </div>
      </div>
    </ProductCard>
  );
}
