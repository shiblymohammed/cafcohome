"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  
  // Parallax shift downwards as user scrolls down
  const y = useTransform(scrollYProgress, [0, 1], ["0vh", "40vh"]);

  // Framer Motion variants for perfect staggering
  const textContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.25, delayChildren: 0.2 }
    }
  };

  const textItem = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } 
    }
  };

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-[#050505]">
      {/* Background Layer - Smooth Parallax */}
      <motion.div 
        style={{ y }}
        className="absolute -top-[15%] -bottom-[15%] left-0 right-0 z-0 origin-center"
      >
        <div className="relative w-full h-full">
            {/* Desktop Hero Image */}
            <Image 
                src="/herodesktop.jpg" 
                alt="Luxury Furniture Collection" 
                fill
                priority
                quality={90}
                sizes="100vw"
                className="hidden md:block object-cover opacity-90"
            />
            
            {/* Mobile Hero Image */}
            <Image 
                src="/heromobile.jpg" 
                alt="Luxury Furniture Collection" 
                fill
                priority
                quality={90}
                sizes="100vw"
                className="block md:hidden object-cover opacity-90"
            />
            
            {/* Minimal Overlay - Just enough for text contrast */}
            <div className="absolute inset-0 bg-black/20" />
        </div>
      </motion.div>

      {/* Content Layer - Centered & Minimal */}
      <motion.div 
        variants={textContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full h-full flex flex-col justify-center items-center text-center px-6"
      >
        
        {/* Main Headline */}
        <h1 className="flex flex-col items-center text-creme font-secondary mix-blend-overlay">
          <motion.span variants={textItem} className="block text-[4rem] md:text-[9rem] leading-[0.85] tracking-tighter">
            MODERN
          </motion.span>
          <motion.span variants={textItem} className="block text-[4rem] md:text-[9rem] leading-[0.85] font-serif italic font-light tracking-tight">
            SILENCE
          </motion.span>
        </h1>

        {/* Minimal Subheader */}
        <motion.p variants={textItem} className="mt-8 text-creme/90 text-xs md:text-sm uppercase tracking-[0.3em] font-medium max-w-xs md:max-w-md">
            The 2025 Winter Collection
        </motion.p>

        {/* Minimal CTA */}
        <motion.div variants={textItem} className="mt-12">
          <a 
            href="/products" 
            className="group relative inline-flex items-center gap-2 text-creme text-sm font-bold uppercase tracking-widest pb-2 overflow-hidden"
          >
            <span className="relative z-10 transition-transform duration-500 group-hover:-translate-y-[110%]">Explore Now</span>
            <span className="absolute top-0 left-0 z-10 transition-transform duration-500 translate-y-[110%] group-hover:translate-y-0 text-white mix-blend-difference">Explore Now</span>
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-creme/50 transform origin-left transition-transform duration-500 ease-out group-hover:scale-x-0"></span>
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-creme transform origin-right scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"></span>
          </a>
        </motion.div>

      </motion.div>

      {/* Subtle Scroll Hint */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="w-[1px] h-16 bg-gradient-to-b from-creme/0 via-creme/50 to-creme/0 animate-pulse"></div>
      </motion.div>
    </section>
  );
}
