"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { ApiClient } from "@/src/lib/api";
import { Tag, ArrowRight, Sparkles, Clock, Percent } from "lucide-react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

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
  applicable_items_display?: string;
  days_left?: number;
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

// ─── Countdown Display ───────────────────────────────────────
const CountdownTimer = ({ endDate }: { endDate: string }) => {
  const { days, hours, minutes, seconds } = useCountdown(endDate);
  const units = [
    { label: "Days", value: days },
    { label: "Hrs", value: hours },
    { label: "Min", value: minutes },
    { label: "Sec", value: seconds },
  ];

  return (
    <div className="flex gap-2">
      {units.map((u) => (
        <div key={u.label} className="flex flex-col items-center">
          <div
            className="w-10 h-10 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-base md:text-2xl font-primary font-bold backdrop-blur-md border border-white/20"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            {String(u.value).padStart(2, "0")}
          </div>
          <span className="text-[8px] md:text-[10px] uppercase tracking-widest mt-1 opacity-60 font-primary">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Floating Orbs ───────────────────────────────────────────
const FloatingOrbs = ({ colors }: { colors: string[] }) => (
  <>
    <div
      className="absolute offers-orb-1 rounded-full blur-[60px] md:blur-[120px] opacity-30 pointer-events-none"
      style={{
        width: "clamp(150px, 30vw, 500px)",
        height: "clamp(150px, 30vw, 500px)",
        background: colors[0],
        top: "-10%",
        right: "-5%",
      }}
    />
    <div
      className="absolute offers-orb-2 rounded-full blur-[50px] md:blur-[100px] opacity-25 pointer-events-none"
      style={{
        width: "clamp(120px, 22vw, 400px)",
        height: "clamp(120px, 22vw, 400px)",
        background: colors[1],
        bottom: "5%",
        left: "-8%",
      }}
    />
    <div
      className="absolute offers-orb-3 rounded-full blur-[40px] md:blur-[80px] opacity-20 pointer-events-none hidden md:block"
      style={{
        width: "clamp(100px, 18vw, 280px)",
        height: "clamp(100px, 18vw, 280px)",
        background: colors[2] || colors[0],
        top: "40%",
        left: "30%",
      }}
    />
  </>
);

// ─── Card Style Definitions ─────────────────────────────────
const CARD_STYLES = [
  {
    gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 70%, #1a1a2e 100%)",
    accentColor: "#e94560",
    orbColors: ["#e94560", "#533483", "#0f3460"],
    badgeBg: "rgba(233, 69, 96, 0.15)",
    badgeBorder: "rgba(233, 69, 96, 0.3)",
    badgeText: "text-[#ff6b81]",
    ctaBg: "bg-gradient-to-r from-[#e94560] to-[#ff6b81]",
    ctaHover: "hover:from-[#ff6b81] hover:to-[#e94560]",
    ctaText: "text-white",
    progressColor: "#e94560",
  },
  {
    gradient: "linear-gradient(135deg, #0a1628 0%, #1b3a4b 30%, #065a60 60%, #0a1628 100%)",
    accentColor: "#00d4aa",
    orbColors: ["#00d4aa", "#00838f", "#4a148c"],
    badgeBg: "rgba(0, 212, 170, 0.12)",
    badgeBorder: "rgba(0, 212, 170, 0.3)",
    badgeText: "text-[#00ffc8]",
    ctaBg: "bg-gradient-to-r from-[#00d4aa] to-[#00838f]",
    ctaHover: "hover:from-[#00ffc8] hover:to-[#00d4aa]",
    ctaText: "text-[#0a1628]",
    progressColor: "#00d4aa",
  },
  {
    gradient: "linear-gradient(135deg, #1c1014 0%, #3d1c28 30%, #6b2040 60%, #1c1014 100%)",
    accentColor: "#ff9f43",
    orbColors: ["#ff9f43", "#ee5a24", "#6b2040"],
    badgeBg: "rgba(255, 159, 67, 0.12)",
    badgeBorder: "rgba(255, 159, 67, 0.3)",
    badgeText: "text-[#ffc078]",
    ctaBg: "bg-gradient-to-r from-[#ff9f43] to-[#ee5a24]",
    ctaHover: "hover:from-[#ffc078] hover:to-[#ff9f43]",
    ctaText: "text-white",
    progressColor: "#ff9f43",
  },
  {
    gradient: "linear-gradient(135deg, #0d0d1a 0%, #1a0a2e 30%, #3d1466 60%, #0d0d1a 100%)",
    accentColor: "#a78bfa",
    orbColors: ["#a78bfa", "#7c3aed", "#2d1b69"],
    badgeBg: "rgba(167, 139, 250, 0.12)",
    badgeBorder: "rgba(167, 139, 250, 0.3)",
    badgeText: "text-[#c4b5fd]",
    ctaBg: "bg-gradient-to-r from-[#a78bfa] to-[#7c3aed]",
    ctaHover: "hover:from-[#c4b5fd] hover:to-[#a78bfa]",
    ctaText: "text-white",
    progressColor: "#a78bfa",
  },
];

// ─── Scroll Progress Bar ─────────────────────────────────────
const ScrollProgressBar = ({ progress, color }: { progress: number; color: string }) => (
  <div className="absolute top-0 left-0 w-full h-[3px] z-30 bg-white/5">
    <motion.div
      className="h-full"
      style={{ width: `${progress * 100}%`, backgroundColor: color }}
      transition={{ duration: 0.1 }}
    />
  </div>
);

// ─── FullScreen Card ─────────────────────────────────────────
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
  const style = CARD_STYLES[index % CARD_STYLES.length];
  const isEven = index % 2 === 0;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Track progress for the bar
  const [progress, setProgress] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setProgress(v));

  const springConfig = { type: "spring" as const, stiffness: 80, damping: 20 };

  // Format discount: remove trailing zeros (25.00 → 25)
  const discountDisplay = parseFloat(offer.discount_percentage).toString();

  return (
    <div
      ref={containerRef}
      className="sticky top-0 w-full min-h-[100svh] flex flex-col md:flex-row overflow-hidden"
      style={{ zIndex: index + 1 }}
    >
      <ScrollProgressBar progress={progress} color={style.progressColor} />

      {/* ── Image Side ────────────────────────────────── */}
      <div
        className={`w-full md:w-1/2 h-[40svh] md:h-[100svh] relative overflow-hidden shrink-0 ${
          !isEven ? "md:order-last" : ""
        }`}
      >
        {offer.image_url ? (
          <Image
            src={offer.image_url}
            alt={offer.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={index === 0}
          />
        ) : (
          <div className="w-full h-full bg-alpha/10" />
        )}

        {/* Gradient overlay blending image into content side */}
        <div
          className="absolute inset-0 pointer-events-none hidden md:block"
          style={{
            background: isEven
              ? "linear-gradient(to right, transparent 50%, rgba(0,0,0,0.7) 100%)"
              : "linear-gradient(to left, transparent 50%, rgba(0,0,0,0.7) 100%)",
          }}
        />
        {/* Mobile bottom fade */}
        <div className="absolute inset-0 md:hidden pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/70" />

        {/* Discount Badge on Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ ...springConfig, delay: 0.2 }}
          className="absolute top-4 left-4 md:top-8 md:left-8 z-20"
        >
          <div
            className="relative flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-2xl backdrop-blur-xl border"
            style={{
              background: style.badgeBg,
              borderColor: style.badgeBorder,
            }}
          >
            <Percent className="w-3 h-3 md:w-3.5 md:h-3.5" style={{ color: style.accentColor }} />
            <span className={`text-[10px] md:text-xs font-primary font-bold uppercase tracking-wider ${style.badgeText}`}>
              {discountDisplay}% Off
            </span>
            <div
              className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full offers-pulse-ring"
              style={{ backgroundColor: style.accentColor }}
            />
          </div>
        </motion.div>

        {/* Card index indicator */}
        <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 z-20 flex items-center gap-2">
          <span
            className="text-4xl md:text-6xl font-abril opacity-20"
            style={{ color: style.accentColor }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="flex flex-col gap-0.5 md:gap-1">
            {Array.from({ length: totalCards }).map((_, i) => (
              <div
                key={i}
                className="h-0.5 md:h-1 rounded-full transition-all duration-500"
                style={{
                  width: i === index ? "20px" : "6px",
                  backgroundColor: i === index ? style.accentColor : "rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Content Side ──────────────────────────────── */}
      <div
        className="w-full md:w-1/2 flex-1 md:h-[100svh] relative flex flex-col justify-center overflow-hidden offers-gradient-bg"
        style={{ background: style.gradient }}
      >
        <FloatingOrbs colors={style.orbColors} />

        {/* Content container — extra bottom padding on mobile to prevent overlap with nav */}
        <div className="relative z-10 px-5 py-8 md:px-12 lg:px-16 xl:px-20 pb-20 md:pb-8 max-w-xl w-full mx-auto md:mx-0 flex flex-col items-center text-center md:items-start md:text-left">
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...springConfig, delay: 0.1 }}
          >
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-[9px] md:text-xs font-primary uppercase tracking-[0.2em] mb-4 md:mb-8 rounded-full backdrop-blur-xl border ${style.badgeText}`}
              style={{ background: style.badgeBg, borderColor: style.badgeBorder }}
            >
              <Sparkles className="w-3 h-3" />
              {index === 0 ? "Featured Offer" : "Exclusive Deal"}
            </span>
          </motion.div>

          {/* Hero Discount — using Abril Fatface for bold, playful feel */}
          <motion.h3
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...springConfig, delay: 0.2 }}
            className="leading-[0.9] mb-2 md:mb-4 text-white"
          >
            <span
              className="font-abril text-7xl sm:text-8xl md:text-[8rem] lg:text-[10rem] block"
              style={{
                background: `linear-gradient(135deg, #fff 30%, ${style.accentColor} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {discountDisplay}%
            </span>
            <span
              className="font-abril italic text-5xl sm:text-6xl md:text-7xl lg:text-8xl block mt-1"
              style={{ color: style.accentColor }}
            >
              Off
            </span>
          </motion.h3>

          {/* Offer Name */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...springConfig, delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl font-light mb-3 md:mb-5 uppercase tracking-[0.15em] font-primary text-white opacity-90"
          >
            {offer.name}
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...springConfig, delay: 0.35 }}
            className="text-xs md:text-sm leading-relaxed mb-5 md:mb-8 max-w-sm line-clamp-2 md:line-clamp-none font-primary text-white/60"
            style={{ borderLeft: `2px solid ${style.accentColor}`, paddingLeft: "0.75rem" }}
          >
            {offer.description}
          </motion.p>

          {/* Countdown */}
          {offer.end_date && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...springConfig, delay: 0.4 }}
              className="mb-6 md:mb-8 text-white"
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-3 h-3 opacity-50" />
                <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-primary opacity-50">
                  Offer Ends In
                </span>
              </div>
              <CountdownTimer endDate={offer.end_date} />
            </motion.div>
          )}

          {/* CTA Button */}
          <motion.a
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...springConfig, delay: 0.5 }}
            href={`/offers/${offer.id}`}
            className={`inline-flex items-center gap-3 px-6 md:px-10 py-3 md:py-5 text-[10px] md:text-xs font-primary uppercase tracking-[0.2em] font-bold transition-all duration-500 rounded-xl group offers-shimmer-btn ${style.ctaBg} ${style.ctaHover} ${style.ctaText} shadow-lg`}
            style={{ boxShadow: `0 8px 32px ${style.badgeBg}` }}
          >
            <span>Shop Collection</span>
            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 transform group-hover:translate-x-2 transition-transform duration-500" />
          </motion.a>
        </div>
      </div>
    </div>
  );
};

// ─── Section Header ──────────────────────────────────────────
const SectionHeader = () => (
  <div className="pt-20 pb-12 md:pt-32 md:pb-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-gold/40"
          style={{
            top: `${20 + Math.sin(i * 1.5) * 30}%`,
            left: `${15 + i * 13}%`,
            animation: `sparkle ${2 + i * 0.5}s ease-in-out ${i * 0.3}s infinite`,
          }}
        />
      ))}
    </div>

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="inline-flex items-center gap-2 text-[10px] md:text-xs font-primary uppercase tracking-[0.3em] text-gold mb-4 md:mb-6">
        <Sparkles className="w-3.5 h-3.5" />
        Exclusive Benefits
        <Sparkles className="w-3.5 h-3.5" />
      </span>
      <h2 className="text-5xl md:text-6xl lg:text-7xl font-secondary tracking-tight leading-none mb-3 md:mb-6">
        <span className="offers-gradient-text">Special</span>{" "}
        <i className="text-gold">Offers</i>
      </h2>
      <p className="text-xs md:text-sm font-primary text-alpha/50 max-w-md mx-auto leading-relaxed">
        Curated deals on premium collections — crafted just for you
      </p>
      <motion.div
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-px h-10 md:h-12 bg-gradient-to-b from-gold/50 to-transparent mx-auto mt-6 md:mt-12 origin-top"
      />
    </motion.div>
  </div>
);

