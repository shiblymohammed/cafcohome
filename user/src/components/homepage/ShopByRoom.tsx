"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
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
  const [activeCategory, setActiveCategory] = useState("All");
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

  // Get unique categories for sub-tabs
  const categories = useMemo(() => {
    const cats = new Set<string>();
    activeProducts.forEach((p: any) => {
      if (p.category_name) cats.add(p.category_name);
    });
    return ["All", ...Array.from(cats)];
  }, [activeProducts]);

  // Reset sub-tab when main tab changes
  useEffect(() => {
    setActiveCategory("All");
  }, [activeTab]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return activeProducts;
    return activeProducts.filter((p: any) => p.category_name === activeCategory);
  }, [activeProducts, activeCategory]);

  return (
    <section className="bg-ivory py-10 md:py-20 overflow-hidden border-t border-black/5 relative">
      <div className="max-w-[1920px] mx-auto px-4 md:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center text-center mb-6 md:mb-10">
          <span className="text-[10px] md:text-xs font-primary uppercase tracking-[0.2em] md:tracking-[0.3em] text-alpha/50 mb-2 block font-medium">
            Curated Spaces
          </span>
          <h2 className="text-3xl md:text-5xl font-secondary text-alpha">
            Shop By Room
          </h2>
        </div>

        {/* Sticky Tabs Container for Mobile */}
        <div className="sticky top-[60px] md:top-[80px] z-30 bg-ivory/95 backdrop-blur-md pt-3 pb-3 -mx-4 px-4 md:mx-0 md:px-0 md:static md:bg-transparent md:pt-0 md:pb-0 mb-8 border-b border-black/5 md:border-none transition-all duration-300 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] md:shadow-none">
            {/* Main Navigation Tabs - Capsule Style */}
            <div className="flex items-center justify-start md:justify-center gap-2 md:gap-4 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
            {rooms.map((room) => {
                const isActive = activeTab === room.id;
                return (
                <button
                    key={room.id}
                    onClick={() => setActiveTab(room.id)}
                    className={`relative px-5 py-2 md:px-8 md:py-3 rounded-full whitespace-nowrap text-xs md:text-sm font-primary transition-all duration-300 border ${
                        isActive 
                        ? "bg-alpha text-white border-alpha shadow-md shadow-alpha/20" 
                        : "bg-transparent text-alpha/70 border-alpha/10 hover:border-alpha/30 hover:bg-alpha/5"
                    }`}
                >
                    {room.label}
                </button>
                );
            })}
            </div>

            {/* Sub Tabs (Categories) - Capsule Style */}
            <AnimatePresence mode="popLayout">
            {categories.length > 1 && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-start md:justify-center gap-2 mt-3 md:mt-5 overflow-x-auto scrollbar-hide pb-1 md:pb-0"
                >
                {categories.map((cat) => {
                    const isActive = activeCategory === cat;
                    return (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-1.5 md:py-2 rounded-full whitespace-nowrap text-[11px] md:text-[13px] font-primary transition-all duration-300 border ${
                            isActive 
                            ? "bg-alpha/10 text-alpha border-alpha/30 font-medium" 
                            : "bg-transparent text-alpha/50 border-transparent hover:text-alpha hover:bg-alpha/5"
                        }`}
                    >
                        {cat}
                    </button>
                    );
                })}
                </motion.div>
            )}
            </AnimatePresence>
        </div>

        {/* Product Slider Container */}
        <div className="relative w-full min-h-[350px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${activeCategory}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 pt-2 px-4 -mx-4 md:px-0 md:mx-0"
            >
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p: any) => {
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
                    <div key={p.id} className="flex-shrink-0 w-[240px] md:w-[300px] lg:w-[320px] snap-start cursor-pointer transition-transform duration-300 hover:-translate-y-1">
                      <ProductCard href={`/product/${p.slug}`} hasOffer={hasOffer} className="h-full">
                          <ProductCardImageContainer className="aspect-[4/5] overflow-hidden rounded-2xl">
                              {relBadges.length > 0 && <ProductCardBadgeGroup badges={relBadges} />}
                              <ProductCardImage src={mainImage} alt={p.name} className="object-cover w-full h-full" />
                              <ProductCardWishlist product={p} />
                          </ProductCardImageContainer>
                          
                          <div className="flex flex-col items-start px-2 py-3 md:py-4">
                              <ProductCardTitle className="text-sm md:text-base font-medium text-alpha">{p.name}</ProductCardTitle>
                              <ProductCardDescription className="text-xs md:text-sm text-alpha/60 mt-1 line-clamp-1">{p.description || "Premium Collection"}</ProductCardDescription>
                              <div className="flex items-center justify-between w-full mt-2">
                                  <ProductCardMeta collection={p.brand_name || p.category_name} category={p.subcategory_name} />
                                  <ProductCardRating rating={p.average_rating || 0} reviewCount={p.review_count || 0} />
                              </div>
                              
                              <div className="mt-3 w-full">
                                <ProductCardPrice 
                                  price={p.price || p.selling_price} 
                                  mrp={p.mrp} 
                                  hasOffer={hasOffer} 
                                  offerPercentage={bestOffer?.discount_percentage} 
                                />
                              </div>
                              
                              <div className="flex items-center justify-between w-full mt-2">
                                  <div className="flex items-center gap-2">
                                      {!p.is_in_stock && (
                                          <span className="text-[10px] md:text-xs text-red-600 font-primary bg-red-50 px-2 py-0.5 rounded-full border border-red-100">Out of Stock</span>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </ProductCard>
                    </div>
                  );
                })
              ) : (
                <div className="w-full flex flex-col items-center justify-center py-16 text-alpha/40 font-primary text-sm uppercase tracking-widest text-center">
                  <div className="w-16 h-16 rounded-full bg-alpha/5 flex items-center justify-center mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2h4l4 4v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6l4-4z"></path><path d="M10 2v4h4"></path></svg>
                  </div>
                  No products curated for this section yet.
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
