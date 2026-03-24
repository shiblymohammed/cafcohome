"use client";

import { useEffect } from "react";
import { useCart } from "@/src/contexts/CartContext";
import CartItem from "@/src/components/cart/CartItem";
import Link from "next/link";
import { X, ShoppingBag } from "lucide-react";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, itemCount, updateQuantity, removeItem } = useCart();

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
            <h2 className="text-2xl md:text-3xl font-secondary text-alpha">Shopping Cart</h2>
            <p className="text-xs text-alpha/60 font-primary mt-1">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-alpha/5 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5 text-alpha" />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12">
            <ShoppingBag className="w-20 h-20 text-alpha/20 mb-6" />
            <h3 className="text-xl font-secondary text-alpha mb-2">
              Your cart is empty
            </h3>
            <p className="text-sm text-alpha/60 font-primary mb-6 text-center">
              Start adding some beautiful furniture to your cart!
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
            {/* Cart Items - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem
                    key={item.product.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-alpha/10 p-6 md:p-8 bg-ivory/30">
              <div className="mb-6">
                <div className="flex justify-between text-sm font-primary text-alpha/60 mb-2">
                  <span>Total Items:</span>
                  <span className="font-medium text-alpha">{itemCount}</span>
                </div>
                <p className="text-xs text-alpha/60 font-primary leading-relaxed">
                  Prices will be provided in your personalized quotation via WhatsApp after checkout.
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="flex-1 bg-alpha text-creme text-center px-6 py-4 hover:bg-alpha/90 transition font-primary text-xs uppercase tracking-widest"
                >
                  Proceed to Checkout
                </Link>

                <button
                  onClick={onClose}
                  className="flex-1 border border-alpha/20 text-alpha text-center px-6 py-4 hover:border-alpha transition font-primary text-xs uppercase tracking-widest"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
