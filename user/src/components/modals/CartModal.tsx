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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-alpha/40 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Window */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl max-h-[85vh] bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] border border-alpha/10 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-alpha/5 bg-alpha/5 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[1.2rem] bg-white shadow-sm flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-alpha" />
                </div>
                <div>
                  <h2 className="text-2xl font-secondary text-alpha">Your Cart</h2>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-alpha/50 mt-1">
                    {itemCount} {itemCount === 1 ? "Item" : "Items"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-alpha/50 hover:text-alpha hover:shadow-sm transition-all"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-24 h-24 rounded-[2rem] bg-alpha/5 flex items-center justify-center mb-6">
                  <ShoppingBag className="w-12 h-12 text-alpha/30" />
                </div>
                <h3 className="text-2xl font-secondary text-alpha mb-3">
                  Your cart is empty
                </h3>
                <p className="text-[13px] font-medium text-alpha/60 max-w-[260px] leading-relaxed mb-8">
                  Discover beautiful pieces crafted to last a lifetime.
                </p>
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-2 bg-alpha text-white px-8 py-4 rounded-2xl text-[12px] font-bold uppercase tracking-widest hover:bg-tango hover:shadow-lg transition-all duration-300 group hover:scale-[1.02] active:scale-[0.98]"
                >
                  Browse Collection
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items — Scrollable */}
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
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
                <div className="border-t border-alpha/5 px-8 py-6 bg-alpha/5 flex-shrink-0">
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-alpha/50 block mb-1">Subtotal</span>
                      <p className="text-[11px] font-medium text-alpha/40">Shipping calculated at checkout</p>
                    </div>
                    <span className="text-3xl font-secondary text-alpha">
                      ₹{items.reduce((sum, item) => sum + ((item.variantPrice || Number(item.product.price) || 0) * item.quantity), 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={onClose}
                      className="flex-1 bg-white border border-alpha/10 py-4 rounded-2xl text-[12px] font-bold uppercase tracking-widest text-alpha hover:border-alpha/30 hover:shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Keep Shopping
                    </button>
                    <Link
                      href="/checkout"
                      onClick={onClose}
                      className="flex-[1.5] group bg-alpha text-white text-center py-4 rounded-2xl hover:bg-tango shadow-sm hover:shadow-lg transition-all duration-300 text-[12px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Checkout Now
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
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
