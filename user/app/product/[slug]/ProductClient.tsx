"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingCart, Heart, Tag, Star, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProductCard, ProductCardImage, ProductCardImageContainer, ProductCardTitle, ProductCardDescription, ProductCardMeta, ProductCardWishlist, ProductCardBadgeGroup, ProductCardRating } from "@/src/components/ui/ProductCard";
import { useCart } from "@/src/contexts/CartContext";
import { useWishlist } from "@/src/contexts/WishlistContext";
import { useToast } from "@/src/contexts/ToastContext";
import { ProductReviews } from "@/src/components/reviews";
import FrequentlyBoughtTogether from "@/src/components/ui/FrequentlyBoughtTogether";

interface ProductVariant {
  id: number;
  product: number;
  color: string;
  color_hex: string;
  material: string;
  material_image?: string | null;
  sku: string;
  mrp: string;
  price: string;
  stock_quantity: number;
  is_in_stock: boolean;
  is_low_stock: boolean;
  is_default: boolean;
  is_active: boolean;
  images: Array<{
    url: string;
    alt?: string;
    order?: number;
  }>;
}

interface Offer {
  id: number;
  name: string;
  description: string;
  discount_percentage: number;
  apply_to: string;
  end_date: string;
  is_featured: boolean;
}

interface ProductClientProps {
  product: any; // API product structure
  variants: ProductVariant[];
  relatedProducts: any[];
}

