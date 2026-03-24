"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FilterBar } from "@/src/components/ui/FilterBar";
import { Pagination } from "@/src/components/ui/Pagination";
import { Package } from "lucide-react";
import {
  ProductCard,
  ProductCardImage,
  ProductCardImageContainer,
  ProductCardTitle,
  ProductCardDescription,
  ProductCardMeta,
  ProductCardBadgeGroup,
  ProductCardWishlist,
  ProductCardColorSwatches,
} from "@/src/components/ui/ProductCard";

interface OfferClientProps {
  offer: any;
  products: any[];
}

export default function OfferClient({ offer, products }: OfferClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filter states - initialized from URL
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

  // Sync state to URL without reloading
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
  }, [sortBy, selectedColors, selectedMaterials, selectedBrands, currentPage, pathname, router, searchParams]);

  // Extract unique colors, materials, and brands
  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach(p => p.colors?.forEach((c: any) => {
      const colorVal = typeof c === "string" ? c : c.name;
      if (colorVal) colors.add(colorVal);
    }));
    return Array.from(colors);
  }, [products]);

  const availableMaterials = useMemo(() => {
    const materials = new Set<string>();
    products.forEach(p => p.materials?.forEach((m: any) => {
      const materialVal = typeof m === "string" ? m : m.name;
      if (materialVal) materials.add(materialVal);
    }));
    return Array.from(materials);
  }, [products]);

  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach(p => {
      if (p.brand_name || p.brand?.name) brands.add(p.brand_name || p.brand.name);
    });
    return Array.from(brands);
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter(p =>
        p.colors?.some((c: any) => {
          const colorVal = typeof c === "string" ? c : c.name;
          return selectedColors.includes(colorVal);
        })
      );
    }

    // Material filter
    if (selectedMaterials.length > 0) {
      filtered = filtered.filter(p =>
        p.materials?.some((m: any) => {
          const materialVal = typeof m === "string" ? m : m.name;
          return selectedMaterials.includes(materialVal);
        })
      );
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => {
        const pBrand = p.brand_name || p.brand?.name;
        return pBrand && selectedBrands.includes(pBrand);
      });
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

  if (products.length === 0) {
    return (
      <div className="text-center py-32 bg-white max-w-3xl mx-auto border border-alpha/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-alpha/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 flex flex-col items-center p-8">
           <Package className="w-16 h-16 text-alpha/20 mb-6" />
           <h3 className="text-2xl font-secondary text-alpha mb-3">
              Selection Updating
           </h3>
           <p className="text-alpha/50 text-sm max-w-sm mb-8 leading-relaxed">
              We are currently organizing the eligible products for this offer.
           </p>
           <Link
              href="/products"
              className="inline-flex items-center gap-3 px-8 py-3 bg-alpha text-creme text-xs uppercase tracking-widest hover:bg-tango transition-colors"
           >
              Browse Full Collection
           </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        
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
              <div className="mb-6 flex items-center justify-between lg:hidden border-b border-alpha/10 pb-4">
                <p className="text-sm text-alpha/70 font-primary">
                  <span className="text-alpha font-medium">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'piece' : 'pieces'}
                </p>
                {(selectedColors.length > 0 || selectedMaterials.length > 0 || selectedBrands.length > 0) && (
                  <button onClick={handleClearFilters} className="text-xs uppercase tracking-wider font-primary text-alpha/60 hover:text-alpha transition-colors">
                    Clear Filters
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[3px] md:gap-1 lg:gap-1">
                {paginatedProducts.map((product) => (
                   <ProductCard key={product.id} href={`/product/${product.slug || product.id}`}>
                      <ProductCardImageContainer>
                         <ProductCardBadgeGroup badges={[{ label: `${offer.discount_percentage}% OFF Offer`, variant: "sale" }]} />
                         <ProductCardImage 
                            src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1550226891-ef816aed4a98?q=80&w=1200&auto=format&fit=crop"} 
                            alt={product.name} 
                         />
                      </ProductCardImageContainer>
                      <div className="flex flex-col items-start px-1.5 md:px-2 py-2 md:py-3 w-full">
                         <ProductCardTitle>{product.name}</ProductCardTitle>
                         <ProductCardDescription>{product.description}</ProductCardDescription>
                         {product.category && (
                            <ProductCardMeta collection={product.category.name} category="Eligible" />
                         )}
                         <div className="flex items-center justify-between w-full mt-2">
                            <div className="flex flex-col items-start gap-1">
                               <ProductCardColorSwatches colors={product.colors} />
                               <span className="text-[7px] md:text-[10px] font-primary uppercase tracking-widest text-tango pt-0.5 md:pt-1 border-t border-alpha/10">
                                  Quote upon checkout
                               </span>
                            </div>
                            <ProductCardWishlist product={product} />
                         </div>
                      </div>
                   </ProductCard>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-12 md:mt-16">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-alpha/5 rounded-2xl w-full">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-alpha/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-alpha/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-secondary text-alpha mb-2">No products found</h3>
              <p className="text-alpha/60 font-primary mb-6">No products match your filters.</p>
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-alpha text-creme text-xs uppercase tracking-wider font-medium hover:bg-alpha/90 transition-all rounded-lg"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar specifically for Mobile */}
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
    </>
  );
}
