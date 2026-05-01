"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

export default function AboutSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15, delayChildren: 0.2 } 
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  return (
    <section className="bg-creme overflow-hidden border-t border-alpha/[0.05]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-20 md:py-32 lg:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">

          {/* Left — Minimal Image Block */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            {/* Desktop image */}
            <div className="hidden lg:block relative aspect-[3/4] overflow-hidden group">
              <Image
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop"
                alt="Artisan workspace"
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-[1.5s] ease-[cubic-bezier(0.22,1,0.36,1)] scale-100 group-hover:scale-105"
              />
            </div>

            {/* Mobile — compact stats row */}
            <div className="flex lg:hidden justify-center gap-px">
              {[
                { val: "38+", label: "Years" },
                { val: "40+", label: "Artisans" },
                { val: "100%", label: "Handcrafted" },
              ].map((s) => (
                <div key={s.label} className="flex-1 text-center py-6 border border-alpha/[0.06]">
                  <span className="block text-xl font-secondary text-alpha">{s.val}</span>
                  <span className="text-[8px] uppercase tracking-[0.2em] text-alpha/30 font-primary">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Text */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-6 lg:col-start-7"
          >
            <motion.span 
              variants={itemVariants}
              className="text-[10px] font-primary uppercase tracking-[0.3em] text-alpha/30 mb-6 block"
            >
              About Us
            </motion.span>

            <motion.h2 
              variants={itemVariants}
              className="text-3xl md:text-5xl lg:text-[3.5rem] font-secondary text-alpha leading-[1.05] tracking-tight mb-8"
            >
              Crafting{" "}
              <em className="font-light not-italic text-alpha/60">Legacy.</em>
            </motion.h2>

            <motion.p 
              variants={itemVariants}
              className="text-sm text-alpha/45 font-primary leading-[1.9] max-w-md mb-6"
            >
              Since 1985, DravoHome has preserved the art of traditional joinery while exploring organic, contemporary forms. Each piece is a quiet dialogue between material and maker.
            </motion.p>

            <motion.p 
              variants={itemVariants}
              className="text-sm text-alpha/45 font-primary leading-[1.9] max-w-md mb-10"
            >
              We design furniture not for trends, but for lifetimes — pieces that grow more beautiful with age and use.
            </motion.p>

            {/* Stats — desktop */}
            <motion.div 
              variants={itemVariants}
              className="hidden lg:flex items-center gap-10 mb-10 pb-10 border-b border-alpha/[0.06]"
            >
              {[
                { val: "1985", label: "Established" },
                { val: "40+", label: "Artisans" },
                { val: "25", label: "Countries" },
              ].map((s) => (
                <div key={s.label}>
                  <span className="block text-2xl font-secondary text-alpha">{s.val}</span>
                  <span className="text-[8px] uppercase tracking-[0.2em] text-alpha/30 font-primary">{s.label}</span>
                </div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link
                href="/about"
                className="group inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-primary text-alpha/50 hover:text-alpha transition-colors duration-500"
              >
                Our Story
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
