"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { ApiClient } from "@/src/lib/api";
import { Tag, ArrowRight, Clock, Percent } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

interface Offer {
  id: number;
  name: string;
  description: string;
  image_url: string;
  discount_percentage: string;
  apply_to: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_featured: boolean;
}

// ─── Countdown Hook ──────────────────────────────────────────
function useCountdown(endDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(endDate).getTime();
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  return timeLeft;
}

// ─── Elegant Countdown Display ───────────────────────────────
const CountdownTimer = ({ endDate }: { endDate: string }) => {
  const { days, hours, minutes, seconds } = useCountdown(endDate);
  const units = [
    { label: "Days", value: days },
    { label: "Hrs", value: hours },
    { label: "Min", value: minutes },
    { label: "Sec", value: seconds },
  ];

  return (
    <div className="flex items-center gap-4">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-4">
          <div className="flex flex-col items-center min-w-[32px]">
            <div className="text-2xl md:text-3xl font-light font-secondary text-white tracking-widest">
              {String(u.value).padStart(2, "0")}
            </div>
            <span className="text-[9px] uppercase tracking-widest text-[#ab8956] font-primary mt-1">
              {u.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <div className="text-white/20 text-xl font-light pb-4">:</div>
          )}
        </div>
      ))}
    </div>
  );
};

