"use client";

import { useCart } from "@/src/contexts/CartContext";
import CartItem from "@/src/components/cart/CartItem";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { items, itemCount, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-creme min-h-screen pt-32 pb-16 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-alpha/5 rounded-full blur-[100px]" />
        
        <div className="max-w-xl mx-auto text-center px-4 relative z-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-12 shadow-sm border border-alpha/5">
            <div className="w-24 h-24 mx-auto bg-alpha/5 rounded-[2rem] flex items-center justify-center mb-8">
              <ShoppingBag className="w-10 h-10 text-alpha/40" />
            </div>
            <h1 className="text-4xl font-secondary text-alpha mb-4">
              Your cart is empty
            </h1>
            <p className="text-[13px] font-medium text-alpha/60 mb-10">
              Start adding some beautiful furniture to your cart!
            </p>
            <Link
              href="/products"
              className="inline-block bg-alpha text-white px-10 py-4 rounded-2xl text-[12px] font-bold uppercase tracking-widest hover:bg-tango hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-creme min-h-screen pt-28 pb-16">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <h1 className="text-4xl md:text-5xl font-secondary text-alpha mb-10 tracking-tight">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-alpha/5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-secondary text-alpha">
                  Cart Items
                </h2>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-tango/40"></span>
                  <span className="text-[11px] uppercase tracking-widest font-bold text-alpha/60">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-transparent">
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
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-alpha/5 sticky top-28">
              <h2 className="text-2xl font-secondary text-alpha mb-8">
                Order Summary
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-[13px] font-medium text-alpha/60 pb-4 border-b border-alpha/5">
                  <span>Total Items:</span>
                  <span className="font-bold text-alpha text-base">{itemCount}</span>
                </div>
                <div className="pt-2">
                  <p className="text-[12px] text-alpha/50 leading-relaxed font-medium bg-alpha/5 p-4 rounded-2xl">
                    <strong className="text-alpha block mb-1">Price Note</strong>
                    Prices will be provided in your personalized quotation via
                    WhatsApp after checkout.
                  </p>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-alpha text-white text-center py-4 rounded-2xl hover:bg-tango hover:shadow-lg transition-all duration-300 font-bold text-[12px] uppercase tracking-widest mb-4 hover:scale-[1.02] active:scale-[0.98]"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/products"
                className="block w-full text-center py-3 text-[11px] font-bold uppercase tracking-widest text-alpha/50 hover:text-alpha transition-colors duration-300"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
