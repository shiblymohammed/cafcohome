"use client";

import { useCart } from "@/src/contexts/CartContext";
import CartItem from "@/src/components/cart/CartItem";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { items, itemCount, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-creme min-h-screen pt-24 pb-16">
        <div className="max-w-md mx-auto text-center px-4">
          <ShoppingBag className="w-24 h-24 mx-auto text-alpha/20 mb-6" />
          <h1 className="text-3xl font-secondary text-alpha mb-3">
            Your cart is empty
          </h1>
          <p className="text-alpha/60 font-primary mb-8">
            Start adding some beautiful furniture to your cart!
          </p>
          <Link
            href="/products"
            className="inline-block bg-alpha text-creme px-8 py-4 text-xs uppercase tracking-widest hover:bg-alpha/90 transition font-primary"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-creme min-h-screen pt-24 pb-16">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <h1 className="text-4xl md:text-5xl font-secondary text-alpha mb-12">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-ivory/30 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-secondary text-alpha">
                  Cart Items
                </h2>
                <span className="text-sm text-alpha/60 font-primary">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="divide-y divide-alpha/10">
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
            <div className="bg-ivory/30 p-6 md:p-8 sticky top-24">
              <h2 className="text-xl font-secondary text-alpha mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-alpha/60 font-primary text-sm">
                  <span>Total Items:</span>
                  <span className="font-medium text-alpha">{itemCount}</span>
                </div>
                <div className="border-t border-alpha/10 pt-4">
                  <p className="text-xs text-alpha/60 font-primary leading-relaxed">
                    Prices will be provided in your personalized quotation via
                    WhatsApp after checkout.
                  </p>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-alpha text-creme text-center px-6 py-4 hover:bg-alpha/90 transition font-primary text-xs uppercase tracking-widest mb-4"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/products"
                className="block w-full text-center text-alpha/60 hover:text-alpha transition font-primary text-xs uppercase tracking-widest"
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