// ─── FullScreen Cinematic Card ───────────────────────────────
const FullScreenCard = ({
  offer,
  index,
  totalCards,
}: {
  offer: Offer;
  index: number;
  totalCards: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Slow zoom effect as the user scrolls
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const discountDisplay = parseFloat(offer.discount_percentage).toString();

  return (
    <div
      ref={containerRef}
      className="sticky top-0 w-full h-[100svh] overflow-hidden"
      style={{ zIndex: index + 1 }}
    >
      {/* Background Image Layer */}
      <motion.div className="absolute inset-0 w-full h-full" style={{ scale }}>
        {offer.image_url ? (
          <Image
            src={offer.image_url}
            alt={offer.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority={index === 0}
          />
        ) : (
          <div className="w-full h-full bg-[#1c1c1c]" />
        )}
      </motion.div>

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent hidden md:block" />

      {/* Content Container */}
      <div className="absolute inset-0 max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col justify-end pb-12 md:pb-24">
        
        {/* Floating Glass Panel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl w-full md:max-w-md lg:max-w-lg relative overflow-hidden group"
        >
          {/* Subtle noise texture over the glass */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>

          <div className="relative z-10">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] uppercase tracking-widest text-white font-primary">
                {index === 0 ? "Featured" : "Exclusive"}
              </span>
              <span className="px-4 py-1.5 bg-[#ab8956]/20 text-[#ab8956] border border-[#ab8956]/30 rounded-full text-[10px] uppercase tracking-widest font-primary flex items-center gap-1.5">
                <Percent className="w-3 h-3" />
                {discountDisplay}% OFF
              </span>
            </div>

            {/* Title & Description */}
            <h3 className="text-4xl md:text-5xl font-secondary text-white leading-[1.1] mb-4">
              {offer.name}
            </h3>
            
            <p className="text-sm text-white/60 font-primary leading-relaxed mb-8 max-w-sm line-clamp-3">
              {offer.description}
            </p>

            {/* Countdown */}
            {offer.end_date && (
              <div className="mb-8 p-5 bg-black/20 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-3.5 h-3.5 text-[#ab8956]" />
                  <span className="text-[10px] uppercase tracking-widest text-white/50 font-primary">
                    Offer Ends In
                  </span>
                </div>
                <CountdownTimer endDate={offer.end_date} />
              </div>
            )}

            {/* CTA Button Group (Pill style) */}
            <div className="flex items-center gap-3 mt-auto">
              <a
                href={`/offers/${offer.id}`}
                className="flex-1 bg-white hover:bg-gray-100 text-black text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium py-4 rounded-full transition-colors flex items-center justify-center font-primary"
              >
                Explore Offer
              </a>
              <a
                href={`/offers/${offer.id}`}
                className="w-12 h-12 shrink-0 bg-white hover:bg-gray-100 text-black rounded-full flex items-center justify-center transition-transform hover:scale-105"
              >
                <ArrowRight className="w-4 h-4 transform -rotate-45" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Indicators (Dots) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
        {Array.from({ length: totalCards }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 rounded-full transition-all duration-500"
            style={{
              height: i === index ? "32px" : "8px",
              backgroundColor: i === index ? "#ab8956" : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Section Header ──────────────────────────────────────────
const SectionHeader = () => (
  <div className="pt-24 pb-12 md:pt-32 md:pb-24 max-w-[1440px] mx-auto px-6 md:px-12 text-center relative z-20">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="inline-flex items-center gap-2 text-[10px] md:text-xs font-primary uppercase tracking-widest text-[#ab8956] mb-6">
        Curated Collections
      </span>
      <h2 className="text-4xl md:text-6xl lg:text-7xl font-secondary tracking-tight text-[#1c1c1c] mb-6">
        Special Offers
      </h2>
      <p className="text-sm md:text-base font-primary text-[#1c1c1c]/60 max-w-lg mx-auto leading-relaxed">
        Exclusive deals on our most premium materials and architectural pieces, curated specifically for your home.
      </p>
    </motion.div>
  </div>
);

// ─── Empty State ─────────────────────────────────────────────
const EmptyState = () => (
  <div className="max-w-[1440px] mx-auto px-6 md:px-12 pb-32">
    <div className="text-center py-32 bg-white max-w-3xl mx-auto rounded-3xl border border-[#1c1c1c]/5 relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 mb-8 rounded-full border border-[#1c1c1c]/5 flex items-center justify-center bg-[#faf9f6]">
          <Tag className="w-6 h-6 text-[#1c1c1c]/30" />
        </div>
        <h3 className="text-3xl md:text-4xl font-secondary text-[#1c1c1c] mb-4">
          Curating New Offers
        </h3>
        <p className="text-[#1c1c1c]/50 mb-10 text-sm font-primary max-w-sm leading-relaxed">
          We are currently preparing exclusive deals on our premium collections. Please check back soon.
        </p>
        <a
          href="/products"
          className="inline-flex items-center gap-3 px-8 py-4 bg-[#1c1c1c] text-white text-[10px] md:text-xs font-primary uppercase tracking-widest hover:bg-[#ab8956] transition-all duration-500 rounded-full"
        >
          Explore Collections
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  </div>
);

// ─── ★ Main Offers Section ───────────────────────────────────
export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchOffers() {
      try {
        const data = await ApiClient.getOffers();
        const offersArray = Array.isArray(data) ? data : ((data as any)?.results || []);
        const featuredOffers = offersArray.filter((offer: Offer) => offer.is_featured).slice(0, 4);
        setOffers(featuredOffers);
      } catch (error) {
        console.error("Error fetching offers:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOffers();
  }, []);

  if (!mounted || loading) {
    return (
      <section className="bg-[#faf9f6]">
        <div className="pt-24 pb-12 max-w-[1440px] mx-auto px-6 text-center">
          <div className="w-28 h-3 mx-auto bg-black/5 rounded-full animate-pulse mb-6" />
          <div className="h-16 w-64 bg-black/5 mx-auto rounded-full animate-pulse" />
        </div>
        <div className="w-full h-[100svh] bg-black/5 animate-pulse" />
      </section>
    );
  }

  return (
    <section className="bg-[#faf9f6]">
      <SectionHeader />

      {offers.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="relative w-full">
          {offers.map((offer, index) => (
            <FullScreenCard
              key={offer.id}
              offer={offer}
              index={index}
              totalCards={offers.length}
            />
          ))}
        </div>
      )}

      {offers.length > 0 && (
        <div className="py-24 md:py-32 text-center bg-[#faf9f6] relative z-20">
          <motion.a
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            href="/offers"
            className="inline-flex items-center gap-4 px-10 py-5 text-[10px] md:text-xs font-primary uppercase tracking-[0.2em] text-[#1c1c1c] hover:text-[#ab8956] transition-colors"
          >
            <span>Discover All Offers</span>
            <ArrowRight className="w-4 h-4" />
          </motion.a>
        </div>
      )}
    </section>
  );
}
