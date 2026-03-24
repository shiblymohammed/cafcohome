"use client";

import Image from "next/image";

export default function AboutSection() {
  return (
    <section className="bg-creme py-16 md:py-32 relative overflow-hidden">
      <div className="max-w-[1920px] mx-auto px-4 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">

          {/* Left - Visual Narrative */}
          <div className="relative order-2 lg:order-1">
            {/* Mobile: Modern decorative element instead of image */}
            <div className="block lg:hidden">
              <div className="relative py-8">
                {/* Decorative accent lines */}
                <div className="flex items-center justify-center gap-6">
                  <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-alpha/30"></div>
                  <div className="w-3 h-3 border border-alpha/20 rotate-45"></div>
                  <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-alpha/30"></div>
                </div>
                
                {/* Stats highlight for mobile */}
                <div className="mt-8 flex justify-center gap-8">
                  <div className="text-center px-6 py-4 border border-alpha/10 rounded-sm">
                    <span className="block text-2xl font-secondary text-alpha">38+</span>
                    <span className="text-[0.6rem] uppercase tracking-widest text-alpha/50">Years</span>
                  </div>
                  <div className="text-center px-6 py-4 border border-alpha/10 rounded-sm">
                    <span className="block text-2xl font-secondary text-alpha">100%</span>
                    <span className="text-[0.6rem] uppercase tracking-widest text-alpha/50">Handcrafted</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop: Original image layout */}
            <div className="hidden lg:block relative aspect-[4/5] overflow-hidden group">
              {/* Main Image */}
              <Image
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2600&auto=format&fit=crop"
                alt="Artisan at work"
                fill
                className="object-cover transition-transform duration-[1.8s] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-alpha/5 group-hover:bg-alpha/0 transition-colors duration-700" />

              {/* Floating Detail Image */}
              <div className="absolute -bottom-10 -right-10 w-2/3 aspect-square border-8 border-creme overflow-hidden parallax-element">
                <Image
                  src="https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=800&auto=format&fit=crop"
                  alt="Wood texture detail"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-700"
                />
              </div>
            </div>
          </div>

          {/* Right - Editorial Content */}
          <div className="order-1 lg:order-2 text-left">
            <div className="animate-slide-up">
              <span className="block text-xs font-primary uppercase tracking-[0.25em] text-alpha/60 mb-2 flex items-center gap-4">
                <span className="w-12 h-[1px] bg-alpha/30"></span>
                The Philosophy
              </span>

              <h2 className="text-4xl md:text-6xl lg:text-7xl font-secondary text-alpha leading-[0.9] tracking-tight mb-10 md:mb-16">
                Crafting <br />
                <span className="italic font-light text-alpha/80">Legacy.</span>
              </h2>

              <blockquote className="text-lg md:text-xl text-alpha/80 font-secondary leading-relaxed mb-8 border-l-2 border-alpha/10 pl-6 italic">
                &ldquo;We believe furniture should be more than functional. It should be a tactile expression of art, bringing silence and beauty to the modern home.&rdquo;
              </blockquote>

              <p className="text-sm font-primary text-alpha/60 leading-loose max-w-md mb-12">
                Founded in 1985, CAFCO has dedicated decades to the preservation of traditional joinery and the exploration of organic forms. Each piece is a dialogue between the raw material and the artisan&apos;s hand, designed to age gracefully alongside generations.
              </p>

              <div className="hidden lg:flex items-center gap-12">
                <div className="flex flex-col">
                  <span className="text-3xl font-secondary">1985</span>
                  <span className="text-[0.6rem] uppercase tracking-widest text-alpha/50 mt-1">Established</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-secondary">40+</span>
                  <span className="text-[0.6rem] uppercase tracking-widest text-alpha/50 mt-1">Artisans</span>
                </div>
              </div>

              <div className="mt-12">
                <a href="/about" className="inline-flex items-center gap-3 text-xs uppercase tracking-widest font-semibold border-b border-alpha pb-1 hover:text-tango hover:border-tango transition-colors duration-300">
                  Read Our Story
                  <span className="transform transition-transform duration-300 group-hover:translate-x-1">→</span>
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
