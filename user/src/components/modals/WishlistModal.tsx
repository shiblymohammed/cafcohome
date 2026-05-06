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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-alpha/40 backdrop-blur-md animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Window */}
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] border border-alpha/10 overflow-hidden flex flex-col animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-alpha/5 bg-alpha/5 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[1.2rem] bg-white shadow-sm flex items-center justify-center">
              <Heart className="w-6 h-6 text-tango" />
            </div>
            <div>
              <h2 className="text-2xl font-secondary text-alpha">My Wishlist</h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-alpha/50 mt-1">
                {itemCount} {itemCount === 1 ? "Item" : "Items"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-alpha/50 hover:text-alpha hover:shadow-sm transition-all"
            aria-label="Close wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 rounded-[2rem] bg-alpha/5 flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-alpha/30" />
            </div>
            <h3 className="text-2xl font-secondary text-alpha mb-3">
              Your wishlist is empty
            </h3>
            <p className="text-[13px] font-medium text-alpha/60 max-w-[260px] leading-relaxed mb-8">
              Start adding products you love to your wishlist!
            </p>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center bg-alpha text-white px-8 py-4 rounded-2xl text-[12px] font-bold uppercase tracking-widest hover:bg-tango hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Wishlist Items - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8 bg-creme/30">
              <div className="grid grid-cols-1 gap-5">
                {items.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col sm:flex-row gap-5 p-5 bg-white rounded-[2rem] shadow-sm border border-alpha/5 group"
                  >
                    {/* Product Image */}
                    <Link
                      href={`/product/${product.slug}`}
                      onClick={onClose}
                      className="flex-shrink-0 w-full sm:w-32 h-32 relative overflow-hidden rounded-2xl bg-alpha/5"
                    >
                      <Image
                        src={product.images && product.images.length > 0
                          ? product.images[0].url
                          : "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=800&fit=crop"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, 128px"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <Link
                            href={`/product/${product.slug}`}
                            onClick={onClose}
                            className="font-secondary text-lg text-alpha hover:text-tango transition-colors line-clamp-1"
                          >
                            {product.name}
                          </Link>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-alpha/40 mt-1">
                            {product.category_name} {product.subcategory_name && `• ${product.subcategory_name}`}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromWishlist(product.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex-shrink-0"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price Display */}
                      <div className="mt-2 mb-4">
                        {(() => {
                          const selling = Number((product as any).price || (product as any).selling_price || 0);
                          const mrp = Number(product.mrp || 0);
                          const hasOffer = mrp > selling && selling > 0;
                          const discountPct = hasOffer ? Math.round(((mrp - selling) / mrp) * 100) : 0;
                          
                          return (
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${hasOffer ? 'text-tango' : 'text-alpha'}`}>
                                ₹{selling.toLocaleString("en-IN")}
                              </span>
                              {hasOffer && (
                                <>
                                  <span className="text-[13px] font-medium text-alpha/40 line-through">
                                    ₹{mrp.toLocaleString("en-IN")}
                                  </span>
                                  <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-lg">
                                    {discountPct}% OFF
                                  </span>
                                </>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Add to Cart Button */}
                      <div className="mt-auto">
                        <button
                          onClick={() => {
                            handleAddToCart(product);
                            onClose();
                          }}
                          className="w-full sm:w-auto bg-alpha text-white px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-tango shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-alpha/5 px-8 py-6 bg-alpha/5 flex-shrink-0">
              <button
                onClick={onClose}
                className="w-full bg-white border border-alpha/10 py-4 rounded-2xl text-[12px] font-bold uppercase tracking-widest text-alpha hover:border-alpha/30 hover:shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
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
