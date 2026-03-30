"use client";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
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
    : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=800&fit=crop';

  const badges = [
    ...(product.is_bestseller ? [{ label: "Bestseller", variant: "bestseller" as const }] : []),
    ...(product.is_hot_selling ? [{ label: "Hot", variant: "sale" as const }] : []),
    ...(!product.is_in_stock ? [{ label: "Out of Stock", variant: "limited" as const }] : []),
  ];

  return (
    <ProductCard href={`/product/${product.slug}`}>
      <ProductCardImageContainer>
        {badges.length > 0 && <ProductCardBadgeGroup badges={badges} />}
        <ProductCardImage src={mainImage} alt={product.name} />
        <ProductCardWishlist product={product} />
      </ProductCardImageContainer>
      
      <div className="flex flex-col items-start px-1.5 md:px-2 py-2 md:py-3">
        <ProductCardTitle>{product.name}</ProductCardTitle>
        <ProductCardDescription>{product.description}</ProductCardDescription>
        <ProductCardMeta
            collection={product.category_name}
            category={product.subcategory_name}
          />
        <ProductCardRating rating={product.average_rating || 0} reviewCount={product.review_count || 0} />
        <div className="flex items-center justify-between w-full mt-2">
          <div className="flex items-center gap-3">
            {!product.is_in_stock && (
              <span className="text-xs text-red-600 font-primary">Out of Stock</span>
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
            <h2 className="text-2xl md:text-3xl lg:text-4xl text-text-primary font-inter tracking-tight uppercase font-bold">
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
            href="/collections"
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
          <h2 className="text-2xl md:text-3xl lg:text-4xl text-text-primary font-inter tracking-tight uppercase font-bold">
            Shop Our Best Sellers
          </h2>
          <p className="text-sm md:text-base text-text-secondary mt-0.5 leading-relaxed max-w-md mx-auto font-inter">
            Our most loved pieces, handpicked for you
          </p>
        </div>
        <a
          href="/products?bestseller=true"
          className="hidden md:inline-flex items-center gap-2 px-5 py-2 text-xs text-alpha border border-alpha/20 hover:bg-alpha hover:text-creme hover:border-alpha transition-all duration-300 tracking-wider group font-medium absolute right-0 top-1/2 -translate-y-1/2"
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

      {/* Products Swiper */}
      <div className="animate-fade-in">
        <Swiper
          modules={[FreeMode, Pagination]}
          spaceBetween={4}
          slidesPerView={1.4}
          slidesOffsetBefore={0}
          slidesOffsetAfter={0}
          freeMode={{ enabled: true, sticky: false }}
          pagination={{
            clickable: true,
            el: ".best-sellers-pagination",
          }}
          grabCursor={true}
          breakpoints={{
            480: {
              slidesPerView: 1.8,
              spaceBetween: 4,
              slidesOffsetBefore: 0,
              slidesOffsetAfter: 0,
            },
            640: {
              slidesPerView: 2.3,
              spaceBetween: 6,
              slidesOffsetBefore: 32,
              slidesOffsetAfter: 32,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 8,
              slidesOffsetBefore: 32,
              slidesOffsetAfter: 32,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 8,
              slidesOffsetBefore: 32,
              slidesOffsetAfter: 32,
            },
            1280: {
              slidesPerView: 4,
              spaceBetween: 10,
              slidesOffsetBefore: 32,
              slidesOffsetAfter: 32,
            },
          }}
          className="best-sellers-swiper"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id} className="!h-auto pb-2">
              <ProductCardItem product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Pagination Dots */}
      <div className="best-sellers-pagination flex justify-center gap-2 px-container pt-1.5" />

      {/* Mobile View All Link */}
      <div className="md:hidden flex justify-center mt-2.5 px-container">
        <a
          href="/products?bestseller=true"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-alpha text-creme text-xs hover:bg-alpha/90 transition-all duration-300 tracking-wider group font-medium uppercase"
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
