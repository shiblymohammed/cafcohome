'use client';

import React, { useState } from 'react';
import { ShoppingBag, Star, Info, ChevronRight, Check } from 'lucide-react';

// --- CUSTOM COMPONENTS (Utility) ---

// 1. Floating Title Component
const FloatingTitle = ({ title, sub }: { title: string; sub: string }) => (
  <div className="hidden lg:block fixed top-1/2 left-0 -translate-y-1/2 -rotate-90 origin-top-left z-sticky pointer-events-none">
    <h3 className="font-primary text-caption tracking-wider text-text-muted opacity-85 uppercase whitespace-nowrap">
      {sub}
    </h3>
    <h1 className="font-secondary text-h2 text-alpha whitespace-nowrap pt-2">{title}</h1>
  </div>
);

// 2. Glowing Button
const GlowingButton = ({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`font-primary text-small font-semibold tracking-wide uppercase
      bg-button-primary text-text-inverse px-8 py-4 rounded-button transition-normal
      shadow-card hover:shadow-card-hover transform hover:scale-102
      relative overflow-hidden group
      ${className}`}
  >
    {children}
    <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 transition-normal pointer-events-none"></span>
    <span className="absolute inset-0 border-2 border-transparent group-hover:border-tango rounded-button transition-normal"></span>
  </button>
);

// 3. Floating Action Panel
const FloatingActionPanel = ({
  price,
  onAddToCart,
}: {
  price: string;
  onAddToCart: () => void;
}) => (
  <div
    className="fixed bottom-0 left-0 right-0 z-modal bg-ivory shadow-modal border-t border-border-medium
      lg:static lg:bg-transparent lg:shadow-none lg:border-none lg:p-0"
  >
    <div className="max-w-content mx-auto px-container py-4 lg:py-0 flex justify-between items-center">
      <div className="flex flex-col">
        <p className="text-small text-text-muted">Current Price</p>
        <p className="text-h2 font-secondary text-tango font-bold leading-tight">$ {price}</p>
      </div>
      <GlowingButton onClick={onAddToCart} className="w-full sm:w-auto ml-4">
        <ShoppingBag size={20} className="inline mr-2" />
        Add to Order
      </GlowingButton>
    </div>
  </div>
);


