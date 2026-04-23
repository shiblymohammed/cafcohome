"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { ApiClient } from "../../lib/api/client";

const rooms = [
  { id: "living", label: "Living Room" },
  { id: "bedroom", label: "Bedroom" },
  { id: "dining", label: "Dining" },
  { id: "office", label: "Home Office" },
];

export default function ShopByRoom() {
  const [activeTab, setActiveTab] = useState(rooms[0].id);
  const [apiRooms, setApiRooms] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await ApiClient.getShopByRooms();
        const parsedArray = data?.results ? data.results : (Array.isArray(data) ? data : []);
        setApiRooms(parsedArray);
      } catch (err) {
        console.error("Failed to fetch shop by room data", err);
        setApiRooms([]);
      }
    }
    loadData();
  }, []);

  // Find the exact active profile from the DB for this tab
  const activeProfile = apiRooms.find((r) => r.room_type === activeTab);
  
  // Extract products, formatting to match UI (falling back to empty array if none)
  const activeProducts = activeProfile?.products?.map((p: any) => {
    // Determine image
    let product_image = "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=800&auto=format&fit=crop"; 
    // Fallback if missing
    if (p.images && p.images.length > 0) {
      product_image = p.images[0].url || product_image;
    } else if (p.variants && p.variants.length > 0 && p.variants[0].images && p.variants[0].images.length > 0) {
      product_image = p.variants[0].images[0].url || product_image;
    }

    return {
      id: p.id || p.slug,
      name: p.name,
      subtitle: p.subcategory_name || p.brand_name || "Premium Collection",
      price: typeof p.price === 'number' ? p.price.toLocaleString("en-IN") : p.price,
      image: product_image,
    };
  }) || [];

  return (
    <section className="bg-creme py-20 md:py-32 overflow-hidden border-t border-black/5">
      <div className="max-w-[1920px] mx-auto px-4 md:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <span className="text-[10px] font-primary uppercase tracking-[0.3em] text-alpha/40 mb-3 block">
            Curated Spaces
          </span>
          <h2 className="text-4xl md:text-5xl font-secondary text-alpha">
            Shop By Room
          </h2>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-center gap-6 md:gap-12 mb-16 overflow-x-auto scrollbar-hide pb-2">
          {rooms.map((room) => {
            const isActive = activeTab === room.id;
            return (
              <button
                key={room.id}
                onClick={() => setActiveTab(room.id)}
                className="relative pb-2 whitespace-nowrap group focus:outline-none"
              >
                <span
                  className={`text-sm md:text-base font-primary transition-colors duration-300 ${
                    isActive ? "text-alpha font-medium" : "text-alpha/40 hover:text-alpha/70"
                  }`}
                >
                  {room.label}
                </span>

                {/* Animated active underline matching the image's black line */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-alpha"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Product Slider Container */}
        <div className="relative w-full min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab} // Changing key triggers exit/enter animation when tabs change
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-10 pt-2 px-4 -mx-4 md:px-0 md:mx-0"
            >
              {activeProducts.length > 0 ? (
                activeProducts.map((product: any) => (
                  <div key={product.id} className="flex-shrink-0 w-[280px] md:w-[320px] snap-start group cursor-pointer">
                    
                    {/* Big Rounded Image Card */}
                    <div className="relative bg-[#ebedea] rounded-[2rem] overflow-hidden aspect-[4/5] mb-5">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover mix-blend-multiply transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                      />
                      
                      {/* Floating Add-to-Cart Circle */}
                      <div className="absolute bottom-5 right-5 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out shadow-sm border border-black/5">
                        <ShoppingBag strokeWidth={1.5} className="w-4 h-4 text-alpha" />
                      </div>
                    </div>

                    {/* Info Pill Outline */}
                    <div className="border border-alpha/15 rounded-full px-5 py-3 flex justify-between items-center bg-white/40 backdrop-blur-md group-hover:border-alpha/30 transition-colors duration-500">
                      <div className="flex flex-col">
                        <span className="font-secondary tracking-wide text-sm md:text-base text-alpha max-w-[160px] truncate">
                          {product.name}
                        </span>
                        <span className="font-primary text-[9px] uppercase tracking-wider text-alpha/40 mt-0.5 truncate">
                          {product.subtitle}
                        </span>
                      </div>
                      <div className="font-primary tracking-wide text-alpha font-medium text-sm">
                        {product.price}₹
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full flex items-center justify-center py-20 text-alpha/40 font-primary text-sm uppercase tracking-widest">
                  No products curated for this room yet.
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
