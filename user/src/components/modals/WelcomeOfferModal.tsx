"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface MarqueeOffer {
  id: number;
  name: string;
  description: string;
  discount_percentage: string;
  image_url: string;
}

interface PromotionSettings {
  is_popup_enabled: boolean;
  popup_strategy: "single" | "cycle_daily" | "cycle_hourly";
  popup_offers_detail: MarqueeOffer[];
}

export default function WelcomeOfferModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [offer, setOffer] = useState<MarqueeOffer | null>(null);

  useEffect(() => {
    // Check if the user has already seen the popup
    const hasSeenPopup = localStorage.getItem("has_seen_welcome_popup");
    if (hasSeenPopup) return;

    async function fetchSettings() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/v1/settings/promotions/`
        );
        if (res.ok) {
          const data: PromotionSettings = await res.json();
          
          if (!data.is_popup_enabled || !data.popup_offers_detail || data.popup_offers_detail.length === 0) {
            return;
          }

          const offers = data.popup_offers_detail;
          let selectedIndex = 0;

          if (data.popup_strategy === "cycle_daily") {
            const now = new Date();
            const start = new Date(now.getFullYear(), 0, 0);
            const diff = now.getTime() - start.getTime();
            const oneDay = 1000 * 60 * 60 * 24;
            const dayOfYear = Math.floor(diff / oneDay);
            selectedIndex = dayOfYear % offers.length;
          } else if (data.popup_strategy === "cycle_hourly") {
            const hourOfDay = new Date().getHours();
            selectedIndex = hourOfDay % offers.length;
          }

          setOffer(offers[selectedIndex]);
          
          // Slight delay before showing the modal to let the page load
          setTimeout(() => {
            setIsOpen(true);
          }, 3000);
        }
      } catch (error) {
        console.error("Failed to fetch promotion settings", error);
      }
    }

    fetchSettings();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("has_seen_welcome_popup", "true");
  };

  if (!isOpen || !offer) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[800px] bg-creme rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row transform transition-all animate-in fade-in zoom-in-95 duration-500">
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-alpha backdrop-blur-md transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 relative h-[300px] md:h-[450px]">
          {offer.image_url ? (
            <Image 
              src={offer.image_url} 
              alt={offer.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full bg-alpha/10 flex items-center justify-center">
              <span className="text-alpha/30 font-primary">No Image Available</span>
            </div>
          )}
          {/* Discount Badge Overlay */}
          <div className="absolute top-6 left-6">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-black tracking-widest uppercase bg-gradient-to-r from-[#c9a96e] to-[#e8c98a] text-alpha shadow-lg">
              {parseFloat(offer.discount_percentage)}% OFF
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-gradient-to-br from-creme to-white">
          <div className="mb-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a96e]">
              Welcome Offer
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-alpha mb-4 leading-tight">
            {offer.name}
          </h2>
          <p className="text-alpha/70 font-primary text-sm md:text-base leading-relaxed mb-8">
            {offer.description || "Don't miss out on this exclusive offer for your first visit. Upgrade your home with premium furniture today."}
          </p>
          
          <div className="mt-auto flex flex-col gap-3">
            <button 
              onClick={handleClose}
              className="w-full py-4 bg-alpha text-creme font-primary font-bold uppercase tracking-wider text-sm hover:bg-alpha/90 transition-colors"
            >
              Shop Now
            </button>
            <button 
              onClick={handleClose}
              className="w-full py-3 text-alpha/50 font-primary text-xs uppercase tracking-wider hover:text-alpha transition-colors"
            >
              No thanks, I&apos;ll pay full price
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
