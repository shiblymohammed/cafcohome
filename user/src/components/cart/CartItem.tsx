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
    <div className="flex gap-4 py-6 border-b border-alpha/10">
      {/* Product Image */}
      <Link
        href={`/product/${product.slug}`}
        className="flex-shrink-0 w-24 h-24 relative overflow-hidden bg-ivory"
      >
        <Image
          src={primaryImage}
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
          className="font-secondary text-alpha hover:text-alpha/70 line-clamp-2 text-lg"
        >
          {product.name}
        </Link>

        {/* Product Attributes */}
        <div className="mt-2 text-xs font-primary text-alpha/60 space-y-1">
          {product.dimensions.length &&
            product.dimensions.width &&
            product.dimensions.height && (
              <p>
                Dimensions: {product.dimensions.length} x{" "}
                {product.dimensions.width} x {product.dimensions.height}{" "}
                {product.dimensions.unit || "cm"}
              </p>
            )}
        </div>

        {/* Quantity Controls */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center border border-alpha/20">
            <button
              onClick={handleDecrement}
              className="p-2 hover:bg-alpha/5 transition"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-12 text-center border-x border-alpha/20 focus:outline-none bg-transparent font-primary text-sm"
              min="1"
            />
            <button
              onClick={handleIncrement}
              className="p-2 hover:bg-alpha/5 transition"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(product.id)}
            className="text-red-600 hover:text-red-700 transition flex items-center gap-1 text-xs uppercase tracking-wider font-primary"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
