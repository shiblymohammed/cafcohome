"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const stats = [
  { value: "1985", label: "Est." },
  { value: "40+", label: "Artisans" },
  { value: "38+", label: "Years" },
  { value: "100%", label: "Handcrafted" },
];

const processKeywords = [
  "Solid Teak",
  "Hand-Jointed",
  "Natural Oils",
  "Mortise & Tenon",
  "Kiln-Dried",
  "Zero Emissions",
  "Reclaimed Wood",
  "Artisan Carved",
  "Slow Made",
  "Sustainably Sourced",
];

const pillars = [
  {
    index: "01",
    title: "Material Integrity",
    body: "Every piece begins with responsibly sourced solid hardwoods — teak, walnut, and oak — selected for grain character and long-term stability.",
  },
  {
    index: "02",
    title: "Artisan Process",
    body: "Our craftsmen use time-honoured joinery techniques passed across generations. No shortcuts. No particle board. No compromises.",
  },
  {
    index: "03",
    title: "Designed to Last",
    body: "We design against obsolescence. Our furniture is built to be repaired, refinished, and passed on — not replaced.",
  },
];

export default function CraftsmanshipSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax on background image
  const bgY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  // Marquee controlled by scroll
  const marqueeX = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  return (
    <section ref={sectionRef} className="relative w-full bg-alpha overflow-hidden">

      {/* ─── Part 1: Full-bleed parallax image with big statement ─── */}
      <div className="relative w-full h-[80vh] md:h-screen overflow-hidden">

        {/* Parallax image */}
        <motion.div style={{ y: bgY }} className="absolute inset-x-0 w-full h-[130%] -top-[15%]">
          <Image
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=2400"
            alt="Master craftsman at work"
            fill
            sizes="100vw"
            quality={90}
            className="object-cover object-center"
            priority
          />
        </motion.div>

        {/* Layered overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-alpha/70 via-alpha/30 to-alpha" />
        <div className="absolute inset-0 bg-gradient-to-r from-alpha/60 via-transparent to-transparent" />

        {/* Top label */}
        <div className="absolute top-14 left-8 md:left-20 z-10">
          <span className="text-[10px] font-primary uppercase tracking-[0.4em] text-gold/70">
            Our Philosophy
          </span>
        </div>

        {/* Centred headline */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="font-secondary text-creme text-[3rem] md:text-[6rem] lg:text-[8rem] leading-[0.88] tracking-tight"
          >
            Made to<br />
            <em className="font-light not-italic text-creme/50">Last Forever.</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 max-w-xl text-creme/50 font-primary text-sm md:text-base leading-[1.9]"
          >
            Since 1985, CAFCO has believed that great furniture is not manufactured — it is crafted, with patience,
            with skill, and with a deep respect for the material.
          </motion.p>
        </div>

        {/* Stat row — pinned to bottom of this panel */}
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-creme/[0.08]">
          <div className="flex divide-x divide-creme/[0.08]">
            {stats.map((s) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 py-8 md:py-10 px-4 text-center"
              >
                <span className="block font-secondary text-creme text-3xl md:text-5xl mb-1">{s.value}</span>
                <span className="text-[9px] font-primary uppercase tracking-[0.3em] text-creme/30">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Part 2: Scroll-driven marquee ─── */}
      <div className="relative py-10 border-y border-creme/[0.06] overflow-hidden">
        <motion.div
          style={{ x: marqueeX }}
          className="flex gap-12 whitespace-nowrap will-change-transform"
        >
          {/* Duplicate for seamless loop feel */}
          {[...processKeywords, ...processKeywords, ...processKeywords].map((word, i) => (
            <span key={i} className="flex items-center gap-12 flex-shrink-0">
              <span className="font-secondary text-creme/20 text-3xl md:text-5xl italic">{word}</span>
              <span className="w-2 h-2 rounded-full bg-gold/30 flex-shrink-0" />
            </span>
          ))}
        </motion.div>
      </div>

      {/* ─── Part 3: Three Pillars ─── */}
      <div className="px-8 md:px-16 lg:px-20 py-24 md:py-32">
        <div className="max-w-content mx-auto">

          {/* Section intro */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20 md:mb-28">
            <div className="lg:col-span-5">
              <motion.h3
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="font-secondary text-creme text-3xl md:text-5xl leading-[1.05] tracking-tight"
              >
                Craft is not a feature.<br />
                <em className="font-light not-italic text-creme/40">It is the point.</em>
              </motion.h3>
            </div>
            <div className="lg:col-span-5 lg:col-start-8 flex flex-col justify-end">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="text-creme/40 font-primary text-sm leading-[1.9]"
              >
                In a world of mass production and disposable design, we have chosen the opposite path.
                Every CAFCO piece is made by hand, one at a time, by craftsmen who have devoted their
                lives to a single discipline.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8"
              >
                <Link
                  href="/about"
                  className="group relative inline-flex items-center gap-2 text-creme/50 text-xs font-primary uppercase tracking-widest pb-2 overflow-hidden hover:text-creme transition-colors duration-300"
                >
                  Our Full Story
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-creme/20" />
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gold transform origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100" />
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Pillar grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-creme/[0.06]">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="bg-alpha p-10 md:p-12 group hover:bg-charcoal/40 transition-colors duration-500"
              >
                <span className="block text-[10px] font-primary uppercase tracking-[0.35em] text-gold/60 mb-8">
                  {pillar.index}
                </span>
                <h4 className="font-secondary text-creme text-2xl md:text-3xl mb-6 leading-tight">
                  {pillar.title}
                </h4>
                <p className="text-creme/35 font-primary text-sm leading-[1.9] group-hover:text-creme/50 transition-colors duration-500">
                  {pillar.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom separator into next section */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </section>
  );
}
