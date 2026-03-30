"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

/* ─── InView hook ─── */
function useInView(threshold = 0.12) {
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

/* ─── Data ─── */
const teamMembers = [
  {
    name: "Alessandro Rossi",
    role: "Founder & Creative Director",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Sofia Chen",
    role: "Head of Design",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Marcus Weber",
    role: "Master Craftsman",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Elena Dubois",
    role: "Sustainability Lead",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=600&auto=format&fit=crop",
  },
];

const milestones = [
  { year: "1985", event: "Founded in Milan, Italy" },
  { year: "1992", event: "First showroom opens in Paris" },
  { year: "2005", event: "Sustainable materials initiative" },
  { year: "2015", event: "Expansion to 25 countries" },
  { year: "2023", event: "Carbon neutral certification" },
];

export default function AboutPageClient() {
  const heroAnim = useInView(0.05);
  const storyAnim = useInView(0.08);
  const statsAnim = useInView(0.15);
  const timelineAnim = useInView(0.08);
  const teamAnim = useInView(0.08);
  const ctaAnim = useInView(0.1);

  return (
    <>
      {/* ═══════════════════════════════════════════════
          HERO — Clean, minimal fullscreen
          ═══════════════════════════════════════════════ */}
      <section ref={heroAnim.ref} className="relative min-h-[50vh] md:min-h-[70vh] lg:min-h-[80vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2600&auto=format&fit=crop"
            alt="CAFCO Showroom"
            fill
            className={`object-cover transition-all duration-[2.5s] ease-[cubic-bezier(0.22,1,0.36,1)] ${heroAnim.visible ? 'scale-100' : 'scale-105'}`}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-alpha/70 via-alpha/30 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 md:px-12 pb-12 md:pb-20">
          <span className={`block text-[10px] font-primary uppercase tracking-[0.3em] text-creme/40 mb-4 transition-all duration-1000 delay-300 ${heroAnim.visible ? 'opacity-100' : 'opacity-0'}`}>
            Since 1985
          </span>
          <h1 className={`text-4xl md:text-6xl lg:text-7xl font-secondary text-creme leading-[1] tracking-tight max-w-2xl transition-all duration-[1.2s] delay-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${heroAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Crafting <em className="font-light not-italic text-creme/70">Legacy,</em>
            <br className="hidden md:block" />{" "}
            One Piece at a Time
          </h1>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          STORY — Asymmetric 2-col
          ═══════════════════════════════════════════════ */}
      <section className="bg-creme">
        <div ref={storyAnim.ref} className="max-w-[1440px] mx-auto px-4 md:px-12 py-20 md:py-32 lg:py-40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6">
            {/* Image */}
            <div className={`lg:col-span-5 transition-all duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] ${storyAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop"
                  alt="CAFCO Workshop"
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-[1.5s] ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
              </div>
            </div>

            {/* Text */}
            <div className={`lg:col-span-6 lg:col-start-7 flex flex-col justify-center transition-all duration-[1.2s] delay-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${storyAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <span className={`text-[10px] font-primary uppercase tracking-[0.3em] text-alpha/30 mb-6 block transition-all duration-1000 delay-500 ${storyAnim.visible ? 'opacity-100' : 'opacity-0'}`}>
                The Beginning
              </span>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-secondary text-alpha leading-[1.1] tracking-tight mb-8">
                A Passion for{" "}
                <em className="font-light not-italic text-alpha/60">Perfection</em>
              </h2>

              <div className="space-y-5 text-sm font-primary text-alpha/45 leading-[1.9] max-w-lg mb-10">
                <p>
                  Founded in 1985 in the heart of Milan, CAFCO began as a small workshop where master craftsmen pursued their passion for creating exceptional furniture.
                </p>
                <p>
                  What started as a dream has grown into an internationally recognized name — yet our commitment to quality remains unchanged. Every piece carries the legacy of traditional techniques refined with contemporary sensibility.
                </p>
              </div>

              <blockquote className="border-l border-alpha/10 pl-5 mb-10">
                <p className="text-base md:text-lg text-alpha/55 font-secondary italic leading-relaxed">
                  &ldquo;Furniture should be a tactile expression of art, bringing silence and beauty to the modern home.&rdquo;
                </p>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          STATS — Clean dark band
          ═══════════════════════════════════════════════ */}
      <section className="bg-alpha">
        <div ref={statsAnim.ref} className="max-w-[1440px] mx-auto px-4 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-creme/[0.06]">
            {[
              { value: "38+", label: "Years" },
              { value: "40+", label: "Artisans" },
              { value: "25", label: "Countries" },
              { value: "100%", label: "Handcrafted" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`text-center py-12 md:py-16 transition-all duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] ${statsAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span className="block text-3xl md:text-4xl lg:text-5xl font-secondary text-creme mb-2">
                  {stat.value}
                </span>
                <span className="text-[8px] md:text-[9px] uppercase tracking-[0.25em] text-creme/25 font-primary">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TIMELINE — Clean vertical line
          ═══════════════════════════════════════════════ */}
      <section className="bg-creme">
        <div ref={timelineAnim.ref} className="max-w-[1440px] mx-auto px-4 md:px-12 py-20 md:py-32 lg:py-40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6">
            {/* Label */}
            <div className={`lg:col-span-4 transition-all duration-[1.2s] ${timelineAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="text-[10px] font-primary uppercase tracking-[0.3em] text-alpha/30 mb-4 block">
                Our Journey
              </span>
              <h2 className="text-3xl md:text-4xl font-secondary text-alpha leading-tight">
                Key <em className="font-light not-italic text-alpha/60">Milestones</em>
              </h2>
            </div>

            {/* Timeline items */}
            <div className="lg:col-span-7 lg:col-start-6">
              {milestones.map((m, i) => (
                <div
                  key={m.year}
                  className={`flex items-baseline gap-6 md:gap-10 py-5 border-b border-alpha/[0.06] last:border-b-0 group transition-all duration-[1s] ease-[cubic-bezier(0.22,1,0.36,1)] ${timelineAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${300 + i * 120}ms` }}
                >
                  <span className="text-xl md:text-2xl font-secondary text-alpha/20 group-hover:text-alpha transition-colors duration-500 flex-shrink-0 w-16 md:w-20">
                    {m.year}
                  </span>
                  <span className="text-sm md:text-base font-primary text-alpha/60 group-hover:text-alpha transition-colors duration-500">
                    {m.event}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TEAM — Minimal portrait grid
          ═══════════════════════════════════════════════ */}
      <section className="bg-creme border-t border-alpha/[0.05]">
        <div ref={teamAnim.ref} className="max-w-[1440px] mx-auto px-4 md:px-12 py-20 md:py-32 lg:py-40">
          <div className={`mb-14 transition-all duration-[1.2s] ${teamAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-[10px] font-primary uppercase tracking-[0.3em] text-alpha/30 mb-4 block">
              The People
            </span>
            <h2 className="text-3xl md:text-4xl font-secondary text-alpha leading-tight">
              Our <em className="font-light not-italic text-alpha/60">Team</em>
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {teamMembers.map((member, i) => (
              <div
                key={member.name}
                className={`group transition-all duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] ${teamAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${200 + i * 100}ms` }}
              >
                <div className="relative aspect-[3/4] overflow-hidden mb-4">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-[1s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                </div>
                <h3 className="text-sm font-secondary text-alpha leading-tight">
                  {member.name}
                </h3>
                <p className="text-[9px] font-primary uppercase tracking-[0.15em] text-alpha/30 mt-1">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CTA — Split layout
          ═══════════════════════════════════════════════ */}
      <section ref={ctaAnim.ref} className="bg-alpha">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Text */}
          <div className={`flex flex-col justify-center px-6 md:px-12 lg:px-16 py-16 md:py-24 transition-all duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] ${ctaAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-[10px] font-primary uppercase tracking-[0.3em] text-creme/25 mb-5 block">
              Visit Us
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-secondary text-creme leading-tight mb-6">
              Experience Our{" "}
              <em className="font-light not-italic text-creme/60">Showroom</em>
            </h2>
            <p className="text-sm text-creme/35 font-primary leading-relaxed mb-10 max-w-md">
              Step into our world. Our design consultants are ready to help you find the perfect pieces for your space.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-creme text-alpha text-[10px] uppercase tracking-[0.2em] font-primary hover:bg-white transition-colors duration-500"
              >
                Book a Visit
                <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/collections/all"
                className="inline-flex items-center justify-center px-7 py-3.5 border border-creme/15 text-creme/60 text-[10px] uppercase tracking-[0.2em] font-primary hover:border-creme/30 hover:text-creme transition-all duration-500"
              >
                View Collections
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className={`relative h-[280px] lg:h-auto overflow-hidden transition-all duration-[1.2s] delay-200 ${ctaAnim.visible ? 'opacity-100' : 'opacity-0'}`}>
            <Image
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop"
              alt="CAFCO Showroom"
              fill
              className="object-cover grayscale hover:grayscale-0 transition-all duration-[1.5s] ease-[cubic-bezier(0.22,1,0.36,1)]"
            />
          </div>
        </div>
      </section>
    </>
  );
}
