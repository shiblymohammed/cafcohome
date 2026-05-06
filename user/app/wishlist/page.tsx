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
      <div className="bg-creme min-h-screen pt-32 pb-16 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-tango/5 rounded-full blur-[100px]" />
        
        <div className="max-w-xl mx-auto text-center px-4 relative z-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-12 shadow-sm border border-alpha/5">
            <div className="w-24 h-24 mx-auto bg-alpha/5 rounded-[2rem] flex items-center justify-center mb-8">
              <Heart className="w-10 h-10 text-alpha/40" />
            </div>
            <h1 className="text-4xl font-secondary text-alpha mb-4">
              Your Wishlist is Empty
            </h1>
            <p className="text-[13px] font-medium text-alpha/60 mb-10">
              Start adding products you love to your wishlist!
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
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-secondary text-alpha tracking-tight">My Wishlist</h1>
            <div className="flex items-center gap-3 mt-4">
              <span className="w-8 h-[1px] bg-tango/40"></span>
              <p className="text-[11px] uppercase tracking-widest font-bold text-alpha/60">{items.length} items saved</p>
            </div>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-5 py-2.5 rounded-xl flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider transition-colors duration-300"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-[2rem] overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-alpha/5 transition-all duration-500 group flex flex-col"
            >
              <Link href={`/product/${product.slug}`} className="block relative p-3 pb-0">
                <div className="relative h-72 md:h-80 bg-alpha/5 rounded-[1.5rem] overflow-hidden">
                  <Image
                    src={product.images && product.images.length > 0 
                      ? product.images[0].url 
                      : "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=800&fit=crop"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
              </Link>

              <div className="p-6 flex-1 flex flex-col">
                <Link href={`/product/${product.slug}`} className="mb-2">
                  <h3 className="font-secondary text-alpha line-clamp-2 group-hover:text-tango transition-colors duration-300 text-lg leading-tight">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-[10px] uppercase tracking-wider font-bold text-alpha/40 mb-6 flex-1">
                  {product.category_name} &bull; {product.subcategory_name}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-alpha text-white py-3 rounded-xl hover:bg-tango hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="w-12 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center hover:scale-[1.02] active:scale-[0.98]"
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
