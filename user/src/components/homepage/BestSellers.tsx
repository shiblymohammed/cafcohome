"use client";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Autoplay } from "swiper/modules";
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

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBestsellers() {
      try {
        const response = await ApiClient.getProducts({ is_bestseller: "true", page_size: "12" });
        const data = response.results || response;
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load bestsellers:', error);
        if (error instanceof ApiClientError) {
          console.error('API Error:', error.error.message);
        }
      } finally {
        setLoading(false);
      }
    }
    loadBestsellers();
  }, []);

  if (loading) {
    return (
      <section className="bg-creme py-4 md:py-8 overflow-hidden">
        <div className="relative text-center px-container max-w-content mx-auto mb-3 md:mb-4">
          <div className="animate-slide-up">
            <h2 className="text-3xl md:text-5xl lg:text-6xl text-text-primary font-inter tracking-tighter font-black pb-1">
              Shop Our Best Sellers
            </h2>
            <p className="text-sm md:text-base text-text-secondary mt-0.5 leading-relaxed max-w-md mx-auto font-inter">
              Our most loved pieces, handpicked for you
            </p>
          </div>
        </div>
        <div className="px-container overflow-hidden pt-4 pb-8 flex space-x-4 md:space-x-6 lg:space-x-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-none w-[55%] sm:w-[40%] md:w-[30%] lg:w-[22%] flex flex-col gap-3 group animate-pulse">
              <div className="relative aspect-[3/4] w-full bg-alpha/5 overflow-hidden"></div>
              <div className="space-y-2 mt-2">
                <div className="h-4 bg-alpha/10 w-3/4"></div>
                <div className="h-3 bg-alpha/10 w-1/2"></div>
                <div className="h-3 bg-alpha/10 w-1/4 mt-3"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="bg-creme py-section-mobile md:py-section overflow-hidden">
        <div className="max-w-md mx-auto text-center py-10 md:py-16 px-container">
          <div className="w-16 h-16 mx-auto mb-6 text-text-secondary opacity-20">
            <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="8" y="8" width="48" height="48" rx="4" />
              <path d="M32 24v16M24 32h16" />
            </svg>
          </div>
          <h3 className="text-xl md:text-2xl font-secondary text-text-primary mb-3">
            No Bestsellers Yet
          </h3>
          <p className="text-small text-text-secondary mb-6 leading-relaxed">
            We're curating our bestselling products. Check back soon or explore our collections.
          </p>
          <a
            href="/products"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-medium text-alpha hover:text-alpha/70 transition-colors group"
          >
            Browse Collections
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-creme py-4 md:py-8 overflow-hidden">
      {/* Section Header */}
      <div className="relative text-center px-container max-w-content mx-auto mb-3 md:mb-4">
        <div className="animate-slide-up">
          <h2 className="text-3xl md:text-5xl lg:text-6xl text-text-primary font-inter tracking-tighter font-black pb-1">
            Shop Our Best Sellers
          </h2>
          <p className="text-sm md:text-base text-text-secondary mt-0.5 leading-relaxed max-w-md mx-auto font-inter">
            Our most loved pieces, handpicked for you
          </p>
        </div>
        <a
          href="/products?bestseller=true"
          className="hidden md:inline-flex items-center gap-2 px-6 py-2.5 text-xs text-alpha border border-white/60 bg-white/40 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.05)] hover:bg-white/60 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] rounded-full transition-all duration-300 tracking-wider group font-medium absolute right-0 top-1/2 -translate-y-1/2"
        >
          View All
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </a>
      </div>

      {/* Infinite Swiper Carousel */}
      <div className="animate-fade-in w-full max-w-[1920px] mx-auto px-4 md:px-12">
        <Swiper
          modules={[FreeMode, Autoplay]}
          spaceBetween={16}
          slidesPerView="auto"
          loop={true}
          speed={800}
          autoplay={{
            delay: 4000,
            disableOnInteraction: true,
          }}
          freeMode={{ enabled: true, sticky: false, momentumRatio: 0.8 }}
          breakpoints={{
            768: { spaceBetween: 24 },
          }}
          className="!overflow-visible pb-8 pt-2"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id} className="!w-[240px] sm:!w-[260px] md:!w-[300px] lg:!w-[320px]">
              <div className="transition-transform duration-300 hover:-translate-y-1 h-full">
                <ProductCardItem product={product} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Mobile View All Link */}
      <div className="md:hidden flex justify-center mt-2.5 px-container">
        <a
          href="/products?bestseller=true"
          className="inline-flex items-center gap-2 px-6 py-3 border border-white/60 bg-white/40 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.05)] hover:bg-white/60 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] text-alpha rounded-full transition-all duration-300 tracking-wider group font-medium uppercase"
        >
          View All Products
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}
