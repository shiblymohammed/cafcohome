"use client";

import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import { ApiClient, ApiClientError } from "@/src/lib/api/client";
import type { Product } from "@/src/contexts/CartContext";
import {
  ProductCard,
  ProductCardImageContainer,
  ProductCardImage,
  ProductCardTitle,
  ProductCardDescription,
  ProductCardMeta,
  ProductCardRating,
  ProductCardBadgeGroup,
  ProductCardWishlist,
  ProductCardQuickAdd,
  ProductCardInfo,
} from "@/src/components/ui/ProductCard";

function ProductCardItem({ product }: { product: Product }) {
  // Get image from product images (from default variant) or use placeholder
  const mainImage = product.images && product.images.length > 0
    ? product.images[0].url 
    : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=800&auto=format&fit=crop';

  const badges = [
    ...(product.is_bestseller ? [{ label: "Bestseller", variant: "bestseller" as const }] : []),
    ...(product.is_hot_selling ? [{ label: "Hot", variant: "sale" as const }] : []),
    ...(!product.is_in_stock ? [{ label: "Out of Stock", variant: "limited" as const }] : []),
  ];

  return (
    <ProductCard href={`/product/${product.slug}`}>
      <ProductCardImageContainer>
        <ProductCardImage src={mainImage} alt={product.name} />
        {badges.length > 0 && <ProductCardBadgeGroup badges={badges} />}
        <ProductCardWishlist product={product} />
      </ProductCardImageContainer>
      
      <ProductCardInfo>
        <ProductCardTitle>{product.name}</ProductCardTitle>
        <ProductCardDescription className="opacity-70">
          {product.description}
        </ProductCardDescription>
        <ProductCardMeta
          collection={product.category_name}
          category={product.subcategory_name}
        />
        <ProductCardRating rating={product.average_rating || 0} reviewCount={product.review_count || 0} />
        <div className="flex items-center justify-between gap-2 mt-3 text-xs">
          {product.is_in_stock ? (
            <span className="text-green-600 font-primary">In Stock</span>
          ) : (
            <span className="text-red-600 font-primary">Out of Stock</span>
          )}
        </div>
      </ProductCardInfo>
    </ProductCard>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 group animate-pulse h-full">
      <div className="relative aspect-[4/5] w-full bg-alpha/5 overflow-hidden"></div>
      <div className="space-y-2 mt-2">
        <div className="h-4 bg-alpha/10 w-3/4"></div>
        <div className="h-3 bg-alpha/10 w-1/2"></div>
        <div className="h-3 bg-alpha/10 w-1/4 mt-3"></div>
      </div>
    </div>
  );
}

