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
        className={`group cursor-pointer relative bg-productcardbg block transition-all duration-300 rounded-2xl shadow-product-card hover:shadow-product-card-hover h-full flex flex-col ${className}`}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }

  return (
    <div
      className={`group cursor-pointer relative bg-productcardbg transition-all duration-300 rounded-2xl shadow-product-card hover:shadow-product-card-hover h-full flex flex-col ${className}`}
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
      className={`relative aspect-square overflow-hidden bg-sand w-full rounded-lg ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 rounded-lg"
      />
      {/* Cinematic overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-lg" />
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
      className={`bg-alpha text-creme rounded-full lg:rounded-lg transition-all duration-300 hover:bg-alpha/90 flex items-center justify-center
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
    "absolute top-[12px] left-[12px] md:top-[16px] md:left-[16px] lg:top-[20px] lg:left-[20px] z-20 px-2 py-1 md:px-2.5 md:py-1.5 lg:px-3 lg:py-1.5 text-[0.6rem] md:text-[0.65rem] lg:text-xs uppercase tracking-wider font-bold rounded-full shadow-md backdrop-blur-md";
  
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
    <div className={`absolute top-[12px] left-[12px] md:top-[16px] md:left-[16px] lg:top-[20px] lg:left-[20px] z-20 ${className}`}>
      <div className="relative" style={{ perspective: "400px" }}>
        {badges.map((badge, index) => (
          <div
            key={`${badge.variant}-${index}`}
            className={`px-2 py-1 md:px-2.5 md:py-1.5 lg:px-3 lg:py-1.5 text-[0.6rem] md:text-[0.65rem] lg:text-xs uppercase tracking-wider font-bold rounded-full shadow-md backdrop-blur-md whitespace-nowrap ${variantStyles[badge.variant]} ${
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
      className={`w-7 h-7 md:w-10 md:h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-full transition-all duration-300 ${
        inWishlist
          ? "bg-alpha text-creme"
          : "bg-sand text-alpha hover:bg-alpha hover:text-creme"
      } ${className}`}
      aria-label="Add to wishlist"
    >
      <svg
        className="w-3.5 h-3.5 md:w-5 md:h-5 lg:w-6 lg:h-6"
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
    <div className={`relative p-1.5 md:p-2 lg:p-2.5 pb-1 ${className}`}>
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

// Product Color Swatches - Color variant display
interface ProductCardColorSwatchesProps {
  colors: Array<{ name: string; hex: string }>;
  selectedColor?: string;
  onColorSelect?: (color: string) => void;
  className?: string;
}

export function ProductCardColorSwatches({
  colors,
  selectedColor,
  onColorSelect,
  className = "",
}: ProductCardColorSwatchesProps) {
  if (!colors || !Array.isArray(colors) || colors.length === 0) return null;

  // Ensure we can get a valid active color
  // Color name to hex mapping for cases where API returns names or fallback hex
  const COLOR_MAP: Record<string, string> = {
    "Navy Blue": "#000080",
    "Emerald Green": "#50C878",
    "Charcoal Grey": "#36454F",
    "Cream White": "#FFFDD0",
    "Walnut Brown": "#773F1A",
    "Mustard Yellow": "#FFDB58",
    "Blush Pink": "#FE828C",
    "Jet Black": "#0A0A0A",
    "Midnight": "#191970",
    "Ivory": "#FFFFF0",
    "Charcoal": "#36454F",
    "Forest": "#228B22",
    "Cream": "#FFFDD0",
    "Navy": "#000080",
    "Sand": "#C2B280",
    "Graphite": "#383838",
    "Natural Oak": "#D6C09F",
    "Cognac": "#9A463D",
    "Taupe": "#483C32",
    "Emerald": "#50C878",
    "Blush": "#FE828C",
    "Sage": "#BCB88A",
    "Terracotta": "#E2725B",
    "Mustard": "#FFDB58",
    "Walnut": "#773F1A",
    "Oak": "#D6C09F",
    "Black": "#000000",
    "White": "#FFFFFF",
    "Natural": "#D2B48C",
  };

  const getColName = (c: any) => (typeof c === 'string' ? c : c?.name || '');
  const getColHex = (c: any) => {
    if (typeof c === 'string') {
      return COLOR_MAP[c] || c;
    }
    const hex = c?.hex || '#ccc';
    // If we have a name but the hex is the default #ccc, try mapping the name
    if (hex === '#ccc' || hex === '#CCCCCC') {
      const name = c?.name || '';
      return COLOR_MAP[name] || hex;
    }
    return hex;
  };

  const activeColor = selectedColor || (colors.length > 0 ? getColName(colors[0]) : null);

  return (
    <div className={`flex items-center gap-1.5 md:gap-2 flex-wrap ${className}`}>
      {colors.map((color, index) => {
        const name = getColName(color);
        const hex = getColHex(color);
        const uniqueKey = name ? `${name}-${index}` : `color-${index}`;
        
        return (
          <div
            key={uniqueKey}
            className={`w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-full border transition-all ${
              activeColor === name 
                ? "border-alpha ring-1 ring-alpha ring-offset-1" 
                : "border-alpha/20"
            }`}
            style={{ backgroundColor: hex }}
            title={name}
          />
        );
      })}
    </div>
  );
}

// Skeleton - Minimalist
export function ProductCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="aspect-[3/4] bg-sand/30 animate-pulse" />
      <div className="space-y-2 px-1">
        <div className="h-4 bg-sand/30 w-2/3 animate-pulse" />
        <div className="h-3 bg-sand/20 w-1/3 animate-pulse" />
      </div>
    </div>
  );
}
