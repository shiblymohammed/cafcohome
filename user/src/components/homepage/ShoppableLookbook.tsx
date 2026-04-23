"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";

const scenes = [
  {
    id: 1,
    label: "Scene I",
    title: "The Living Room",
    description: "A balance of comfort and restraint — organic textures anchored by architectural forms.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000",
    hotspots: [
      {
        id: "h1",
        x: 42,
        y: 55,
        product: {
          name: "The Cloud Sofa",
          price: "₹2,49,000",
          category: "Seating",
          slug: "cloud-sofa",
          image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=400",
        },
      },
      {
        id: "h2",
        x: 72,
        y: 38,
        product: {
          name: "Arc Floor Lamp",
          price: "₹34,900",
          category: "Lighting",
          slug: "arc-floor-lamp",
          image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=400",
        },
      },
      {
        id: "h3",
        x: 22,
        y: 78,
        product: {
          name: "Geometric Wool Rug",
          price: "₹59,900",
          category: "Rugs & Textiles",
          slug: "geometric-wool-rug",
          image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=400",
        },
      },
    ],
  },
  {
    id: 2,
    label: "Scene II",
    title: "The Bedroom",
    description: "A sanctuary defined by stillness. Every element chosen with restraint, every surface with intent.",
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=2000",
    hotspots: [
      {
        id: "h4",
        x: 50,
        y: 45,
        product: {
          name: "Linen Platform Bed",
          price: "₹1,89,000",
          category: "Beds",
          slug: "linen-platform-bed",
          image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80&w=400",
        },
      },
      {
        id: "h5",
        x: 80,
        y: 55,
        product: {
          name: "Marble Side Table",
          price: "₹42,500",
          category: "Tables",
          slug: "marble-side-table",
          image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=400",
        },
      },
    ],
  },
  {
    id: 3,
    label: "Scene III",
    title: "The Dining Room",
    description: "Where rituals become architecture. A table is not furniture — it is the centre of a home's gravity.",
    image: "https://images.unsplash.com/photo-1615966998516-79a7e9a5a9ec?q=80&w=2000",
    hotspots: [
      {
        id: "h6",
        x: 48,
        y: 60,
        product: {
          name: "Travertine Dining Table",
          price: "₹3,20,000",
          category: "Tables",
          slug: "travertine-dining-table",
          image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=400",
        },
      },
      {
        id: "h7",
        x: 25,
        y: 50,
        product: {
          name: "Windsor Oak Chair",
          price: "₹28,000",
          category: "Seating",
          slug: "windsor-oak-chair",
          image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=400",
        },
      },
    ],
  },
];

