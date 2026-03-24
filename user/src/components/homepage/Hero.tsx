"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-alpha">
      {/* Background Layer - Smooth Scale Entrance */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full animate-[scale_1.5s_ease-out_forwards]">
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
      </div>

      {/* Content Layer - Centered & Minimal */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center items-center text-center px-6">
        
        {/* Main Headline - High visual impact, no clutter */}
        <h1 className="flex flex-col items-center text-creme font-secondary mix-blend-overlay">
          <span className="block text-[4rem] md:text-[9rem] leading-[0.85] tracking-tighter opacity-0 animate-[slide-up_1s_cubic-bezier(0.2,0.8,0.2,1)_0.2s_forwards]">
            MODERN
          </span>
          <span className="block text-[4rem] md:text-[9rem] leading-[0.85] font-serif italic font-light tracking-tight opacity-0 animate-[slide-up_1s_cubic-bezier(0.2,0.8,0.2,1)_0.4s_forwards]">
            SILENCE
          </span>
        </h1>

        {/* Minimal Subheader */}
        <p className="mt-8 text-creme/90 text-xs md:text-sm uppercase tracking-[0.3em] font-medium opacity-0 animate-[fade-in_1s_ease-out_0.8s_forwards] max-w-xs md:max-w-md">
            The 2025 Winter Collection
        </p>

        {/* Minimal CTA - Line button */}
        <div className="mt-12 opacity-0 animate-[fade-in_1s_ease-out_1.0s_forwards]">
          <a 
            href="/collections/all" 
            className="group relative inline-flex items-center gap-2 text-creme text-sm font-bold uppercase tracking-widest pb-2 overflow-hidden"
          >
            <span className="relative z-10 transition-transform duration-500 group-hover:-translate-y-[110%]">Explore Now</span>
            <span className="absolute top-0 left-0 z-10 transition-transform duration-500 translate-y-[110%] group-hover:translate-y-0 text-white mix-blend-difference">Explore Now</span>
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-creme/50 transform origin-left transition-transform duration-500 ease-out group-hover:scale-x-0"></span>
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-creme transform origin-right scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"></span>
          </a>
        </div>

      </div>

      {/* Subtle Scroll Hint */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 opacity-0 animate-[fade-in_1s_ease-out_1.5s_forwards]">
        <div className="w-[1px] h-16 bg-gradient-to-b from-creme/0 via-creme/50 to-creme/0 animate-pulse"></div>
      </div>
    </section>
  );
}
