"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import { ApiClient } from "@/src/lib/api/client";
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
  ProductCardPrice,
} from "@/src/components/ui/ProductCard";
import { Pagination } from "@/src/components/ui/Pagination";

interface Category {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
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
  images: Array<{ url: string; alt?: string }>;
  is_bestseller: boolean;
  is_hot_selling: boolean;
  is_in_stock: boolean;
  created_at: string;
}

interface Props {
  initialParams: Record<string, string>;
  categories: Category[];
  brands: Brand[];
}

const PRODUCTS_PER_PAGE = 24;

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "bestseller", label: "Best Sellers" },
  { value: "hot", label: "Hot Selling" },
];

export default function ProductsClient({ initialParams, categories, brands }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filter state — initialised from URL
  const [query, setQuery] = useState(initialParams.q || "");
  const [inputValue, setInputValue] = useState(initialParams.q || "");
  const [selectedCategory, setSelectedCategory] = useState(initialParams.category || "");
  const [selectedBrand, setSelectedBrand] = useState(initialParams.brand || "");
  const [selectedSort, setSelectedSort] = useState(initialParams.sort || "featured");
  const [currentPage, setCurrentPage] = useState(
    initialParams.page ? parseInt(initialParams.page) : 1
  );

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [catExpanded, setCatExpanded] = useState(true);
  const [brandExpanded, setBrandExpanded] = useState(true);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSearch = !!query;
  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

  // Sync URL whenever filters change
  const syncUrl = useCallback(
    (overrides: Record<string, string> = {}) => {
      const p = new URLSearchParams();
      const q = overrides.q !== undefined ? overrides.q : query;
      const cat = overrides.category !== undefined ? overrides.category : selectedCategory;
      const brand = overrides.brand !== undefined ? overrides.brand : selectedBrand;
      const sort = overrides.sort !== undefined ? overrides.sort : selectedSort;
      const page = overrides.page !== undefined ? overrides.page : String(currentPage);

      if (q) p.set("q", q);
      if (cat) p.set("category", cat);
      if (brand) p.set("brand", brand);
      if (sort && sort !== "featured") p.set("sort", sort);
      if (page && page !== "1") p.set("page", page);

      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    },
    [query, selectedCategory, selectedBrand, selectedSort, currentPage, pathname, router]
  );

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const filters: Record<string, string> = {
        page_size: String(PRODUCTS_PER_PAGE),
        page: String(currentPage),
      };
      if (query) filters.search = query;
      if (selectedCategory) filters.category = selectedCategory;
      if (selectedBrand) filters.brand = selectedBrand;
      if (selectedSort === "bestseller") filters.is_bestseller = "true";
      if (selectedSort === "hot") filters.is_hot_selling = "true";

      const res = await ApiClient.getProducts(filters);
      const items = res.results || res;
      const count = res.count ?? (Array.isArray(items) ? items.length : 0);

      let sorted = Array.isArray(items) ? [...items] : [];
      if (selectedSort === "newest") {
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      setProducts(sorted);
      setTotalCount(count);
    } catch {
      setError(true);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query, selectedCategory, selectedBrand, selectedSort, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounced search input
  const handleSearchInput = (val: string) => {
    setInputValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(val);
      setCurrentPage(1);
      syncUrl({ q: val, page: "1" });
    }, 400);
  };

  const handleClearSearch = () => {
    setInputValue("");
    setQuery("");
    setCurrentPage(1);
    syncUrl({ q: "", page: "1" });
    searchInputRef.current?.focus();
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setCurrentPage(1);
    syncUrl({ category: val, page: "1" });
    setSidebarOpen(false);
  };

  const handleBrandChange = (val: string) => {
    setSelectedBrand(val);
    setCurrentPage(1);
    syncUrl({ brand: val, page: "1" });
    setSidebarOpen(false);
  };

  const handleSortChange = (val: string) => {
    setSelectedSort(val);
    setCurrentPage(1);
    syncUrl({ sort: val, page: "1" });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    syncUrl({ page: String(page) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearAll = () => {
    setQuery("");
    setInputValue("");
    setSelectedCategory("");
    setSelectedBrand("");
    setSelectedSort("featured");
    setCurrentPage(1);
    router.replace(pathname, { scroll: false });
  };

  const activeFilterCount = [query, selectedCategory, selectedBrand].filter(Boolean).length;

  const pageTitle = isSearch
    ? `Results for "${query}"`
    : selectedCategory
    ? categories.find((c) => String(c.id) === selectedCategory)?.name || "Products"
    : "All Products";

  return (
    <main className="bg-creme min-h-screen pt-20 md:pt-24 pb-20">
      {/* ── Top Bar ── */}
      <div className="border-b border-alpha/10 bg-creme/95 backdrop-blur-sm sticky top-16 md:top-20 z-40">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 flex items-center gap-4">
          {/* Search input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-alpha/40 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={inputValue}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Search furniture, materials, styles…"
              className="w-full pl-11 pr-10 py-3 bg-white border border-alpha/15 text-sm font-primary text-alpha placeholder:text-alpha/40 focus:outline-none focus:border-alpha transition-colors"
            />
            {inputValue && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-alpha/40 hover:text-alpha transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-alpha/50 font-primary uppercase tracking-widest whitespace-nowrap">Sort:</span>
            <select
              value={selectedSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-white border border-alpha/15 text-sm font-primary text-alpha py-3 px-3 focus:outline-none focus:border-alpha transition-colors"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 px-4 py-3 border border-alpha/15 bg-white text-sm font-primary text-alpha hover:border-alpha transition-colors relative"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-alpha text-creme text-[10px] rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Result count */}
          <span className="hidden lg:block text-xs text-alpha/50 font-primary whitespace-nowrap">
            {loading ? "…" : `${totalCount} item${totalCount !== 1 ? "s" : ""}`}
          </span>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 pb-3 flex items-center gap-2 flex-wrap">
            {query && (
              <Chip label={`"${query}"`} onRemove={handleClearSearch} />
            )}
            {selectedCategory && (
              <Chip
                label={categories.find((c) => String(c.id) === selectedCategory)?.name || selectedCategory}
                onRemove={() => handleCategoryChange("")}
              />
            )}
            {selectedBrand && (
              <Chip
                label={brands.find((b) => String(b.id) === selectedBrand)?.name || selectedBrand}
                onRemove={() => handleBrandChange("")}
              />
            )}
            <button
              onClick={handleClearAll}
              className="text-[10px] uppercase tracking-widest text-alpha/50 hover:text-alpha transition-colors font-primary ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 pt-8">
        <div className="flex gap-8">
          {/* ── Sidebar ── */}
          <aside
            className={`
              fixed inset-y-0 left-0 z-50 w-72 bg-creme border-r border-alpha/10 overflow-y-auto
              transform transition-transform duration-300 ease-in-out
              lg:static lg:transform-none lg:w-56 lg:shrink-0 lg:block lg:z-auto lg:border-0 lg:bg-transparent lg:overflow-visible
              ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
            `}
          >
            {/* Mobile sidebar header */}
            <div className="flex items-center justify-between p-5 border-b border-alpha/10 lg:hidden">
              <h3 className="font-secondary text-xl text-alpha">Filters</h3>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-alpha/60" />
              </button>
            </div>

            <div className="p-5 lg:p-0 space-y-6">
              {/* Sort (mobile only) */}
              <div className="lg:hidden">
                <h4 className="text-[10px] uppercase tracking-widest text-alpha/50 font-primary mb-3">Sort By</h4>
                <div className="space-y-1">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => { handleSortChange(o.value); setSidebarOpen(false); }}
                      className={`w-full text-left px-3 py-2.5 text-sm font-primary transition-colors ${
                        selectedSort === o.value
                          ? "text-alpha font-semibold bg-alpha/5"
                          : "text-alpha/60 hover:text-alpha"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <button
                    onClick={() => setCatExpanded(!catExpanded)}
                    className="flex items-center justify-between w-full text-[10px] uppercase tracking-widest text-alpha/50 font-primary mb-3 hover:text-alpha transition-colors"
                  >
                    Category
                    {catExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  {catExpanded && (
                    <div className="space-y-1">
                      <button
                        onClick={() => handleCategoryChange("")}
                        className={`w-full text-left px-3 py-2 text-sm font-primary transition-colors ${
                          !selectedCategory ? "text-alpha font-semibold" : "text-alpha/60 hover:text-alpha"
                        }`}
                      >
                        All Categories
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryChange(String(cat.id))}
                          className={`w-full text-left px-3 py-2 text-sm font-primary transition-colors ${
                            selectedCategory === String(cat.id)
                              ? "text-alpha font-semibold bg-alpha/5"
                              : "text-alpha/60 hover:text-alpha"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Brands */}
              {brands.length > 0 && (
                <div>
                  <button
                    onClick={() => setBrandExpanded(!brandExpanded)}
                    className="flex items-center justify-between w-full text-[10px] uppercase tracking-widest text-alpha/50 font-primary mb-3 hover:text-alpha transition-colors"
                  >
                    Brand
                    {brandExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  {brandExpanded && (
                    <div className="space-y-1">
                      <button
                        onClick={() => handleBrandChange("")}
                        className={`w-full text-left px-3 py-2 text-sm font-primary transition-colors ${
                          !selectedBrand ? "text-alpha font-semibold" : "text-alpha/60 hover:text-alpha"
                        }`}
                      >
                        All Brands
                      </button>
                      {brands.map((brand) => (
                        <button
                          key={brand.id}
                          onClick={() => handleBrandChange(String(brand.id))}
                          className={`w-full text-left px-3 py-2 text-sm font-primary transition-colors ${
                            selectedBrand === String(brand.id)
                              ? "text-alpha font-semibold bg-alpha/5"
                              : "text-alpha/60 hover:text-alpha"
                          }`}
                        >
                          {brand.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* Sidebar backdrop (mobile) */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-alpha/30 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            {/* Page heading */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-secondary text-alpha tracking-tight">
                {pageTitle}
              </h1>
              {isSearch && !loading && (
                <p className="text-sm text-alpha/60 font-primary mt-2">
                  {totalCount === 0
                    ? "No results found"
                    : `${totalCount} result${totalCount !== 1 ? "s" : ""}`}
                </p>
              )}
            </div>

            {/* Products grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-[3px] md:gap-1">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-alpha/5 animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-alpha/60 font-primary mb-4">Failed to load products.</p>
                <button
                  onClick={fetchProducts}
                  className="text-xs uppercase tracking-widest font-primary border-b border-alpha pb-1 hover:text-tango hover:border-tango transition-colors"
                >
                  Try again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-alpha/5 flex items-center justify-center">
                  <Search className="w-8 h-8 text-alpha/20" />
                </div>
                <h2 className="text-xl font-secondary text-alpha mb-2">
                  {isSearch ? `No results for "${query}"` : "No products found"}
                </h2>
                <p className="text-sm text-alpha/60 font-primary mb-6">
                  {isSearch
                    ? "Try different keywords or browse by category."
                    : "Try adjusting your filters."}
                </p>
                <button
                  onClick={handleClearAll}
                  className="text-xs uppercase tracking-widest font-primary border-b border-alpha pb-1 hover:text-tango hover:border-tango transition-colors"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-[3px] md:gap-1">
                  {products.map((product) => {
                    const mainImage =
                      product.images?.[0]?.url || "/placeholder-product.svg";
                    const badges = [
                      ...(product.is_bestseller
                        ? [{ label: "Bestseller", variant: "gold" as const }]
                        : []),
                      ...(product.is_hot_selling
                        ? [{ label: "Hot", variant: "sale" as const }]
                        : []),
                      ...(!product.is_in_stock
                        ? [{ label: "Out of Stock", variant: "limited" as const }]
                        : []),
                    ];
                    return (
                      <ProductCard key={product.id} href={`/product/${product.slug}`}>
                        <ProductCardImageContainer>
                          {badges.length > 0 && <ProductCardBadgeGroup badges={badges} />}
                          <ProductCardImage src={mainImage} alt={product.name} />
                          <ProductCardWishlist product={product} />
                        </ProductCardImageContainer>
                        <div className="flex flex-col items-start px-1.5 md:px-2 py-2 md:py-3">
                          <ProductCardTitle>{product.name}</ProductCardTitle>
                          <ProductCardDescription>{product.description}</ProductCardDescription>
                          <ProductCardMeta
                            collection={product.brand_name || product.category_name}
                            category={product.subcategory_name}
                          />
                          <ProductCardRating
                            rating={product.average_rating || 0}
                            reviewCount={product.review_count || 0}
                          />
                          <ProductCardPrice
                            price={product.price}
                            mrp={product.mrp}
                          />
                        </div>
                      </ProductCard>
                    );
                  })}
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
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// ── Filter chip ──────────────────────────────────────────────────
function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-alpha text-creme text-xs font-primary">
      {label}
      <button onClick={onRemove} className="hover:opacity-70 transition-opacity">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
