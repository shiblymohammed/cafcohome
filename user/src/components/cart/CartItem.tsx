"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem as CartItemType } from "@/src/contexts/CartContext";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const { product, quantity } = item;
  const primaryImage = product.images && product.images.length > 0
    ? product.images[0].url
    : "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=800&fit=crop";

  const handleDecrement = () => {
    if (quantity > 1) {
      onUpdateQuantity(product.id, quantity - 1);
    }
  };

  const handleIncrement = () => {
    onUpdateQuantity(product.id, quantity + 1);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    if (!Number.isNaN(value) && value > 0) {
      onUpdateQuantity(product.id, value);
    }
  };

  return (
    <div className="flex gap-4 md:gap-6 py-6 border-b border-alpha/5 last:border-0 group">
      {/* Product Image */}
      <Link
        href={`/product/${product.slug}`}
        className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 relative overflow-hidden rounded-2xl bg-alpha/5"
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 96px, 128px"
        />
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <Link
          href={`/product/${product.slug}`}
          className="font-secondary text-alpha group-hover:text-tango transition-colors duration-300 line-clamp-2 text-lg leading-tight"
        >
          {product.name}
        </Link>

        {/* Price Display */}
        <div className="mt-1 flex items-baseline gap-2 flex-wrap">
          <span className="text-sm font-bold text-alpha">
            ₹{((item.variantPrice || Number(product.price) || 0) * quantity).toLocaleString("en-IN")}
          </span>
          {quantity > 1 && (
            <span className="text-[11px] font-bold tracking-widest uppercase text-alpha/40">
              (₹{(item.variantPrice || Number(product.price) || 0).toLocaleString("en-IN")} each)
            </span>
          )}
          {item.variantMrp && item.variantMrp > (item.variantPrice || 0) && (
            <span className="text-[11px] font-bold text-alpha/30 line-through ml-1">
              ₹{(item.variantMrp * quantity).toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Product Attributes */}
        <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-alpha/40 space-y-1">
          {product.dimensions?.length &&
            product.dimensions?.width &&
            product.dimensions?.height && (
              <p>
                {product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height}{" "}
                {product.dimensions.unit || "cm"}
              </p>
            )}
        </div>

        {/* Quantity Controls */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex items-center bg-alpha/5 rounded-xl border border-transparent hover:border-alpha/10 transition-colors">
            <button
              onClick={handleDecrement}
              className="p-2 text-alpha/60 hover:text-alpha transition"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-10 text-center focus:outline-none bg-transparent font-bold text-xs text-alpha"
              min="1"
            />
            <button
              onClick={handleIncrement}
              className="p-2 text-alpha/60 hover:text-alpha transition"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(product.id)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
            aria-label="Remove item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
