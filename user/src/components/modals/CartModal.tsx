"use client";

import { useEffect } from "react";
import { useCart } from "@/src/contexts/CartContext";
import CartItem from "@/src/components/cart/CartItem";
import Link from "next/link";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FREE_SHIPPING_THRESHOLD = 50000; // ₹50,000 threshold for free shipping

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

  // Calculate estimated total for shipping bar (using item count as proxy since prices are quotation-based)
  const estimatedValue = items.reduce((sum, item) => sum + item.quantity * 10000, 0);
  const shippingProgress = Math.min((estimatedValue / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - estimatedValue;
  const hasReachedFreeShipping = estimatedValue >= FREE_SHIPPING_THRESHOLD;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-alpha/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer Panel — slides in from right */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-creme w-full max-w-md h-full flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-alpha/10">
              <div>
                <h2 className="text-xl font-secondary text-alpha">Your Cart</h2>
                <p className="text-[10px] text-alpha/50 font-primary mt-0.5 uppercase tracking-widest">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-alpha/5 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5 text-alpha" />
              </button>
            </div>

            {/* Free Shipping Progress Bar */}
            {items.length > 0 && (
              <div className="px-6 py-4 border-b border-alpha/[0.07] bg-ivory/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-primary uppercase tracking-widest text-alpha/60">
                    {hasReachedFreeShipping ? (
                      <span className="text-gold font-medium">🎉 You've unlocked Free Shipping!</span>
                    ) : (
                      <>
                        Add{" "}
                        <span className="text-alpha font-medium">
                          ₹{(amountToFreeShipping).toLocaleString("en-IN")}
                        </span>{" "}
                        more for free shipping
                      </>
                    )}
                  </span>
                </div>
                <div className="relative w-full h-[3px] bg-alpha/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${shippingProgress}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    className={`absolute left-0 top-0 h-full ${hasReachedFreeShipping ? "bg-gold" : "bg-alpha"}`}
                  />
                </div>
              </div>
            )}

            {/* Content */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                <ShoppingBag className="w-16 h-16 text-alpha/15 mb-6" />
                <h3 className="text-2xl font-secondary text-alpha mb-2 italic">
                  Your cart is empty
                </h3>
                <p className="text-sm text-alpha/50 font-primary mb-8 leading-relaxed max-w-[220px]">
                  Discover beautiful pieces crafted to last a lifetime.
                </p>
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-2 bg-alpha text-creme px-8 py-3 text-[10px] uppercase tracking-widest hover:bg-alpha/90 transition font-primary group"
                >
                  Browse Collection
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items — Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                  {items.map((item) => (
                    <CartItem
                      key={item.product.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-alpha/10 px-6 py-6 bg-ivory/30">
                  {/* Quotation note */}
                  <p className="text-[10px] text-alpha/40 font-primary leading-relaxed mb-5 border-l-2 border-alpha/10 pl-3">
                    Exact pricing will be shared in your personalised WhatsApp quotation after checkout.
                  </p>

                  <div className="flex flex-col gap-3">
                    <Link
                      href="/checkout"
                      onClick={onClose}
                      className="group w-full bg-alpha text-creme text-center px-6 py-4 hover:bg-tango transition-colors duration-300 font-primary text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      Proceed to Checkout
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <button
                      onClick={onClose}
                      className="w-full border border-alpha/20 text-alpha text-center px-6 py-3 hover:border-alpha transition-colors font-primary text-[10px] uppercase tracking-widest"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
