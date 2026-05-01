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

import { ProductCardPrice } from "@/src/components/ui/ProductCard";

function ProductCardItem({ product }: { product: Product }) {
  const mainImage = product.images && product.images.length > 0
    ? product.images[0].url 
    : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=800&auto=format&fit=crop';

  const applicableOffers = (product as any).applicable_offers || [];
  const bestOffer = applicableOffers.length > 0 ? applicableOffers[0] : null;
  const hasOffer = !!bestOffer;

  const badges = [
    ...(bestOffer ? [{ label: `${bestOffer.discount_percentage}% OFF`, variant: "sale" as const }] : []),
    ...(product.is_bestseller ? [{ label: "Bestseller", variant: "bestseller" as const }] : []),
    ...(product.is_hot_selling ? [{ label: "Hot", variant: "sale" as const }] : []),
    ...(!product.is_in_stock ? [{ label: "Out of Stock", variant: "limited" as const }] : []),
  ];

  return (
    <ProductCard href={`/product/${product.slug}`} hasOffer={hasOffer} className="h-full">
      <ProductCardImageContainer className="aspect-[4/5] overflow-hidden rounded-2xl">
        {badges.length > 0 && <ProductCardBadgeGroup badges={badges} />}
        <ProductCardImage src={mainImage} alt={product.name} className="object-cover w-full h-full" />
        <ProductCardWishlist product={product} />
      </ProductCardImageContainer>
      
      <div className="flex flex-col items-start px-2 py-3 md:py-4">
        <ProductCardTitle className="text-sm md:text-base font-medium text-alpha">{product.name}</ProductCardTitle>
        <ProductCardDescription className="text-xs md:text-sm text-alpha/60 mt-1 line-clamp-1">{product.description || "Premium Collection"}</ProductCardDescription>
        
        <div className="flex items-center justify-between w-full mt-2">
          <ProductCardMeta
            collection={(product as any).brand_name || product.category_name}
            category={product.subcategory_name}
          />
          <ProductCardRating rating={product.average_rating || 0} reviewCount={product.review_count || 0} />
        </div>
        
        <div className="mt-3 w-full">
          <ProductCardPrice 
            price={product.price || (product as any).selling_price} 
            mrp={product.mrp} 
            hasOffer={hasOffer} 
            offerPercentage={bestOffer?.discount_percentage} 
          />
        </div>
        
        <div className="flex items-center justify-between w-full mt-2">
          <div className="flex items-center gap-2">
            {!product.is_in_stock && (
              <span className="text-[10px] md:text-xs text-red-600 font-primary bg-red-50 px-2 py-0.5 rounded-full border border-red-100">Out of Stock</span>
            )}
          </div>
        </div>
      </div>
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
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch hot selling products
  useEffect(() => {
    async function loadHotSellingProducts() {
      try {
        const response = await ApiClient.getProducts({ is_hot_selling: "true", page_size: "10" });
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

  return (
    <section className="relative overflow-hidden py-12 md:py-16 xl:py-24 bg-gradient-to-b from-[#fbfaf8] via-creme to-[#f8f6f0]">
      {/* Intense Ambient Decorative Orbs for "Hot" vibe */}
      <FloatingOrb className="w-[800px] h-[800px] bg-gold/15 -top-60 -left-40 mix-blend-multiply" />
      <FloatingOrb className="w-[600px] h-[600px] bg-copper/10 bottom-0 right-0 mix-blend-multiply" />
      <FloatingOrb className="w-[400px] h-[400px] bg-orange-500/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-multiply" />

      <div className="w-full max-w-[2400px] mx-auto px-4 md:px-8 xl:px-16 2xl:px-24 relative z-10">
        
        {/* Massive Cinematic Header */}
        <div className="flex flex-col xl:flex-row items-center xl:items-end justify-between mb-10 md:mb-16 gap-6 md:gap-10">
          <div className="text-center xl:text-left flex-1">
            <span className="inline-flex items-center justify-center xl:justify-start gap-4 text-xs md:text-sm font-primary uppercase tracking-[0.4em] text-gold font-bold mb-6 w-full xl:w-auto">
              <span className="w-12 h-[2px] bg-gradient-to-r from-gold/0 via-gold to-gold/0 xl:from-gold xl:via-gold xl:to-gold/0" />
              High Demand
              <span className="w-12 h-[2px] bg-gradient-to-r from-gold/0 via-gold to-gold/0 xl:hidden" />
            </span>
            <h2 className="text-6xl md:text-[5.5rem] lg:text-[7rem] xl:text-[8rem] font-inter font-black tracking-tighter text-alpha leading-[0.85] uppercase">
              Trending<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-alpha via-alpha/80 to-alpha/40">
                Now
              </span>
            </h2>
          </div>
          
          <div className="flex flex-col items-center xl:items-end max-w-md text-center xl:text-right gap-6">
            <p className="text-alpha/60 font-primary text-sm md:text-base leading-relaxed">
              Our most sought-after pieces this season. Exquisite craftsmanship meeting contemporary design, curated for the modern luxury home.
            </p>
            <a 
              href="/products" 
              className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-primary font-bold text-alpha bg-white/60 backdrop-blur-md border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.05)] px-8 py-4 rounded-full hover:bg-white hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group"
            >
              Explore Collection
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Full Screen Edge-to-Edge Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 xl:gap-8">
          {loading ? (
            [...Array(10)].map((_, i) => <ProductCardSkeleton key={i} />)
          ) : hotProducts.length > 0 ? (
            hotProducts.map((product) => (
              <ProductCardItem key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-24 text-center text-alpha/40 font-primary text-base rounded-3xl bg-white/30 backdrop-blur-md border border-white/50">
              No trending products found at the moment.
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
