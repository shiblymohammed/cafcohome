"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/src/contexts/WishlistContext";
import { useCart } from "@/src/contexts/CartContext";
import type { Product } from "@/src/contexts/CartContext";

interface ProductCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}

export function ProductCard({
  children,
  className = "",
  onClick,
  href,
}: ProductCardProps) {
  if (href) {
    return (
      <Link
        href={href}
        className={`group cursor-pointer relative bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-xl border border-white/60 shadow-[inset_0_0_20px_rgba(255,255,255,0.5),0_8px_32px_rgba(0,0,0,0.05)] hover:shadow-[inset_0_0_20px_rgba(255,255,255,0.8),0_16px_48px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:border-white/80 rounded-2xl overflow-hidden transition-all duration-500 h-full flex flex-col ${className}`}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }

  return (
    <div
      className={`group cursor-pointer relative bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-xl border border-white/60 shadow-[inset_0_0_20px_rgba(255,255,255,0.5),0_8px_32px_rgba(0,0,0,0.05)] hover:shadow-[inset_0_0_20px_rgba(255,255,255,0.8),0_16px_48px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:border-white/80 rounded-2xl overflow-hidden transition-all duration-500 h-full flex flex-col ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Product Image - Sharp architectural look
interface ProductCardImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ProductCardImage({
  src,
  alt,
  className = "",
}: ProductCardImageProps) {
  return (
    <div
      className={`relative aspect-[4/5] overflow-hidden bg-sand w-full ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
      {/* Cinematic overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
    </div>
  );
}

// Product Quick Add Button - Appears on Hover
interface ProductCardQuickAddProps {
  product?: Product;
  onClick?: () => void;
  className?: string;
}

export function ProductCardQuickAdd({
  product,
  onClick,
  className = "",
}: ProductCardQuickAddProps) {
  const { addItem } = useCart();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product) {
      addItem(product, 1);
    }
    onClick?.();
  };

  return (
    <button
      suppressHydrationWarning
      onClick={handleClick}
      className={`bg-white/40 backdrop-blur-md border border-white/60 shadow-[inset_0_0_10px_rgba(255,255,255,0.5),0_4px_16px_rgba(0,0,0,0.1)] text-alpha transition-all duration-300 hover:bg-white/60 hover:shadow-[inset_0_0_15px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.15)] flex items-center justify-center rounded-xl lg:rounded-2xl
        w-9 h-9 md:w-10 md:h-10 
        lg:px-6 lg:py-3 lg:w-auto lg:h-auto lg:gap-2 
        ${className}`}
      aria-label="Add to cart"
    >
      <svg
        className="w-4 h-4 md:w-5 md:h-5 lg:w-5 lg:h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4v16m8-8H4"
        />
      </svg>
      <span className="hidden lg:inline text-sm font-normal uppercase">Add to Cart</span>
    </button>
  );
}

// Product Title - Elegant & Understated
interface ProductCardTitleProps {
  children: ReactNode;
  className?: string;
}

export function ProductCardTitle({
  children,
  className = "",
}: ProductCardTitleProps) {
  return (
    <h3
      className={`text-[0.65rem] md:text-xs lg:text-sm xl:text-base font-primary text-alpha font-bold leading-snug tracking-wide uppercase truncate w-full ${className}`}
    >
      {children}
    </h3>
  );
}

// Product Description - Hidden or very subtle
interface ProductCardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function ProductCardDescription({
  children,
  className = "",
}: ProductCardDescriptionProps) {
  return (
    <p
      className={`text-[0.55rem] md:text-[0.65rem] lg:text-xs xl:text-sm text-alpha/50 mt-0.5 font-primary tracking-normal leading-tight truncate w-full ${className}`}
    >
      {children}
    </p>
  );
}

// Product Meta (Category & Subcategory) - Uppercase kicker
interface ProductCardMetaProps {
  collection: string;
  category: string;
  className?: string;
}

export function ProductCardMeta({
  collection,
  category,
  className = "",
}: ProductCardMetaProps) {
  return (
    <div
      className={`flex items-center gap-1 mt-0.5 text-[0.45rem] md:text-[0.5rem] lg:text-[0.55rem] xl:text-[0.6rem] uppercase tracking-wider text-alpha/50 ${className}`}
    >
      <span>{collection}</span>
      <span className="text-alpha/30">|</span>
      <span>{category}</span>
    </div>
  );
}

// Product Rating - Star display with review count
interface ProductCardRatingProps {
  rating: number;
  reviewCount: number;
  className?: string;
}

export function ProductCardRating({
  rating,
  reviewCount,
  className = "",
}: ProductCardRatingProps) {
  return (
    <div className={`flex flex-col gap-0.5 mt-1 ${className}`}>
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-2.5 h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 ${
                star <= Math.round(rating)
                  ? 'fill-alpha text-alpha'
                  : 'fill-none text-alpha/20'
              }`}
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          ))}
        </div>
        <span className="text-[0.6rem] md:text-xs lg:text-sm xl:text-base text-alpha/70 font-primary font-semibold">
          {rating.toFixed(1)}
        </span>
      </div>
      <span className="text-[0.55rem] md:text-[0.6rem] lg:text-xs xl:text-sm text-alpha/60 font-primary">
        {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}
      </span>
    </div>
  );
}

// Product Price - Hidden by default (can be shown if needed)
interface ProductCardPriceProps {
  price?: string;
  originalPrice?: string;
  className?: string;
}

export function ProductCardPrice({}: ProductCardPriceProps) {
  return null;
}

// Product Badge - Minimalist tags
interface ProductCardBadgeProps {
  children: ReactNode;
  variant?: "dark" | "light" | "sale" | "new" | "gold" | "eco" | "limited" | "bestseller";
  className?: string;
}

export function ProductCardBadge({
  children,
  variant = "dark",
  className = "",
}: ProductCardBadgeProps) {
  const baseStyles =
    "absolute top-[8px] left-[8px] md:top-[12px] md:left-[12px] z-20 px-1.5 py-0.5 md:px-2 md:py-1 text-[0.5rem] md:text-[0.55rem] uppercase tracking-widest font-bold backdrop-blur-md border";
  
  // Luxury variants with glassmorphism
  const variantStyles = {
    dark: "bg-alpha/70 text-creme border border-alpha/40",
    light: "bg-creme/70 text-alpha border border-creme/40",
    sale: "bg-tango/70 text-white border border-tango/40",
    new: "bg-white/70 text-alpha border border-white/40",
    gold: "bg-gold/70 text-white border border-gold/40",
    eco: "bg-sage/70 text-white border border-sage/40",
    limited: "bg-alpha/60 text-creme border border-alpha/50",
    bestseller: "bg-white/70 text-alpha border border-white/40",
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
}

// Badge Group - Cycles through multiple badges with flip animation
interface BadgeItem {
  label: string;
  variant: "dark" | "light" | "sale" | "new" | "gold" | "eco" | "limited" | "bestseller";
}

interface ProductCardBadgeGroupProps {
  badges: BadgeItem[];
  className?: string;
}

export function ProductCardBadgeGroup({
  badges,
  className = "",
}: ProductCardBadgeGroupProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (badges.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % badges.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [badges.length]);

  if (!badges || badges.length === 0) return null;

  const variantStyles: Record<string, string> = {
    dark: "bg-alpha/70 text-creme border border-alpha/40",
    light: "bg-creme/70 text-alpha border border-creme/40",
    sale: "bg-tango/70 text-white border border-tango/40",
    new: "bg-white/70 text-alpha border border-white/40",
    gold: "bg-gold/70 text-white border border-gold/40",
    eco: "bg-sage/70 text-white border border-sage/40",
    limited: "bg-alpha/60 text-creme border border-alpha/50",
    bestseller: "bg-white/70 text-alpha border border-white/40",
  };

  return (
    <div className={`absolute top-[8px] left-[8px] md:top-[12px] md:left-[12px] z-20 ${className}`}>
      <div className="relative" style={{ perspective: "400px" }}>
        {badges.map((badge, index) => (
          <div
            key={`${badge.variant}-${index}`}
            className={`px-1.5 py-0.5 md:px-2 md:py-1 text-[0.5rem] md:text-[0.55rem] uppercase tracking-widest font-bold backdrop-blur-md whitespace-nowrap border ${variantStyles[badge.variant]} ${
              index === activeIndex
                ? "opacity-100"
                : "opacity-0 absolute top-0 left-0 pointer-events-none"
            }`}
            style={{
              transition: "opacity 0.5s ease, transform 0.5s ease",
              transform: index === activeIndex
                ? "rotateX(0deg) scale(1)"
                : index === (activeIndex - 1 + badges.length) % badges.length
                ? "rotateX(90deg) scale(0.95)"
                : "rotateX(-90deg) scale(0.95)",
            }}
          >
            {badge.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// Wishlist Button - Floating minimalist
interface ProductCardWishlistProps {
  product?: Product;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ProductCardWishlist({
  product,
  isActive,
  onClick,
  className = "",
}: ProductCardWishlistProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  const inWishlist = product ? isInWishlist(product.id) : (isActive || false);
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product) {
      toggleWishlist(product);
    }
    onClick?.();
  };

  return (
    <button
      suppressHydrationWarning
      onClick={handleClick}
      className={`absolute top-[8px] right-[8px] md:top-[12px] md:right-[12px] z-30 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300 hover:bg-white/60 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] ${
        inWishlist
          ? "text-red-500 scale-110"
          : "text-alpha hover:text-red-500 hover:scale-110"
      } ${className}`}
      aria-label="Add to wishlist"
    >
      <svg
        className="w-4 h-4 md:w-5 md:h-5 drop-shadow-sm"
        fill={inWishlist ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}

// Image Container - Pure wrapper
interface ProductCardImageContainerProps {
  children: ReactNode;
  className?: string;
}

export function ProductCardImageContainer({
  children,
  className = "",
}: ProductCardImageContainerProps) {
  return (
    <div className={`relative w-full ${className}`}>
      {children}
    </div>
  );
}

// Product Info Container - Wrapper for product details
interface ProductCardInfoProps {
  children: ReactNode;
  className?: string;
}

export function ProductCardInfo({
  children,
  className = "",
}: ProductCardInfoProps) {
  return (
    <div className={`relative px-1.5 md:px-2 lg:px-2.5 pt-0 pb-1.5 md:pb-2 lg:pb-2.5 flex-1 flex flex-col ${className}`}>
      {children}
    </div>
  );
}



// Skeleton - Minimalist
export function ProductCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="aspect-[4/5] bg-sand/30 animate-pulse" />
      <div className="space-y-2 px-1">
        <div className="h-4 bg-sand/30 w-2/3 animate-pulse" />
        <div className="h-3 bg-sand/20 w-1/3 animate-pulse" />
      </div>
    </div>
  );
}