// --- MAIN PRODUCT DETAIL PAGE ---
const ProductDetailPage = () => {
  const [selectedFinish, setSelectedFinish] = useState('walnut');
  const price = selectedFinish === 'walnut' ? '1,250' : '1,190';

  const finishes = [
    { id: 'walnut', name: 'Walnut / Black Leather', color: '#654321', class: 'bg-yellow-800' },
    { id: 'oak', name: 'Oak / Cream Linen', color: '#a0522d', class: 'bg-amber-700' },
    { id: 'ebony', name: 'Ebony / Grey Velvet', color: '#36454F', class: 'bg-slate-700' },
  ];

  const handleAddToCart = () => {
    alert(`Added ${selectedFinish.toUpperCase()} Aura Chair to cart!`);
  };

  return (
    <div className="min-h-screen bg-creme text-alpha overflow-x-hidden">
      {/* 1. ARCHITECTURAL FLOATING TITLE */}
      <FloatingTitle title="Aura Dining Chair" sub="Minimalist Collection / Section 01" />

      {/* 2. MAIN CONTENT AREA */}
      <main className="max-w-content mx-auto pt-16 pb-section-mobile lg:pt-section lg:pb-section px-container">
        {/* BREADCRUMBS & RATING */}
        <div className="flex justify-between items-center mb-section-mobile lg:mb-12">
          <p className="text-caption text-text-muted tracking-wider uppercase flex items-center">
            <span className="text-tango font-semibold">Home</span>
            <ChevronRight size={12} className="mx-1" />
            <span className="text-tango font-semibold">Dining</span>
            <ChevronRight size={12} className="mx-1" />
            <span className="text-alpha">Aura Chair</span>
          </p>
          <div className="flex items-center text-gold">
            <Star size={16} className="fill-gold" />
            <Star size={16} className="fill-gold" />
            <Star size={16} className="fill-gold" />
            <Star size={16} className="fill-gold" />
            <Star size={16} className="text-text-muted" />
            <span className="ml-2 text-small text-text-secondary">(24 Reviews)</span>
          </div>
        </div>

        {/* PRODUCT GRID: IMAGE GALLERY & DETAILS */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-x-12 gap-y-16">
          {/* LEFT: IMAGE GALLERY */}
          <div className="space-y-8">
            <h2 className="lg:hidden font-secondary text-h1 text-alpha mb-4">Aura Dining Chair</h2>

            {/* HERO IMAGE */}
            <div className="relative aspect-hero overflow-hidden rounded-card shadow-card-hover group">
              <div className="bg-sand h-full w-full flex items-center justify-center"></div>
              <div className="absolute inset-0 bg-gradient-overlay opacity-50 group-hover:opacity-10 transition-normal"></div>
            </div>

            {/* THUMBNAIL GALLERY */}
            <div className="grid grid-cols-3 gap-4">
              <div className="aspect-square bg-sand rounded-card overflow-hidden"></div>
              <div className="aspect-square bg-sand rounded-card overflow-hidden"></div>
              <div className="aspect-square bg-sand rounded-card overflow-hidden"></div>
            </div>

            {/* LONG DESCRIPTION */}
            <div className="pt-section-mobile lg:pt-0">
              <h3 className="font-secondary text-h3 text-alpha mb-4 border-b border-border-light pb-2">
                The Architectural Statement
              </h3>
              <p className="text-body text-text-secondary mb-4">
                The Aura Dining Chair is a study in <strong>form and negative space</strong>. Constructed
                from solid, sustainably sourced wood and finished with a bespoke oil treatment. Its
                design embodies the &apos;less is more&apos; principle, providing exceptional comfort while
                maintaining a visually light, sculptural profile that elevates any dining space. A true
                piece of functional art.
              </p>
              <div className="bg-ivory p-6 rounded-card border border-border-light shadow-card">
                <p className="font-secondary text-small text-text-secondary italic">
                  &quot;Crafted for the purist, designed for timeless appeal. A decade-long commitment to
                  sustainable luxury.&quot;
                </p>
              </div>
            </div>
          </div>


          {/* RIGHT: CONFIGURATION & ADD TO CART */}
          <div className="lg:sticky lg:top-20 h-max space-y-8">
            {/* PRODUCT TITLE (Visible on large screens) */}
            <h1 className="hidden lg:block font-secondary text-display leading-tight text-alpha">
              The <span className="text-tango">Aura</span>
              <span className="text-h1 block font-primary text-text-secondary opacity-70">
                Dining Chair
              </span>
            </h1>

            {/* FINISH SELECTION */}
            <div>
              <h4 className="text-small font-semibold uppercase tracking-wide text-text-primary mb-3">
                Wood & Upholstery Finish:
              </h4>
              <div className="flex space-x-3">
                {finishes.map((finish) => (
                  <button
                    key={finish.id}
                    onClick={() => setSelectedFinish(finish.id)}
                    className={`p-2 border-2 rounded-full transition-normal transform hover:scale-102
                      ${
                        selectedFinish === finish.id
                          ? 'border-tango shadow-md ring-2 ring-tango/50'
                          : 'border-border-medium hover:border-tango/50'
                      }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full ${finish.class} shadow-inner`}
                      title={finish.name}
                    ></div>
                  </button>
                ))}
              </div>
              <p className="text-small text-text-secondary mt-2">
                Selected:{' '}
                <span className="font-semibold text-text-primary">
                  {finishes.find((f) => f.id === selectedFinish)?.name}
                </span>
              </p>
            </div>

            {/* FLOATING ACTION PANEL */}
            <FloatingActionPanel price={price} onAddToCart={handleAddToCart} />

            <hr className="border-border-light" />

            {/* KEY FEATURES */}
            <div className="space-y-4">
              <h4 className="text-small font-semibold uppercase tracking-wide text-text-primary">
                Key Features
              </h4>
              <ul className="text-body text-text-secondary space-y-2">
                <li className="flex items-start">
                  <Check size={18} className="text-tango mr-2 mt-1 flex-shrink-0" />
                  Solid, Sustainably Sourced <span className="font-bold ml-1">Hardwood Frame</span>.
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-tango mr-2 mt-1 flex-shrink-0" />
                  Premium <span className="font-bold ml-1">Italian Leather/Linen Upholstery</span>.
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-tango mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gold font-bold mr-1">5-Year Structural Warranty</span> included.
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-tango mr-2 mt-1 flex-shrink-0" />
                  Dimensions: H 78cm x W 50cm x D 55cm.
                </li>
              </ul>
            </div>

            <hr className="border-border-light" />

            {/* SHIPPING & RETURNS */}
            <div className="space-y-4">
              <h4 className="text-small font-semibold uppercase tracking-wide text-text-primary">
                Service & Logistics
              </h4>
              <div className="bg-ivory p-4 rounded-card border border-border-light">
                <div className="flex items-center mb-2">
                  <Info size={18} className="text-sage mr-2" />
                  <span className="text-small font-semibold text-text-primary">
                    In Stock: Dispatch within 3-5 days.
                  </span>
                </div>
                <p className="text-caption text-text-muted">
                  Enjoy free white-glove delivery on all furniture orders. 30-day return window
                  available.
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* 3. RELATED PRODUCTS / VISUAL CONTINUITY */}
        <section className="mt-section lg:mt-section">
          <h2 className="font-secondary text-h2 text-alpha mb-8 border-b border-border-light pb-2">
            Complete the Look
          </h2>
          <div className="grid grid-cols-products gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative aspect-product bg-sand rounded-card overflow-hidden mb-4 shadow-card group-hover:shadow-card-hover transition-normal">
                  <div className="h-full w-full flex items-center justify-center"></div>
                  <div className="absolute top-3 right-3 bg-alpha text-caption text-inverse px-3 py-1 rounded-badge tracking-wider">
                    NEW
                  </div>
                </div>
                <h4 className="text-body font-semibold text-text-primary group-hover:text-tango transition-normal">
                  Related Item {i}
                </h4>
                <p className="text-small text-text-muted">$3,000</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductDetailPage;
