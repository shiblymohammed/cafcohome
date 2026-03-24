import { ReactNode } from "react";

// Main ProductCard container - uses design system
interface TestProductCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TestProductCard({
  children,
  className = "",
  onClick,
}: TestProductCardProps) {
  return (
    <div
      className={`group cursor-pointer bg-ivory border border-border-light rounded-card shadow-card hover:shadow-card-hover hover:border-border-medium transition-all duration-normal animate-fade-in ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Product Image with 3:4 ratio
interface TestProductCardImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function TestProductCardImage({
  src,
  alt,
  className = "",
}: TestProductCardImageProps) {
  return (
    <div
      className={`relative aspect-product overflow-hidden bg-sand ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-slow group-hover:scale-103"
      />
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-overlay opacity-0 group-hover:opacity-15 transition-opacity duration-normal" />
    </div>
  );
}

// Product Title
interface TestProductCardTitleProps {
  children: ReactNode;
  className?: string;
}

export function TestProductCardTitle({
  children,
  className = "",
}: TestProductCardTitleProps) {
  return (
    <h3
      className={`text-small font-primary text-text-primary leading-snug mt-3 line-clamp-1 px-3 transition-colors duration-fast group-hover:text-tango ${className}`}
    >
      {children}
    </h3>
  );
}

// Product Description (one line)
interface TestProductCardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function TestProductCardDescription({
  children,
  className = "",
}: TestProductCardDescriptionProps) {
  return (
    <p
      className={`text-caption text-text-secondary leading-snug mt-1 line-clamp-1 px-3 ${className}`}
    >
      {children}
    </p>
  );
}

// Product Meta (Collection | Category)
interface TestProductCardMetaProps {
  collection: string;
  category: string;
  className?: string;
}

export function TestProductCardMeta({
  collection,
  category,
  className = "",
}: TestProductCardMetaProps) {
  return (
    <div
      className={`flex items-center gap-2 mt-2 text-caption text-text-muted tracking-wide px-3 pb-3 ${className}`}
    >
      <span className="text-sage">{collection}</span>
      <span className="w-1 h-1 rounded-full bg-border-medium" />
      <span>{category}</span>
    </div>
  );
}

// Product Price
interface TestProductCardPriceProps {
  price: string;
  originalPrice?: string;
  className?: string;
}

export function TestProductCardPrice({
  price,
  originalPrice,
  className = "",
}: TestProductCardPriceProps) {
  return (
    <div
      className={`flex items-center gap-2 mt-2 px-3 pb-3 ${className}`}
    >
      <span className="text-small font-primary text-tango font-medium">
        {price}
      </span>
      {originalPrice && (
        <span className="text-caption text-text-muted line-through">
          {originalPrice}
        </span>
      )}
    </div>
  );
}

// Product Badge (Sale, New, etc.)
interface TestProductCardBadgeProps {
  children: ReactNode;
  variant?: "dark" | "light" | "sale" | "new" | "gold" | "eco" | "limited";
  className?: string;
}

export function TestProductCardBadge({
  children,
  variant = "dark",
  className = "",
}: TestProductCardBadgeProps) {
  const baseStyles =
    "absolute top-2 left-2 z-dropdown px-2.5 py-1 rounded-badge text-caption uppercase tracking-wider font-medium";

  const variantStyles = {
    dark: "bg-charcoal text-text-inverse",
    light: "bg-ivory/95 text-text-primary border border-border-light backdrop-blur-light shadow-card",
    sale: "bg-copper text-text-inverse",
    new: "bg-tango text-text-inverse",
    gold: "bg-gold text-charcoal",
    eco: "bg-sage text-charcoal",
    limited: "bg-blush text-charcoal",
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
}

// Wishlist Button
interface TestProductCardWishlistProps {
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function TestProductCardWishlist({
  isActive = false,
  onClick,
  className = "",
}: TestProductCardWishlistProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`absolute top-2 right-2 z-dropdown w-8 h-8 flex items-center justify-center rounded-full shadow-card transition-all duration-normal ${
        isActive
          ? "bg-blush text-charcoal shadow-card-hover scale-102"
          : "bg-ivory/95 backdrop-blur-light text-text-primary hover:bg-wind hover:text-tango hover:shadow-card-hover hover:scale-102"
      } ${className}`}
      aria-label="Add to wishlist"
    >
      <svg
        className="w-4 h-4 transition-transform duration-fast"
        fill={isActive ? "currentColor" : "none"}
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

// Add to Cart Button (overlay)
interface TestProductCardCartButtonProps {
  onClick?: () => void;
  className?: string;
}

export function TestProductCardCartButton({
  onClick,
  className = "",
}: TestProductCardCartButtonProps) {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 p-2 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-normal ${className}`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className="w-full py-2.5 bg-tango text-text-inverse text-caption uppercase tracking-wide font-medium rounded-button shadow-card hover:bg-hover-accent hover:shadow-card-hover transition-all duration-fast flex items-center justify-center gap-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        Add to Cart
      </button>
    </div>
  );
}

// Quick View Button
interface TestProductCardQuickViewProps {
  onClick?: () => void;
  className?: string;
}

export function TestProductCardQuickView({
  onClick,
  className = "",
}: TestProductCardQuickViewProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`absolute bottom-2 right-2 z-dropdown w-8 h-8 flex items-center justify-center rounded-full bg-ivory/95 backdrop-blur-light shadow-card opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-normal hover:bg-wind hover:text-tango hover:shadow-card-hover hover:scale-102 ${className}`}
      aria-label="Quick view"
    >
      <svg
        className="w-4 h-4 text-text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    </button>
  );
}

// Image Container (wraps image with badges, wishlist, cart button)
interface TestProductCardImageContainerProps {
  children: ReactNode;
  className?: string;
}

export function TestProductCardImageContainer({
  children,
  className = "",
}: TestProductCardImageContainerProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-t-card ${className}`}
    >
      {children}
    </div>
  );
}

// Skeleton loader for product card
export function TestProductCardSkeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`bg-ivory rounded-card border border-border-light overflow-hidden ${className}`}>
      <div className="aspect-product bg-gradient-to-br from-sand to-creme animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-sand rounded-badge w-3/4 animate-pulse" />
        <div className="h-3 bg-sand rounded-badge w-1/2 animate-pulse" />
        <div className="flex gap-2 pt-1">
          <div className="h-2 bg-wind/50 rounded-badge w-16 animate-pulse" />
          <div className="h-2 bg-sand rounded-badge w-12 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