export default function ProductClient({ product, variants = [], relatedProducts }: ProductClientProps) {
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);
    const [buyNowLoading, setBuyNowLoading] = useState(false);

    const { addItem } = useCart();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const { showToast } = useToast();
    const router = useRouter();

    const [selectedColor, setSelectedColor] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [activeAccordion, setActiveAccordion] = useState<string | null>("description");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [showMagnifier, setShowMagnifier] = useState(false);
    const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const MAGNIFIER_SIZE = 200;
    const ZOOM_LEVEL = 2.5;
    const AUTO_SWITCH_INTERVAL = 4000;

    const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

    const isProductInWishlist = product ? isInWishlist(product.id) : false;

    // Create a cart-compatible product object
    const getCartProduct = () => {
        const colors = Array.from(new Set(variants.filter(v => v.is_active).map(v => v.color)));
        const materials = Array.from(new Set(variants.filter(v => v.is_active).map(v => v.material)));
        const images = selectedVariant?.images || [];
        const is_in_stock = selectedVariant?.is_in_stock || false;

        return {
            ...product,
            colors,
            materials,
            images,
            is_in_stock,
        };
    };

    const handleAddToCart = () => {
        if (product && selectedVariant && selectedVariant.is_in_stock) {
            addItem(
                getCartProduct(), 
                quantity,
                {
                    id: selectedVariant.id,
                    sku: selectedVariant.sku,
                    price: parseFloat(selectedVariant.price),
                    mrp: parseFloat(selectedVariant.mrp),
                }
            );
            const mainImage = selectedVariant.images?.[0]?.url || product.main_image;
            showToast({
                type: 'cart',
                title: 'Added to cart',
                message: `${product.name}${quantity > 1 ? ` × ${quantity}` : ''}`,
                image: mainImage,
            });
        } else if (!selectedVariant?.is_in_stock) {
            showToast({ type: 'error', title: 'Out of stock', message: 'This variant is currently unavailable.' });
        }
    };

    const handleBuyNow = async () => {
        if (!product || !selectedVariant || !selectedVariant.is_in_stock) return;
        setBuyNowLoading(true);
        addItem(
            getCartProduct(),
            quantity,
            {
                id: selectedVariant.id,
                sku: selectedVariant.sku,
                price: parseFloat(selectedVariant.price),
                mrp: parseFloat(selectedVariant.mrp),
            }
        );
        showToast({ type: 'cart', title: 'Redirecting to checkout…', message: product.name });
        await new Promise(r => setTimeout(r, 80));
        router.push('/checkout');
    };

    // Handle hydration with a small delay to prevent flash
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsHydrated(true);
        }, 100); // Small delay to ensure smooth transition
        
        return () => clearTimeout(timer);
    }, []);

    // Initialize selected variant on mount and when variants change
    useEffect(() => {
        if (variants && variants.length > 0 && !selectedVariant) {
            const defaultVariant = variants.find(v => v.is_default) || variants[0];
            if (defaultVariant) {
                setSelectedVariant(defaultVariant);
                setSelectedColor(defaultVariant.color);
                setSelectedMaterial(defaultVariant.material);
            }
        }
    }, [variants, selectedVariant]);

    // Update selected variant when color or material changes
    useEffect(() => {
        if (variants.length > 0 && selectedColor && selectedMaterial) {
            const matchingVariant = variants.find(
                v => v.color === selectedColor && v.material === selectedMaterial && v.is_active
            );
            if (matchingVariant) {
                setSelectedVariant(matchingVariant);
            }
        }
    }, [selectedColor, selectedMaterial, variants]);

    // Color name to hex mapping for mock data
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

    // Get unique colors and materials from variants
    const availableColors = variants.length > 0 
        ? Array.from(new Map(variants.filter(v => v.is_active).map(v => {
            let hex = v.color_hex || '#CCCCCC';
            if (hex === '#CCCCCC' || hex === '#ccc') {
                hex = COLOR_MAP[v.color] || hex;
            }
            return [v.color, { name: v.color, hex }];
        })).values())
        : [];
    
    const availableMaterials = variants.length > 0
        ? Array.from(
            new Map(
                variants
                    .filter(v => v.is_active && v.color === selectedColor)
                    .map(v => [v.material, { name: v.material, image: v.material_image || null }])
            ).values()
          )
        : [];

    const handleToggleWishlist = () => {
        if (!product) return;
        
        if (isProductInWishlist) {
            removeFromWishlist(product.id);
            showToast({ type: 'info', title: 'Removed from wishlist', message: product.name });
        } else {
            addToWishlist(getCartProduct());
            showToast({ type: 'wishlist', title: 'Added to wishlist', message: product.name });
        }
    };

    const toggleAccordion = (id: string) => {
        setActiveAccordion(activeAccordion === id ? null : id);
    };

    const handlePrevImage = useCallback(() => {
        const images = selectedVariant && selectedVariant.images && selectedVariant.images.length > 0
            ? selectedVariant.images.map(img => img.url)
            : ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=1200&auto=format&fit=crop'];
        if (!images || images.length === 0) return;
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [selectedVariant]);

    const handleNextImage = useCallback(() => {
        const images = selectedVariant && selectedVariant.images && selectedVariant.images.length > 0
            ? selectedVariant.images.map(img => img.url)
            : ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=1200&auto=format&fit=crop'];
        if (!images || images.length === 0) return;
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, [selectedVariant]);

    useEffect(() => {
        const images = selectedVariant && selectedVariant.images && selectedVariant.images.length > 0
            ? selectedVariant.images.map(img => img.url)
            : ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=1200&auto=format&fit=crop'];
        if (!isAutoPlaying || !images || images.length === 0) return;

        const interval = setInterval(() => {
            handleNextImage();
        }, AUTO_SWITCH_INTERVAL);

        return () => clearInterval(interval);
    }, [isAutoPlaying, handleNextImage, selectedVariant]);

    useEffect(() => {
        if (imageContainerRef.current) {
            const rect = imageContainerRef.current.getBoundingClientRect();
            setImgDimensions({ width: rect.width, height: rect.height });
        }
    }, [currentImageIndex]);

    const handleMouseEnter = () => {
        setIsAutoPlaying(false);
        if (imageContainerRef.current) {
            const rect = imageContainerRef.current.getBoundingClientRect();
            setImgDimensions({ width: rect.width, height: rect.height });
        }
    };

    const handleMouseLeave = () => {
        setIsAutoPlaying(true);
        setShowMagnifier(false);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imageContainerRef.current) return;

        const rect = imageContainerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setCursorPosition({ x, y });
        setMagnifierPosition({ x, y });
        setShowMagnifier(true);
    };

    // Swipe handlers for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            handleNextImage();
        }
        if (isRightSwipe) {
            handlePrevImage();
        }

        setTouchStart(0);
        setTouchEnd(0);
    };

    const formatDimensions = () => {
        if (!product?.dimensions) return "Dimensions not available";
        const { length, width, height, unit = "cm" } = product.dimensions;
        if (length && width && height) {
            return `W ${width}${unit} x D ${length}${unit} x H ${height}${unit}`;
        }
        return "Dimensions not available";
    };

    const productImages = selectedVariant && selectedVariant.images && selectedVariant.images.length > 0
        ? selectedVariant.images.map(img => img.url)
        : ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=1200&auto=format&fit=crop'];

    const currentStock = selectedVariant?.stock_quantity || 0;
    const isInStock = selectedVariant?.is_in_stock || false;
    const isLowStock = selectedVariant?.is_low_stock || false;
    const currentPrice = selectedVariant?.price ? parseFloat(selectedVariant.price) : null;
    const currentMRP = selectedVariant?.mrp ? parseFloat(selectedVariant.mrp) : null;
    const discountPercentage = currentMRP && currentPrice ? Math.round(((currentMRP - currentPrice) / currentMRP) * 100) : 0;

    // Get applicable offers and calculate offer pricing
    const applicableOffers: Offer[] = product?.applicable_offers || [];
    const bestOffer = applicableOffers.length > 0 ? applicableOffers[0] : null; // Offers are sorted by discount percentage
    
    // Calculate offer pricing
    const offerPrice = bestOffer && currentPrice ? currentPrice * (1 - bestOffer.discount_percentage / 100) : null;
    const totalDiscount = bestOffer && currentMRP && offerPrice ? Math.round(((currentMRP - offerPrice) / currentMRP) * 100) : discountPercentage;

    // Show loading skeleton until hydrated and variants are loaded
    if (!isHydrated || (variants.length > 0 && !selectedVariant)) {
        return (
            <div className="bg-creme min-h-screen pt-16 md:pt-20 lg:pt-24">
                {/* Breadcrumbs */}
                <div className="border-b border-alpha/10 bg-white/50">
                    <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 py-3 md:py-4">
                        <nav className="flex items-center gap-2 text-[10px] md:text-xs text-alpha/60 font-primary">
                            <Link href="/" className="hover:text-alpha transition-colors">Home</Link>
                            <span className="text-alpha/30">/</span>
                            <Link href="/collections" className="hover:text-alpha transition-colors">Collections</Link>
                            <span className="text-alpha/30">/</span>
                            <Link href={`/collections/${product.collection_slug}`} className="hover:text-alpha transition-colors">{product.collection_name}</Link>
                            <span className="text-alpha/30">/</span>
                            <span className="text-alpha font-medium">{product.name}</span>
                        </nav>
                    </div>
                </div>

                {/* Product Section */}
                <section className="max-w-[1600px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 xl:gap-12">
                        {/* Left: Gallery */}
                        <div className="lg:col-span-1">
                            <div className="p-0 md:p-6 lg:p-8">
                                <div className="relative w-full aspect-square overflow-hidden bg-[#f5f5f5] animate-pulse md:rounded-lg">
                                </div>
                                <div className="hidden md:flex gap-3 overflow-x-auto pt-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-20 h-20 flex-shrink-0 bg-[#f5f5f5] animate-pulse rounded-md"></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Details */}
                        <div className="lg:col-span-1 relative">
                            <div className="lg:sticky lg:top-24 px-4 py-6 md:px-8 lg:px-8 lg:py-8 flex flex-col bg-white lg:bg-transparent rounded-t-2xl lg:rounded-none -mt-4 lg:mt-0 shadow-lg lg:shadow-none border-t border-alpha/10 lg:border-0">
                                <div className="mb-6 md:mb-8">
                                    <span className="text-[10px] md:text-xs font-primary uppercase tracking-[0.25em] text-alpha/60 mb-1 md:mb-2 block">
                                        {product.collection_name} Collection
                                    </span>
                                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-secondary text-alpha leading-[1.1] mb-2 md:mb-4">
                                        {product.name}
                                    </h1>
                                    
                                    {/* Loading Stock */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-5 w-20 bg-alpha/10 animate-pulse rounded"></div>
                                        <span className="text-xs text-alpha/40">•</span>
                                        <div className="h-4 w-24 bg-alpha/10 animate-pulse rounded"></div>
                                    </div>
                                </div>

                                {/* Loading Variants */}
                                <div className="mb-6 md:mb-8">
                                    <div className="h-4 w-16 bg-alpha/10 animate-pulse rounded mb-3"></div>
                                    <div className="flex gap-2 md:gap-3 flex-wrap">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="h-10 w-20 bg-alpha/10 animate-pulse rounded"></div>
                                        ))}
                                    </div>
                                </div>

                                {/* Loading Actions */}
                                <div className="mb-6 md:mb-12 space-y-3 md:space-y-4">
                                    <div className="w-full h-14 bg-alpha/10 animate-pulse rounded"></div>
                                    <div className="w-full h-14 bg-alpha/10 animate-pulse rounded"></div>
                                    <div className="w-full h-12 bg-alpha/10 animate-pulse rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="bg-creme min-h-screen pt-16 md:pt-20 lg:pt-24 pb-20 md:pb-0">
            {/* Breadcrumbs */}
            <div className="border-b border-alpha/10 bg-white/50">
                <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 py-3 md:py-4">
                    <nav className="flex items-center gap-2 text-[10px] md:text-xs text-alpha/60 font-primary">
                        <Link href="/" className="hover:text-alpha transition-colors">Home</Link>
                        <span className="text-alpha/30">/</span>
                        <Link href="/categories" className="hover:text-alpha transition-colors">Categories</Link>
                        <span className="text-alpha/30">/</span>
                        <Link href={`/categories/${product.category_slug}`} className="hover:text-alpha transition-colors">{product.category_name}</Link>
                        <span className="text-alpha/30">/</span>
                        <span className="text-alpha font-medium">{product.name}</span>
                    </nav>
                </div>
            </div>

            {/* Product Section */}
            <section className="max-w-[1600px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 xl:gap-8">

                    {/* Left: Gallery - Sticky Container (5 columns) */}
                    <div className="lg:col-span-5">
                        <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-hidden p-0 md:p-4 lg:p-6 lg:pr-0">

                            {/* Main Image - Exact 4:5 ratio */}
                            <div
                                ref={imageContainerRef}
                                className="relative w-full overflow-hidden bg-white md:rounded-lg md:shadow-sm group md:cursor-crosshair md:border md:border-alpha/5"
                                style={{ 
                                    aspectRatio: '4/5',
                                    maxHeight: 'calc(100vh - 16rem)' 
                                }}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                onMouseMove={handleMouseMove}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                <Image
                                    src={productImages[currentImageIndex]}
                                    alt={`${product.name} - View ${currentImageIndex + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 60vw"
                                    className="object-cover"
                                    priority
                                />

                                {showMagnifier && (
                                    <div
                                        className="hidden md:block absolute pointer-events-none rounded-full border-4 border-white shadow-2xl overflow-hidden z-10"
                                        style={{
                                            width: MAGNIFIER_SIZE,
                                            height: MAGNIFIER_SIZE,
                                            left: cursorPosition.x - MAGNIFIER_SIZE / 2,
                                            top: cursorPosition.y - MAGNIFIER_SIZE / 2,
                                        }}
                                    >
                                        <div
                                            className="w-full h-full"
                                            style={{
                                                backgroundImage: `url(${productImages[currentImageIndex]})`,
                                                backgroundSize: `${imgDimensions.width * ZOOM_LEVEL}px ${imgDimensions.height * ZOOM_LEVEL}px`,
                                                backgroundPosition: `-${magnifierPosition.x * ZOOM_LEVEL - MAGNIFIER_SIZE / 2}px -${magnifierPosition.y * ZOOM_LEVEL - MAGNIFIER_SIZE / 2}px`,
                                                backgroundRepeat: 'no-repeat',
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Navigation buttons - hidden on mobile */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                                    className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-white rounded-full items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="w-6 h-6 text-alpha" />
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                                    className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-white rounded-full items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="w-6 h-6 text-alpha" />
                                </button>

                                {/* Swipe indicator for mobile */}
                                <div className="md:hidden absolute top-4 right-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                                    Swipe to view
                                </div>

                                {/* Image indicators */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                                    {productImages.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentImageIndex(i)}
                                            className={`h-2 rounded-full transition-all duration-300 ${currentImageIndex === i
                                                ? 'bg-white w-6 shadow-lg'
                                                : 'bg-white/50 hover:bg-white/70 w-2'
                                                }`}
                                            aria-label={`Go to image ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Thumbnails - hidden on mobile, shown on tablet+ */}
                            <div className="hidden md:flex gap-2 lg:gap-3 overflow-x-auto pt-3 lg:pt-4 pb-2 scrollbar-hide">
                                {productImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentImageIndex(i)}
                                        className={`relative w-12 lg:w-14 flex-shrink-0 overflow-hidden bg-white rounded-md transition-all duration-200 border-2 ${currentImageIndex === i
                                            ? 'border-alpha shadow-md scale-105'
                                            : 'border-alpha/10 opacity-70 hover:opacity-100 hover:border-alpha/30'
                                            }`}
                                        style={{ aspectRatio: '4/5' }}
                                    >
                                        <Image
                                            src={img}
                                            alt={`Thumbnail ${i + 1}`}
                                            fill
                                            sizes="56px"
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Details - Scrollable (7 columns) */}
                    <div className="lg:col-span-7 relative">
                        <div className="px-4 py-6 md:px-6 lg:px-8 lg:py-8 flex flex-col bg-white lg:bg-transparent rounded-t-2xl lg:rounded-none -mt-4 lg:mt-0 shadow-lg lg:shadow-none border-t border-alpha/10 lg:border-0">

                            {/* Header */}
                            <div className="mb-6 md:mb-8 pb-6 border-b border-alpha/10">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex-1">
                                        <span className="text-[10px] md:text-xs font-primary uppercase tracking-[0.25em] text-alpha/50 mb-2 block">
                                            {product.category_name}
                                        </span>
                                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-secondary text-alpha leading-tight mb-2">
                                            {product.name}
                                        </h1>
                                        
                                        {/* Star Rating Summary */}
                                        {(product.review_count > 0 || isHydrated) && (
                                            <button 
                                                onClick={() => {
                                                    document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className="flex items-center gap-2 group mb-4 text-left transition-all"
                                            >
                                                <div className="flex text-amber-500">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star 
                                                            key={i} 
                                                            className={`w-4 h-4 ${i < (product.average_rating || 0) ? 'fill-current' : 'text-alpha/20'}`} 
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-primary text-alpha/60 group-hover:text-alpha transition-colors border-b border-dashed border-transparent group-hover:border-alpha/30 pb-0.5">
                                                    {product.average_rating ? `${product.average_rating} (${product.review_count} Reviews)` : 'Write the first review'}
                                                </span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Price Display */}
                                    {isHydrated && currentPrice !== null && (
                                        <div className="mb-4 flex items-baseline gap-3 flex-wrap">
                                            <span className="text-2xl md:text-3xl font-primary font-bold text-alpha">
                                                ₹{(offerPrice !== null ? offerPrice : currentPrice).toLocaleString("en-IN")}
                                            </span>
                                            {currentMRP !== null && currentMRP > (offerPrice !== null ? offerPrice : currentPrice) && (
                                                <>
                                                    <span className="text-sm md:text-base font-primary text-alpha/40 line-through">
                                                        ₹{currentMRP.toLocaleString("en-IN")}
                                                    </span>
                                                    <span className="text-xs md:text-sm font-primary text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">
                                                        {totalDiscount}% OFF
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    {product.is_bestseller && (
                                        <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] uppercase tracking-wider rounded-full font-medium shadow-sm">
                                            Bestseller
                                        </span>
                                    )}
                                </div>
                                
                                {/* Offer Badge */}
                                {bestOffer && (
                                    <div className="mb-4">
                                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg text-xs font-medium shadow-md">
                                            <Tag className="w-4 h-4" />
                                            <span>{bestOffer.name} - {bestOffer.discount_percentage}% OFF</span>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Stock Status */}
                                {isHydrated && selectedVariant ? (
                                    <div className="flex items-center gap-3">
                                        {isInStock ? (
                                            <>
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${isLowStock ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                                                    <span className={`w-2 h-2 rounded-full ${isLowStock ? 'bg-orange-500' : 'bg-green-500'} animate-pulse`}></span>
                                                    {isLowStock ? `Only ${currentStock} left` : 'In Stock'}
                                                </div>
                                                <span className="text-xs text-alpha/40 font-primary">
                                                    SKU: {selectedVariant.sku}
                                                </span>
                                            </>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                Out of Stock
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="h-7 w-24 bg-alpha/10 animate-pulse rounded-full"></div>
                                        <div className="h-4 w-20 bg-alpha/10 animate-pulse rounded"></div>
                                    </div>
                                )}
                            </div>

                            {/* Color Selection */}
                            {isHydrated && availableColors.length > 0 ? (
                                <div className="mb-6 md:mb-8 p-3 bg-alpha/5 rounded-lg">
                                    <span className="text-xs font-primary uppercase tracking-wider text-alpha/70 mb-3 block">
                                        Color: <span className="text-alpha font-medium">{selectedColor}</span>
                                    </span>
                                    <div className="flex gap-2 flex-wrap">
                                        {availableColors.map((color) => (
                                            <button
                                                key={color.name}
                                                onClick={() => {
                                                    setSelectedColor(color.name);
                                                    // Reset material selection when color changes
                                                    const materialsForColor = variants.filter(v => v.color === color.name && v.is_active).map(v => v.material);
                                                    if (materialsForColor.length > 0 && !materialsForColor.includes(selectedMaterial)) {
                                                        setSelectedMaterial(materialsForColor[0]);
                                                    }
                                                }}
                                                className={`relative w-9 h-9 md:w-10 md:h-10 rounded-full border-2 transition-all shadow-sm hover:shadow-md ${selectedColor === color.name 
                                                    ? "border-alpha ring-2 ring-alpha/20 scale-110" 
                                                    : "border-alpha/20 hover:border-alpha/40"
                                                }`}
                                                style={{ backgroundColor: color.hex }}
                                                title={color.name}
                                                aria-label={`Select ${color.name} color`}
                                            >
                                                {selectedColor === color.name && (
                                                    <span className="absolute inset-0 flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : variants.length > 0 ? (
                                <div className="mb-6 md:mb-8">
                                    <span className="text-xs font-primary uppercase tracking-wider text-alpha/70 mb-3 block">
                                        Color: <div className="inline-block h-4 w-16 bg-alpha/10 animate-pulse rounded"></div>
                                    </span>
                                    <div className="flex gap-2 flex-wrap">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="h-9 w-9 md:h-10 md:w-10 bg-alpha/10 animate-pulse rounded-full"></div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {/* Material Selection */}
                            {isHydrated && availableMaterials.length > 0 ? (
                                <div className="mb-6 md:mb-8 p-4 bg-alpha/5 rounded-lg">
                                    <span className="text-xs font-primary uppercase tracking-wider text-alpha/70 mb-4 block">
                                        Material: <span className="text-alpha font-medium">{selectedMaterial}</span>
                                    </span>
                                    <div className="flex gap-2 md:gap-3 flex-wrap">
                                        {availableMaterials.map((mat) => (
                                            mat.image ? (
                                                /* Image swatch */
                                                <button
                                                    key={mat.name}
                                                    onClick={() => setSelectedMaterial(mat.name)}
                                                    title={mat.name}
                                                    aria-label={`Select ${mat.name} material`}
                                                    className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 shadow-sm hover:shadow-md group ${
                                                        selectedMaterial === mat.name
                                                            ? "border-alpha ring-2 ring-alpha/20 scale-105"
                                                            : "border-alpha/20 hover:border-alpha/50"
                                                    }`}
                                                >
                                                    <img
                                                        src={mat.image}
                                                        alt={mat.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {/* Selected check overlay */}
                                                    {selectedMaterial === mat.name && (
                                                        <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                            <svg className="w-5 h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </span>
                                                    )}
                                                    {/* Hover tooltip */}
                                                    <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-primary uppercase tracking-wider text-alpha opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                        {mat.name}
                                                    </span>
                                                </button>
                                            ) : (
                                                /* Fallback text button */
                                                <button
                                                    key={mat.name}
                                                    onClick={() => setSelectedMaterial(mat.name)}
                                                    className={`px-5 py-2.5 text-xs uppercase tracking-wider border-2 rounded-lg transition-all font-medium ${
                                                        selectedMaterial === mat.name
                                                            ? "border-alpha bg-alpha text-creme shadow-md"
                                                            : "border-alpha/20 bg-white hover:border-alpha hover:shadow-sm"
                                                    }`}
                                                >
                                                    {mat.name}
                                                </button>
                                            )
                                        ))}
                                    </div>
                                </div>
                            ) : variants.length > 0 && availableColors.length > 0 ? (
                                <div className="mb-6 md:mb-8">
                                    <span className="text-[10px] md:text-xs font-primary uppercase tracking-widest text-alpha/60 mb-3 md:mb-4 block">
                                        Material: <div className="inline-block h-4 w-20 bg-alpha/10 animate-pulse rounded"></div>
                                    </span>
                                    <div className="flex gap-2 md:gap-3 flex-wrap">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="h-14 w-14 bg-alpha/10 animate-pulse rounded-lg"></div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {/* Quantity Selector */}
                            <div className="mb-6 md:mb-8">
                                <span className="text-xs font-primary uppercase tracking-wider text-alpha/70 mb-3 block">
                                    Quantity
                                </span>
                                <div className="inline-flex items-center gap-0 border-2 border-alpha/20 rounded-lg overflow-hidden bg-white">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-12 hover:bg-alpha/5 flex items-center justify-center transition-colors border-r border-alpha/10"
                                        aria-label="Decrease quantity"
                                    >
                                        <span className="text-xl text-alpha">−</span>
                                    </button>
                                    <span className="w-16 text-center font-primary text-alpha font-medium">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-12 h-12 hover:bg-alpha/5 flex items-center justify-center transition-colors border-l border-alpha/10"
                                        aria-label="Increase quantity"
                                    >
                                        <span className="text-xl text-alpha">+</span>
                                    </button>
                                </div>
                            </div>

                            {/* Actions - Hidden on mobile (shown in sticky bar) */}
                            <div className="hidden md:flex mb-8 md:mb-12 flex-col space-y-3">

                                {/* ── Buy Now ── primary CTA */}
                                <button
                                    id="buy-now-btn"
                                    onClick={handleBuyNow}
                                    disabled={!isHydrated || !isInStock || !selectedVariant || buyNowLoading}
                                    className="relative w-full overflow-hidden group bg-gold text-white py-4 md:py-5 px-6 md:px-8 text-xs md:text-sm uppercase tracking-wider rounded-lg shadow-lg hover:shadow-xl font-medium flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#8C6A54]"
                                >
                                    {/* shimmer sweep */}
                                    <span className="pointer-events-none absolute inset-0 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                    {buyNowLoading ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                            </svg>
                                            Going to checkout…
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-5 h-5" />
                                            {!isHydrated ? 'Loading…' : !selectedVariant ? 'Select Options' : isInStock ? 'Buy Now' : 'Out of Stock'}
                                        </>
                                    )}
                                </button>

                                {/* ── Add to Cart ── secondary */}
                                <button
                                    id="add-to-cart-btn"
                                    onClick={handleAddToCart}
                                    disabled={!isHydrated || !isInStock || !selectedVariant}
                                    className="w-full bg-alpha text-creme py-4 md:py-4 px-6 md:px-8 text-xs md:text-sm uppercase tracking-wider hover:bg-alpha/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 rounded-lg font-medium border-2 border-alpha"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {!isHydrated ? 'Loading…' : !selectedVariant ? 'Select Options' : isInStock ? 'Add to Cart' : 'Out of Stock'}
                                </button>

                                {/* ── Wishlist ── tertiary */}
                                <button
                                    onClick={handleToggleWishlist}
                                    disabled={!isHydrated}
                                    className={`w-full border-2 py-3 md:py-3.5 px-6 md:px-8 text-xs md:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 rounded-lg font-medium ${
                                        isProductInWishlist
                                            ? 'border-red-500 text-red-600 bg-red-50 hover:bg-red-100 shadow-sm'
                                            : 'border-alpha/20 text-alpha hover:border-alpha hover:shadow-md bg-white'
                                    }`}
                                >
                                    <Heart className={`w-5 h-5 ${isProductInWishlist ? 'fill-current' : ''}`} />
                                    {!isHydrated ? 'Loading…' : isProductInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                                </button>
                            </div>

                            {/* Accordions */}
                            <div className="space-y-3">
                                <div className="bg-white rounded-lg border border-alpha/10 overflow-hidden shadow-sm">
                                    <button
                                        onClick={() => toggleAccordion('description')}
                                        className="w-full py-4 px-5 flex items-center justify-between text-left group hover:bg-alpha/5 transition-colors"
                                    >
                                        <span className="text-xs md:text-sm font-medium uppercase tracking-wider text-alpha">Description</span>
                                        <span className={`text-xl transform transition-transform duration-300 ${activeAccordion === 'description' ? 'rotate-180' : ''}`}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </button>
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeAccordion === 'description' ? 'max-h-96 border-t border-alpha/10' : 'max-h-0'}`}>
                                        <p className="text-sm font-primary text-alpha/80 leading-relaxed p-5">
                                            {product.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg border border-alpha/10 overflow-hidden shadow-sm">
                                    <button
                                        onClick={() => toggleAccordion('dimensions')}
                                        className="w-full py-4 px-5 flex items-center justify-between text-left group hover:bg-alpha/5 transition-colors"
                                    >
                                        <span className="text-xs md:text-sm font-medium uppercase tracking-wider text-alpha">Dimensions</span>
                                        <span className={`text-xl transform transition-transform duration-300 ${activeAccordion === 'dimensions' ? 'rotate-180' : ''}`}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </button>
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeAccordion === 'dimensions' ? 'max-h-40 border-t border-alpha/10' : 'max-h-0'}`}>
                                        <p className="text-sm font-primary text-alpha/80 leading-relaxed p-5">
                                            {formatDimensions()}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg border border-alpha/10 overflow-hidden shadow-sm">
                                    <button
                                        onClick={() => toggleAccordion('details')}
                                        className="w-full py-4 px-5 flex items-center justify-between text-left group hover:bg-alpha/5 transition-colors"
                                    >
                                        <span className="text-xs md:text-sm font-medium uppercase tracking-wider text-alpha">Product Details</span>
                                        <span className={`text-xl transform transition-transform duration-300 ${activeAccordion === 'details' ? 'rotate-180' : ''}`}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </button>
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeAccordion === 'details' ? 'max-h-40 border-t border-alpha/10' : 'max-h-0'}`}>
                                        <div className="text-sm font-primary text-alpha/80 leading-relaxed space-y-2 p-5">
                                            <p><span className="text-alpha font-medium">Subcategory:</span> {product.subcategory_name}</p>
                                            <p><span className="text-alpha font-medium">Category:</span> {product.category_name}</p>
                                            {product.brand_name && <p><span className="text-alpha font-medium">Brand:</span> {product.brand_name}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* Frequently Bought Together */}
            {isHydrated && product.frequently_bought_together && product.frequently_bought_together.length > 0 && (
                <section className="py-8 md:py-16 mb-4 max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 bg-creme">
                    <FrequentlyBoughtTogether 
                        mainProduct={product} 
                        mainVariant={selectedVariant} 
                        relatedProducts={product.frequently_bought_together} 
                    />
                </section>
            )}

            {/* Reviews Section */}
            <section id="reviews-section" className="py-12 md:py-16 bg-white border-t border-alpha/10">
                <div className="max-w-[1200px] mx-auto px-4 md:px-8">
                    <div className="text-center mb-8 md:mb-10">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-secondary text-alpha tracking-tight mb-2">
                            Customer Reviews
                        </h2>
                        <p className="text-alpha/60 font-primary text-xs md:text-sm">
                            See what our customers are saying
                        </p>
                    </div>
                    <ProductReviews productId={product.id} />
                </div>
            </section>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section className="py-12 md:py-24 border-t border-alpha/10">
                    <div className="max-w-[1920px] mx-auto px-4 md:px-8">
                        <div className="text-center mb-8 md:mb-16">
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-secondary text-alpha tracking-tight">
                                You May Also Like
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-[3px] md:gap-1 lg:gap-1">
                            {relatedProducts.map(p => {
                                const mainImage = p.images && p.images.length > 0 ? p.images[0].url : '/placeholder-product.jpg';
                                const relBadges = [
                                    ...(p.is_bestseller ? [{ label: "Bestseller", variant: "gold" as const }] : []),
                                    ...(p.is_hot_selling ? [{ label: "Hot", variant: "sale" as const }] : []),
                                    ...(!p.is_in_stock ? [{ label: "Out of Stock", variant: "limited" as const }] : []),
                                ];
                                return (
                                    <ProductCard key={p.id} href={`/product/${p.slug}`}>
                                        <ProductCardImageContainer>
                                            {relBadges.length > 0 && <ProductCardBadgeGroup badges={relBadges} />}
                                            <ProductCardImage src={mainImage} alt={p.name} />
                                            <ProductCardWishlist product={p} />
                                        </ProductCardImageContainer>
                                        
                                        <div className="flex flex-col items-start px-1.5 md:px-2 py-2 md:py-3">
                                            <ProductCardTitle>{p.name}</ProductCardTitle>
                                            <ProductCardDescription>{p.description}</ProductCardDescription>
                                            <ProductCardMeta collection={p.category_name} category={p.subcategory_name} />
                                            <ProductCardRating rating={p.average_rating || 0} reviewCount={p.review_count || 0} />
                                            <div className="flex items-center justify-between w-full mt-2">
                                                <div className="flex items-center gap-2">
                                                    {!p.is_in_stock && (
                                                        <span className="text-xs text-red-600 font-primary">Out of Stock</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </ProductCard>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Sticky Mobile Action Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-alpha/10 shadow-2xl z-50 safe-area-bottom">
                <div className="px-3 py-3 flex items-center gap-2">

                    {/* Wishlist icon */}
                    <button
                        onClick={handleToggleWishlist}
                        className={`flex-shrink-0 w-11 h-11 border-2 rounded-lg flex items-center justify-center transition-all ${
                            isProductInWishlist
                                ? 'border-red-500 text-red-600 bg-red-50'
                                : 'border-alpha/20 text-alpha bg-white'
                        }`}
                        disabled={!isHydrated}
                        aria-label={isProductInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        <Heart className={`w-4.5 h-4.5 ${isProductInWishlist ? 'fill-current' : ''}`} />
                    </button>

                    {/* Add to Cart */}
                    <button
                        onClick={handleAddToCart}
                        disabled={!isHydrated || !isInStock || !selectedVariant}
                        className="flex-1 bg-alpha text-creme py-3 px-3 text-[11px] uppercase tracking-wider hover:bg-alpha/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 rounded-lg font-medium"
                    >
                        <ShoppingCart className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{!isHydrated ? 'Loading…' : !selectedVariant ? 'Select' : isInStock ? 'Add to Cart' : 'Out of Stock'}</span>
                    </button>

                    {/* Buy Now */}
                    <button
                        onClick={handleBuyNow}
                        disabled={!isHydrated || !isInStock || !selectedVariant || buyNowLoading}
                        className="flex-1 relative overflow-hidden group bg-gold text-white py-3 px-3 text-[11px] uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 rounded-lg font-medium shadow-md hover:bg-[#8C6A54]"
                    >
                        <span className="pointer-events-none absolute inset-0 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        {buyNowLoading ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                        ) : (
                            <>
                                <Zap className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{isInStock ? 'Buy Now' : 'Out of Stock'}</span>
                            </>
                        )}
                    </button>

                </div>
            </div>

        </div>
    );
}
