"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export default function AboutSection() {
  const section = useInView(0.1);
  const image = useInView(0.08);
  const text = useInView(0.1);

  return (
    <section className="bg-creme overflow-hidden border-t border-alpha/[0.05]">
      <div
        ref={section.ref}
        className="max-w-[1440px] mx-auto px-4 md:px-12 py-20 md:py-32 lg:py-40"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">

          {/* Left — Minimal Image Block */}
          <div
            ref={image.ref}
            className={`lg:col-span-5 transition-all duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] ${image.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            {/* Desktop image */}
            <div className="hidden lg:block relative aspect-[3/4] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop"
                alt="Artisan workspace"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-[1.5s] ease-[cubic-bezier(0.22,1,0.36,1)]"
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
          </div>

          {/* Right — Text */}
          <div
            ref={text.ref}
            className={`lg:col-span-6 lg:col-start-7 transition-all duration-[1.2s] delay-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${text.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <span className={`text-[10px] font-primary uppercase tracking-[0.3em] text-alpha/30 mb-6 block transition-all duration-1000 delay-400 ${text.visible ? 'opacity-100' : 'opacity-0'}`}>
              About Us
            </span>

            <h2 className="text-3xl md:text-5xl lg:text-[3.5rem] font-secondary text-alpha leading-[1.05] tracking-tight mb-8">
              Crafting{" "}
              <em className="font-light not-italic text-alpha/60">Legacy.</em>
            </h2>

            <p className="text-sm text-alpha/45 font-primary leading-[1.9] max-w-md mb-6">
              Since 1985, CAFCO has preserved the art of traditional joinery while exploring organic, contemporary forms. Each piece is a quiet dialogue between material and maker.
            </p>

            <p className="text-sm text-alpha/45 font-primary leading-[1.9] max-w-md mb-10">
              We design furniture not for trends, but for lifetimes — pieces that grow more beautiful with age and use.
            </p>

            {/* Stats — desktop */}
            <div className="hidden lg:flex items-center gap-10 mb-10 pb-10 border-b border-alpha/[0.06]">
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
            </div>

            <Link
              href="/about"
              className="group inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-primary text-alpha/50 hover:text-alpha transition-colors duration-500"
            >
              Our Story
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
