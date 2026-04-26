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
            <span className="text-success font-primary font-medium">In Stock</span>
          ) : (
            <span className="text-error font-primary font-medium">Out of Stock</span>
          )}
        </div>
      </ProductCardInfo>
    </ProductCard>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 group animate-pulse h-full rounded-2xl overflow-hidden bg-white/20 backdrop-blur-sm">
      <div className="relative aspect-[4/5] w-full bg-gradient-to-br from-sand/40 to-wind/30 overflow-hidden" />
      <div className="space-y-2.5 p-3">
        <div className="h-4 bg-sand/40 w-3/4 rounded-full" />
        <div className="h-3 bg-sand/30 w-1/2 rounded-full" />
        <div className="h-3 bg-sand/20 w-1/4 mt-3 rounded-full" />
      </div>
    </div>
  );
}

/* ─── Decorative Floating Orb ──────────────────────────── */
function FloatingOrb({ className }: { className?: string }) {
  return (
    <div
      className={`absolute rounded-full pointer-events-none blur-3xl opacity-30 ${className}`}
      aria-hidden="true"
    />
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
    <section ref={sectionRef} className="relative overflow-hidden bg-gradient-to-b from-creme via-ivory to-creme">
      {/* Ambient decorative orbs */}
      <FloatingOrb className="w-[500px] h-[500px] bg-gold/40 -top-40 -left-40" />
      <FloatingOrb className="w-[400px] h-[400px] bg-copper/30 bottom-20 right-10" />
      <FloatingOrb className="w-[300px] h-[300px] bg-sage/25 top-1/3 left-1/4" />

      <div className="max-w-[1920px] mx-auto relative z-10">
        {/* ═══════ MOBILE LAYOUT ═══════ */}
        <div className="lg:hidden py-10 md:py-14">
          {/* Header */}
          <div className="flex flex-col items-center px-container mb-8">
            <span className="inline-flex items-center gap-2 text-[0.65rem] font-primary uppercase tracking-[0.3em] text-gold mb-3">
              <span className="w-6 h-px bg-gold/60" />
              Trending Now
              <span className="w-6 h-px bg-gold/60" />
            </span>
            <h2 className="text-3xl md:text-4xl font-inter font-black tracking-tighter text-alpha text-center leading-[1.05]">
              Hot Selling
            </h2>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed text-center max-w-xs font-primary">
              Our most sought-after pieces this season
            </p>
          </div>

          {/* Products Swiper */}
          <div className="pl-4">
            <Swiper
              modules={[FreeMode]}
              spaceBetween={8}
              slidesPerView={1.5}
              speed={600}
              freeMode={{ enabled: true, sticky: false, momentumRatio: 0.5 }}
              grabCursor={true}
              breakpoints={{
                480: { slidesPerView: 2, spaceBetween: 10 },
                640: { slidesPerView: 2.4, spaceBetween: 12 },
              }}
              className="!overflow-visible !pt-2 !pb-6"
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
                <div className="p-8 text-center mx-4 text-alpha/50 font-primary text-sm rounded-2xl bg-white/30 backdrop-blur-sm border border-white/40">
                  No hot selling products found.
                </div>
              )}
            </Swiper>
          </div>

          {/* Mobile CTA */}
          <div className="flex justify-center mt-4 px-container">
            <a
              href="/collections"
              className="inline-flex items-center gap-2.5 px-7 py-3 text-xs uppercase tracking-[0.15em] font-primary font-medium text-alpha bg-white/40 backdrop-blur-md border border-white/60 shadow-[inset_0_0_12px_rgba(255,255,255,0.4),0_4px_20px_rgba(0,0,0,0.06)] hover:bg-white/60 hover:shadow-[inset_0_0_16px_rgba(255,255,255,0.7),0_8px_28px_rgba(0,0,0,0.1)] rounded-full transition-all duration-400 group"
            >
              Explore Collection
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* ═══════ DESKTOP LAYOUT ═══════ */}
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
              {/* Multi-layer gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-alpha/85 via-alpha/30 to-alpha/10" />
              <div className="absolute inset-0 bg-gradient-to-r from-alpha/20 to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-12 xl:p-16 2xl:p-20">
                {/* Accent line */}
                <span className="inline-flex items-center gap-3 text-[0.65rem] font-primary uppercase tracking-[0.35em] text-ivory/70 mb-5">
                  <span className="w-10 h-px bg-gradient-to-r from-gold to-gold/0" />
                  Curated Selection
                </span>

                <h2 className="font-inter font-black text-5xl xl:text-6xl 2xl:text-7xl text-ivory leading-[1.02] tracking-tighter mb-6">
                  Hot Selling<br />
                  <span className="font-secondary italic font-normal tracking-normal text-ivory/90">Interiors</span><br />
                  <span className="text-gold/80">2026</span>
                </h2>

                <p className="text-ivory/70 font-primary text-sm xl:text-base max-w-md leading-relaxed mb-10">
                  From organic shapes to hand-painted ceramics and natural textures, 
                  we craft timeless designs that tap into enduring elegance.
                </p>

                {/* CTA Button — Frosted glass pill */}
                <a 
                  href="/collections" 
                  className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-primary font-medium text-ivory bg-white/10 backdrop-blur-md border border-white/20 shadow-[inset_0_0_12px_rgba(255,255,255,0.08)] px-8 py-4 w-fit rounded-full hover:bg-white/20 hover:border-white/30 hover:shadow-[inset_0_0_20px_rgba(255,255,255,0.15),0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-500 group"
                >
                  Explore Collection
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Right Panel — Products Grid */}
          <div className="w-1/2 ml-auto">
            {/* Right panel header */}
            <div className="relative px-12 xl:px-16 2xl:px-20 pt-14 xl:pt-16 pb-10 border-b border-alpha/[0.06]">
              {/* Subtle decorative glow behind header */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
              
              <div className="relative">
                <span className="inline-flex items-center gap-2 text-[0.6rem] font-primary uppercase tracking-[0.3em] text-gold/80 mb-3">
                  <span className="w-5 h-px bg-gold/40" />
                  This Season
                </span>
                <h3 className="font-inter font-black text-3xl xl:text-4xl 2xl:text-[2.75rem] text-alpha tracking-tighter leading-[1.05] mb-2">
                  Hot Selling
                </h3>
                <p className="text-text-secondary text-sm font-primary max-w-sm leading-relaxed">
                  Discover our most sought-after pieces — loved by designers and homeowners alike.
                </p>
                <a 
                  href="/collections" 
                  className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.2em] font-primary font-semibold text-alpha mt-5 px-5 py-2.5 bg-white/40 backdrop-blur-sm border border-white/60 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:bg-white/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 group"
                >
                  View All
                  <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Products grid */}
            <div className="px-8 xl:px-12 2xl:px-16 py-10 xl:py-12">
              <div className="grid grid-cols-2 gap-4 xl:gap-5 2xl:gap-6">
                {loading ? (
                  [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
                ) : hotProducts.length > 0 ? (
                  hotProducts.map((product) => (
                    <ProductCardItem key={product.id} product={product} />
                  ))
                ) : (
                  <div className="col-span-2 p-16 text-center text-alpha/40 font-primary text-sm rounded-2xl bg-white/30 backdrop-blur-sm border border-white/40">
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
