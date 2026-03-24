"use client";

import { useWishlist } from "@/src/contexts/WishlistContext";
import { useCart } from "@/src/contexts/CartContext";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (product: any) => {
    addItem(product, 1);
  };

  if (items.length === 0) {
    return (
      <div className="bg-creme min-h-screen pt-24 pb-16">
        <div className="max-w-2xl mx-auto text-center px-4">
          <Heart className="w-24 h-24 mx-auto text-alpha/20 mb-8" />
          <h1 className="text-4xl font-secondary text-alpha mb-4">
            Your Wishlist is Empty
          </h1>
          <p className="text-alpha/60 font-primary mb-10">
            Start adding products you love to your wishlist!
          </p>
          <Link
            href="/collections"
            className="inline-block bg-alpha text-creme px-8 py-4 text-xs uppercase tracking-widest hover:bg-alpha/90 transition font-primary"
          >
            Browse Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-creme min-h-screen pt-24 pb-16">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-secondary text-alpha">My Wishlist</h1>
            <p className="text-alpha/60 font-primary mt-3">{items.length} items</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-red-600 hover:text-red-700 flex items-center gap-2 text-xs uppercase tracking-wider font-primary"
            >
              <Trash2 className="w-5 h-5" />
              Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((product) => (
            <div
              key={product.id}
              className="bg-ivory/30 overflow-hidden hover:shadow-lg transition group"
            >
              <Link href={`/product/${product.slug}`} className="block relative">
                <div className="relative h-80 bg-ivory">
                  <Image
                    src={product.images && product.images.length > 0 
                      ? product.images[0].url 
                      : "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=800&fit=crop"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
              </Link>

              <div className="p-5">
                <Link href={`/product/${product.slug}`}>
                  <h3 className="font-secondary text-alpha mb-2 line-clamp-2 hover:text-alpha/70 text-lg">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-xs text-alpha/60 font-primary mb-4">
                  {product.category_name} • {product.subcategory_name}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-alpha text-creme px-4 py-3 hover:bg-alpha/90 transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-primary"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="bg-red-50 text-red-600 px-4 py-3 hover:bg-red-100 transition"
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
    </div>
  );
}