export default function ShoppableLookbook() {
  const [activeScene, setActiveScene] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const scene = scenes[activeScene];

  return (
    <section
      className="relative w-full min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1a1917 0%, #252220 45%, #1e1b18 100%)" }}
    >
      {/* Warm grain texture overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
        }}
      />

      {/* Top warm gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#9C825C]/40 to-transparent z-10" />

      <div className="relative z-10 flex flex-col h-full min-h-screen">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-start justify-between px-8 md:px-16 lg:px-20 pt-16 pb-10">
          <div>
            <span className="block text-[10px] font-primary uppercase tracking-[0.4em] text-[#9C825C] mb-3">
              Interior Inspiration
            </span>
            <h2 className="font-secondary text-3xl md:text-5xl text-creme leading-tight">
              Get the Look
            </h2>
            <p className="mt-3 text-sm font-primary text-creme/35 max-w-xs leading-relaxed hidden md:block">
              Tap the <span className="text-[#9C825C]">+</span> markers to discover every piece in these expertly styled spaces.
            </p>
          </div>

          {/* Scene switcher pills */}
          <div className="flex flex-col gap-2 items-end pt-1">
            {scenes.map((s, i) => (
              <button
                key={s.id}
                onClick={() => { setActiveScene(i); setActiveHotspot(null); }}
                className="flex items-center gap-3 group cursor-pointer"
              >
                <span className={`text-[10px] font-primary uppercase tracking-widest transition-colors duration-300 ${i === activeScene ? "text-creme" : "text-creme/25 group-hover:text-creme/50"}`}>
                  {s.label}
                </span>
                <span className={`block w-8 h-[1px] transition-all duration-500 ${i === activeScene ? "bg-[#9C825C] w-12" : "bg-creme/20 group-hover:bg-creme/40"}`} />
              </button>
            ))}
          </div>
        </div>

        {/* ── Main Split Layout ───────────────────────────── */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 px-8 md:px-16 lg:px-20 pb-12">

          {/* Left: Image with Hotspots */}
          <div className="relative w-full lg:w-[65%] aspect-[4/3] lg:aspect-auto overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`scene-${activeScene}`}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={scene.image}
                  alt={scene.title}
                  fill
                  sizes="(max-width:1024px) 100vw, 65vw"
                  quality={90}
                  className="object-cover"
                  priority={activeScene === 0}
                />
                {/* Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1917]/60 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1a1917]/30 via-transparent to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* Hotspots */}
            {scene.hotspots.map((spot) => (
              <div
                key={spot.id}
                className="absolute z-20"
                style={{
                  left: `${spot.x}%`,
                  top: `${spot.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Dot button */}
                <button
                  onClick={() => setActiveHotspot(activeHotspot === spot.id ? null : spot.id)}
                  className={`relative flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-300 cursor-pointer ${
                    activeHotspot === spot.id
                      ? "bg-[#9C825C] border-[#9C825C] scale-110"
                      : "bg-[#1a1917]/60 border-creme/40 hover:bg-[#9C825C]/80 hover:border-[#9C825C] hover:scale-110 backdrop-blur-sm"
                  }`}
                  aria-label={`View ${spot.product.name}`}
                >
                  <motion.div animate={{ rotate: activeHotspot === spot.id ? 45 : 0 }} transition={{ duration: 0.25 }}>
                    <Plus className="w-4 h-4 text-creme" />
                  </motion.div>
                  {activeHotspot !== spot.id && (
                    <span className="absolute w-full h-full rounded-full border border-[#9C825C]/50 animate-ping" />
                  )}
                </button>

                {/* Product Tooltip */}
                <AnimatePresence>
                  {activeHotspot === spot.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.22 }}
                      className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 w-56 z-30 overflow-hidden"
                      style={{ background: "#1e1b18", border: "1px solid rgba(156,130,92,0.2)" }}
                    >
                      <div className="relative w-full aspect-square">
                        <Image src={spot.product.image} alt={spot.product.name} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1917]/60 to-transparent" />
                      </div>
                      <div className="p-4">
                        <span className="text-[9px] font-primary uppercase tracking-[0.2em] text-[#9C825C] block mb-1">
                          {spot.product.category}
                        </span>
                        <h4 className="font-secondary text-creme text-base leading-tight mb-1">{spot.product.name}</h4>
                        <p className="text-creme/50 text-xs font-primary mb-4">{spot.product.price}</p>
                        <Link
                          href={`/product/${spot.product.slug}`}
                          className="flex items-center justify-between text-[10px] font-primary uppercase tracking-widest text-creme/70 hover:text-creme border-t border-creme/10 pt-3 transition-colors group"
                        >
                          View Item
                          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Bottom-left scene label */}
            <div className="absolute bottom-6 left-6 z-20">
              <span className="text-[10px] font-primary uppercase tracking-[0.35em] text-creme/30">
                {scene.label}
              </span>
            </div>
          </div>

          {/* Right: Scene Info Panel */}
          <div className="w-full lg:w-[35%] flex flex-col justify-between border-l border-creme/[0.07] lg:pl-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={`info-${activeScene}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col h-full"
              >
                {/* Title */}
                <div className="flex-1">
                  <div className="mt-0 lg:mt-4 mb-8">
                    <h3 className="font-secondary text-creme text-2xl md:text-4xl lg:text-5xl leading-[1.05] tracking-tight mb-6">
                      {scene.title}
                    </h3>
                    <p className="text-creme/40 font-primary text-sm leading-[1.9] max-w-sm">
                      {scene.description}
                    </p>
                  </div>

                  {/* Product list from hotspots */}
                  <div className="space-y-0 border-t border-creme/[0.07]">
                    {scene.hotspots.map((spot, idx) => (
                      <button
                        key={spot.id}
                        onClick={() => setActiveHotspot(activeHotspot === spot.id ? null : spot.id)}
                        className={`w-full flex items-center justify-between py-5 border-b border-creme/[0.07] group transition-all duration-300 cursor-pointer text-left ${
                          activeHotspot === spot.id ? "pl-2" : "pl-0 hover:pl-2"
                        }`}
                      >
                        <div>
                          <span className="text-[9px] font-primary uppercase tracking-[0.25em] text-[#9C825C] block mb-1">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className={`font-secondary text-lg transition-colors duration-300 ${activeHotspot === spot.id ? "text-[#9C825C]" : "text-creme/60 group-hover:text-creme"}`}>
                            {spot.product.name}
                          </span>
                          <span className="block text-[10px] font-primary text-creme/25 mt-0.5">{spot.product.price}</span>
                        </div>
                        <ArrowUpRight className={`w-4 h-4 shrink-0 transition-all duration-300 ${activeHotspot === spot.id ? "text-[#9C825C] translate-x-0.5 -translate-y-0.5" : "text-creme/20 group-hover:text-creme/50"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* View All CTA */}
                <div className="pt-10">
                  <Link
                    href="/categories"
                    className="group relative inline-flex items-center gap-2 text-creme/60 text-sm font-primary uppercase tracking-widest pb-2 overflow-hidden hover:text-creme transition-colors duration-300"
                  >
                    <span className="relative z-10">Shop This Room</span>
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-creme/20 transform origin-left transition-transform duration-500 ease-out" />
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#9C825C] transform origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100" />
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#9C825C]/30 to-transparent" />
      </div>
    </section>
  );
}