// ─── Empty State ─────────────────────────────────────────────
const EmptyState = () => (
  <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
    <div className="text-center py-24 md:py-32 bg-white max-w-3xl mx-auto rounded-2xl border border-alpha/10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-gold/10 transition-colors duration-700" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-copper/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />

      <div className="relative z-10 flex flex-col items-center px-6">
        <div className="w-20 h-20 md:w-24 md:h-24 mb-6 md:mb-8 rounded-2xl border border-alpha/10 flex items-center justify-center bg-creme">
          <Tag className="w-7 h-7 md:w-8 md:h-8 text-alpha/30" />
        </div>
        <h3 className="text-3xl md:text-4xl font-secondary text-alpha mb-3 md:mb-4">
          Curating New Offers
        </h3>
        <p className="text-alpha/60 mb-8 md:mb-10 text-xs md:text-sm font-primary max-w-sm leading-relaxed">
          We&apos;re currently preparing exclusive deals on our premium collections. Check back soon.
        </p>
        <a
          href="/products"
          className="inline-flex items-center gap-3 px-8 py-3.5 md:px-10 md:py-4 bg-alpha text-creme text-[10px] md:text-xs font-primary uppercase tracking-[0.2em] hover:bg-gold transition-all duration-500 rounded-xl offers-shimmer-btn"
        >
          Explore Collections
          <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
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
      <section className="bg-creme">
        <div className="pt-20 pb-12 md:pt-32 md:pb-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-28 h-3 mx-auto bg-alpha/10 rounded-full animate-pulse mb-4" />
          <div className="h-12 md:h-16 w-56 md:w-96 bg-alpha/10 mx-auto rounded-full animate-pulse" />
        </div>
        <div className="w-full h-[100svh] flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 h-[40svh] md:h-[100svh] bg-alpha/5 animate-pulse" />
          <div className="w-full md:w-1/2 flex-1 md:h-[100svh] bg-gradient-to-br from-alpha/5 to-alpha/10 animate-pulse" />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-creme">
      <SectionHeader />

      {offers.length === 0 ? (
        <EmptyState />
      ) : (
        <div id="homepage-offers-section" className="relative w-full">
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
        <div className="py-20 md:py-40 text-center bg-creme relative z-20">
          <motion.a
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            href="/offers"
            className="inline-flex items-center gap-4 px-10 md:px-12 py-4 md:py-5 text-[10px] md:text-xs font-primary uppercase tracking-[0.2em] text-alpha group relative"
          >
            <span className="relative z-10">Discover All Offers</span>
            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 relative z-10 transform group-hover:translate-x-2 transition-transform duration-500" />
            <span className="absolute bottom-3 left-10 right-10 md:left-12 md:right-12 h-px bg-alpha/30 group-hover:bg-gold transition-colors duration-500" />
          </motion.a>
        </div>
      )}
    </section>
  );
}
