"use client";

import { useEffect } from "react";
import { useWishlist } from "@/src/contexts/WishlistContext";
import { useCart } from "@/src/contexts/CartContext";
import Link from "next/link";
import Image from "next/image";
import { X, Heart, ShoppingCart, Trash2 } from "lucide-react";

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WishlistModal({ isOpen, onClose }: WishlistModalProps) {
  const { items, removeFromWishlist, itemCount } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (product: any) => {
    addItem(product, 1);
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-alpha/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-creme w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-alpha/10">
          <div>
            <h2 className="text-2xl md:text-3xl font-secondary text-alpha">My Wishlist</h2>
            <p className="text-xs text-alpha/60 font-primary mt-1">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-alpha/5 rounded-full transition-colors"
            aria-label="Close wishlist"
          >
            <X className="w-5 h-5 text-alpha" />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12">
            <Heart className="w-20 h-20 text-alpha/20 mb-6" />
            <h3 className="text-xl font-secondary text-alpha mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-sm text-alpha/60 font-primary mb-6 text-center">
              Start adding products you love to your wishlist!
            </p>
            <button
              onClick={onClose}
              className="bg-alpha text-creme px-8 py-3 text-xs uppercase tracking-widest hover:bg-alpha/90 transition font-primary"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Wishlist Items - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="grid grid-cols-1 gap-4">
                {items.map((product) => (
                  <div
                    key={product.id}
                    className="flex gap-4 pb-4 border-b border-alpha/10 last:border-0"
                  >
                    {/* Product Image */}
                    <Link
                      href={`/product/${product.slug}`}
                      onClick={onClose}
                      className="flex-shrink-0 w-24 h-24 relative overflow-hidden bg-ivory"
                    >
                      <Image
                        src={product.images && product.images.length > 0
                          ? product.images[0].url
                          : "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=800&fit=crop"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${product.slug}`}
                        onClick={onClose}
                        className="font-secondary text-alpha hover:text-alpha/70 line-clamp-2 text-base"
                      >
                        {product.name}
                      </Link>

                      <p className="text-xs text-alpha/60 font-primary mt-1">
                        {product.category_name} • {product.subcategory_name}
                      </p>

                      {/* Price Display */}
                      {(() => {
                        const selling = Number((product as any).price || (product as any).selling_price || 0);
                        const mrp = Number(product.mrp || 0);
                        const hasOffer = mrp > selling && selling > 0;
                        const discountPct = hasOffer ? Math.round(((mrp - selling) / mrp) * 100) : 0;
                        
                        return (
                          <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
                            <span className={`text-sm font-primary font-bold ${hasOffer ? 'text-gold' : 'text-alpha'}`}>
                              ₹{selling.toLocaleString("en-IN")}
                            </span>
                            {hasOffer && (
                              <>
                                <span className="text-xs font-primary text-alpha/40 line-through">
                                  ₹{mrp.toLocaleString("en-IN")}
                                </span>
                                <span className="text-[10px] font-primary text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-sm">
                                  {discountPct}% OFF
                                </span>
                              </>
                            )}
                          </div>
                        );
                      })()}

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => {
                            handleAddToCart(product);
                            onClose();
                          }}
                          className="flex-1 bg-alpha text-creme px-3 py-2 hover:bg-alpha/90 transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-primary"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Add to Cart
                        </button>
                        <button
                          onClick={() => removeFromWishlist(product.id)}
                          className="bg-red-50 text-red-600 px-3 py-2 hover:bg-red-100 transition"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-alpha/10 p-6 md:p-8 bg-ivory/30">
              <button
                onClick={onClose}
                className="w-full bg-alpha text-creme text-center px-6 py-4 hover:bg-alpha/90 transition font-primary text-xs uppercase tracking-widest"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
