"use client";

import { useEffect, useState } from "react";

interface MarqueeOffer {
  id: number;
  name: string;
  description: string;
  discount_percentage: string;
  image_url: string;
}

interface PromotionSettings {
  is_marquee_enabled: boolean;
  marquee_speed: number;
  marquee_offers_detail: MarqueeOffer[];
}

const MARQUEE_HEIGHT = 48; // px

export default function OfferMarquee() {
  const [settings, setSettings] = useState<PromotionSettings | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/v1/settings/promotions/`
        );
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch {
        // Silently fail — marquee is optional
      }
    }
    fetchSettings();
  }, []);

  // Drive the CSS variable so Navbar can offset itself
  const isVisible =
    !!settings?.is_marquee_enabled &&
    (settings?.marquee_offers_detail?.length ?? 0) > 0;

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--marquee-height",
      isVisible ? `${MARQUEE_HEIGHT}px` : "0px"
    );
  }, [isVisible]);

  if (!isVisible) return null;

  const offers = settings!.marquee_offers_detail;
  const displayOffers = [...offers, ...offers, ...offers, ...offers];
  const speed = settings!.marquee_speed || 40;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[150] overflow-hidden select-none"
      style={{ height: MARQUEE_HEIGHT, background: "#1a1916" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Fade edges */}
      <div className="absolute left-0 top-0 h-full w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #1a1916, transparent)" }} />
      <div className="absolute right-0 top-0 h-full w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #1a1916, transparent)" }} />

      {/* Brand anchor left */}
      <div className="absolute left-0 top-0 h-full z-20 flex items-center px-5 gap-2"
        style={{ background: "#26251e", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="2.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#c9a96e]">
          Offers
        </span>
      </div>

      {/* Scrolling strip — leave left padding for the brand anchor (~110px) */}
      <div className="absolute inset-y-0 right-0" style={{ left: 110 }}>
        <div
          className="flex items-center h-full whitespace-nowrap"
          style={{
            animation: `marquee-scroll ${speed}s linear infinite`,
            animationPlayState: isPaused ? "paused" : "running",
            willChange: "transform",
          }}
        >
          {displayOffers.map((offer, i) => (
            <span key={`${offer.id}-${i}`} className="inline-flex items-center">
              {/* Badge */}
              <span
                className="inline-flex items-center gap-1.5 mx-6"
              >
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase"
                  style={{
                    background: "linear-gradient(135deg, #c9a96e 0%, #e8c98a 100%)",
                    color: "#1a1916",
                    letterSpacing: "0.12em",
                  }}
                >
                  {parseFloat(offer.discount_percentage)}% OFF
                </span>
                <span className="text-[12px] font-bold tracking-wide text-white/90">
                  {offer.name}
                </span>
                {offer.description && (
                  <span className="text-[11px] text-white/45 hidden lg:inline">
                    — {offer.description.slice(0, 55)}
                  </span>
                )}
              </span>

              {/* Separator */}
              <span className="text-[#c9a96e]/40 text-[10px] mx-2">✦</span>
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
      `}</style>
    </div>
  );
}
