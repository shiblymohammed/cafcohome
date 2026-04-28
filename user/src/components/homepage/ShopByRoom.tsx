"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ApiClient } from "../../lib/api/client";
import { ProductCard, ProductCardImage, ProductCardImageContainer, ProductCardTitle, ProductCardDescription, ProductCardMeta, ProductCardWishlist, ProductCardBadgeGroup, ProductCardRating, ProductCardPrice } from "@/src/components/ui/ProductCard";

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
  
  const activeProducts = activeProfile?.products || [];

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
                activeProducts.map((p: any) => {
                  const mainImage = p.images && p.images.length > 0 ? p.images[0].url : (p.variants && p.variants.length > 0 && p.variants[0].images && p.variants[0].images.length > 0 ? p.variants[0].images[0].url : 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=800&auto=format&fit=crop');
                  
                  const applicableOffers = p.applicable_offers || [];
                  const bestOffer = applicableOffers.length > 0 ? applicableOffers[0] : null;
                  const hasOffer = !!bestOffer;

                  const relBadges = [
                      ...(bestOffer ? [{ label: `${bestOffer.discount_percentage}% OFF`, variant: "sale" as const }] : []),
                      ...(p.is_bestseller ? [{ label: "Bestseller", variant: "gold" as const }] : []),
                      ...(p.is_hot_selling ? [{ label: "Hot", variant: "sale" as const }] : []),
                      ...(!p.is_in_stock ? [{ label: "Out of Stock", variant: "limited" as const }] : []),
                  ];

                  return (
                    <div key={p.id} className="flex-shrink-0 w-[280px] md:w-[320px] snap-start cursor-pointer">
                      <ProductCard href={`/product/${p.slug}`} hasOffer={hasOffer}>
                          <ProductCardImageContainer>
                              {relBadges.length > 0 && <ProductCardBadgeGroup badges={relBadges} />}
                              <ProductCardImage src={mainImage} alt={p.name} />
                              <ProductCardWishlist product={p} />
                          </ProductCardImageContainer>
                          
                          <div className="flex flex-col items-start px-1.5 md:px-2 py-2 md:py-3">
                              <ProductCardTitle>{p.name}</ProductCardTitle>
                              <ProductCardDescription>{p.description || "Premium Collection"}</ProductCardDescription>
                              <ProductCardMeta collection={p.brand_name || p.category_name} category={p.subcategory_name} />
                              <ProductCardRating rating={p.average_rating || 0} reviewCount={p.review_count || 0} />
                              
                              <ProductCardPrice 
                                price={p.price || p.selling_price} 
                                mrp={p.mrp} 
                                hasOffer={hasOffer} 
                                offerPercentage={bestOffer?.discount_percentage} 
                              />
                              
                              <div className="flex items-center justify-between w-full mt-2">
                                  <div className="flex items-center gap-2">
                                      {!p.is_in_stock && (
                                          <span className="text-xs text-red-600 font-primary">Out of Stock</span>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </ProductCard>
                    </div>
                  );
                })
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