export default function HotSelling() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const [leftStyle, setLeftStyle] = useState<React.CSSProperties>({});
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch hot selling products
  useEffect(() => {
    async function loadHotSellingProducts() {
      try {
        const response = await ApiClient.getProducts({ is_hot_selling: "true", page_size: "12" });
        const data = response.results || response;
        setHotProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load hot selling products:', error);
        if (error instanceof ApiClientError) {
          console.error('API Error:', error.error.message);
        }
      } finally {
        setLoading(false);
      }
    }
    loadHotSellingProducts();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const leftPanel = leftPanelRef.current;
    if (!section || !leftPanel) return;

    const handleScroll = () => {
      const sectionRect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const leftPanelWidth = leftPanel.offsetWidth;

      // Section hasn't reached viewport top yet - left panel flows normally
      if (sectionRect.top >= 0) {
        setLeftStyle({
          position: "absolute",
          top: 0,
          left: 0,
          width: leftPanelWidth,
        });
      }
      // Section is in view and scrolling - left panel is fixed
      else if (sectionRect.top < 0 && sectionRect.bottom > viewportHeight) {
        setLeftStyle({
          position: "fixed",
          top: 0,
          left: sectionRect.left,
          width: leftPanelWidth,
        });
      }
      // Section is ending - left panel sticks to bottom
      else if (sectionRect.bottom <= viewportHeight) {
        setLeftStyle({
          position: "absolute",
          bottom: 0,
          top: "auto",
          left: 0,
          width: leftPanelWidth,
        });
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-creme border-t border-black/5">
      <div className="max-w-[1920px] mx-auto">
        {/* Mobile Layout */}
        <div className="lg:hidden py-6">
          {/* Compact Header - Matching BestSellers Style */}
          <div className="flex items-center justify-center px-4 mb-10">
            <div className="text-center">
              <span className="block text-xs font-primary uppercase tracking-[0.25em] text-alpha/60 mb-1.5">
                Curated Selection
              </span>
              <h2 className="text-3xl font-secondary text-alpha tracking-tight">
                Hot Selling
              </h2>
            </div>
          </div>

          {/* Products Swiper */}
          <div className="pl-4">
            <Swiper
              modules={[FreeMode]}
              spaceBetween={2}
              slidesPerView={1.6}
              speed={600}
              freeMode={{ enabled: true, sticky: false, momentumRatio: 0.5 }}
              grabCursor={true}
              breakpoints={{
                480: { slidesPerView: 2.1, spaceBetween: 2 },
                640: { slidesPerView: 2.5, spaceBetween: 4 },
              }}
              className="!overflow-visible"
            >
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <SwiperSlide key={i} className="!h-auto">
                    <ProductCardSkeleton />
                  </SwiperSlide>
                ))
              ) : hotProducts.length > 0 ? (
                hotProducts.map((product) => (
                  <SwiperSlide key={product.id} className="!h-auto">
                    <ProductCardItem product={product} />
                  </SwiperSlide>
                ))
              ) : (
                <div className="p-8 text-center border border-alpha/10 mx-4 text-alpha/50 font-primary text-sm">
                  No hot selling products found.
                </div>
              )}
            </Swiper>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block relative">
          {/* Left Panel - Controlled via JS */}
          <div 
            ref={leftPanelRef}
            style={leftStyle}
            className="w-1/2 h-screen z-10"
          >
            <div className="relative h-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop"
                alt="Trending Interior"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-alpha/80 via-alpha/40 to-transparent" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-12 xl:p-16">
                <span className="text-xs font-primary uppercase tracking-[0.3em] text-ivory/70 mb-4">
                  Curated Selection
                </span>
                <h2 className="font-secondary text-5xl xl:text-6xl 2xl:text-7xl text-ivory leading-[1.1] mb-6">
                  Hot Selling<br />
                  <span className="italic">Interiors</span><br />
                  2026
                </h2>
                <p className="text-ivory/80 font-primary text-sm xl:text-base max-w-md leading-relaxed mb-8">
                  From organic shapes to hand-painted ceramics and natural textures, 
                  we believe in only crafting timeless designs that tap into enduring elegance.
                </p>
                <a 
                  href="/collections" 
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ivory border border-ivory/30 px-6 py-3 w-fit hover:bg-ivory hover:text-alpha transition-all duration-300"
                >
                  Explore Collection
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Right Panel - Scrolling Products */}
          <div className="w-1/2 ml-auto bg-ivory/50">
            <div className="p-12 xl:p-16 pb-8 border-b border-alpha/10">
              <h3 className="font-secondary text-2xl xl:text-3xl text-alpha mb-2">
                Hot Selling
              </h3>
              <p className="text-text-secondary text-sm">
                Discover our most sought-after pieces this season
              </p>
              <a 
                href="/collections" 
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-alpha mt-4 hover:opacity-70 transition-opacity"
              >
                View All
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>

            <div className="p-8 xl:p-12">
              <div className="grid grid-cols-2 gap-1 md:gap-2 xl:gap-2">
                {loading ? (
                  [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
                ) : hotProducts.length > 0 ? (
                  hotProducts.map((product) => (
                    <ProductCardItem key={product.id} product={product} />
                  ))
                ) : (
                  <div className="col-span-2 p-12 text-center text-alpha/50 font-primary text-sm">
                    No hot selling products found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
