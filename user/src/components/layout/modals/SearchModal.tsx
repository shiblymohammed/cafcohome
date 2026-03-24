"use client";

import { useEffect, useState, useRef, useLayoutEffect } from "react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use useLayoutEffect for synchronous visibility updates to avoid cascading renders
  useLayoutEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Focus input after animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[70] bg-alpha/98 backdrop-blur-md transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 md:top-10 md:right-10 w-10 h-10 flex items-center justify-center text-creme hover:opacity-70 transition-opacity z-50"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Content Container */}
      <div className="w-full h-full flex flex-col pt-32 px-4 md:px-0 max-w-3xl mx-auto">
        
        {/* Search Input */}
        <div className="relative border-b-2 border-creme/20 focus-within:border-creme transition-colors duration-300">
           <input
            ref={inputRef}
            type="text"
            placeholder="Search products, collections..."
            className="w-full bg-transparent py-4 text-2xl md:text-3xl font-secondary text-creme placeholder:text-creme/40 focus:outline-none"
           />
           <button className="absolute right-0 top-1/2 -translate-y-1/2 text-creme/50 hover:text-creme transition-colors">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
           </button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-xs font-primary uppercase tracking-[0.2em] text-creme/50 mb-6">
                Popular Searches
            </h3>
            <div className="flex flex-wrap gap-4">
                {["Velvet Sofa", "Marble Table", "Floor Lamp", "Ceramic Vases", "Lounge Chair"].map((term) => (
                    <button 
                        key={term}
                        className="px-4 py-2 border border-creme/20 rounded-full text-sm text-creme/80 hover:border-creme hover:text-creme transition-all duration-300"
                    >
                        {term}
                    </button>
                ))}
            </div>
        </div>

         {/* Categories Grid */}
        <div className="mt-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
             <h3 className="text-xs font-primary uppercase tracking-[0.2em] text-creme/50 mb-6">
                Browse By Category
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                    { name: "Living", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200" },
                    { name: "Dining", img: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=200" },
                    { name: "Bedroom", img: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=200" },
                    { name: "Lighting", img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200" },
                 ].map((cat) => (
                     <div key={cat.name} className="group cursor-pointer">
                         <div className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-creme/10">
                              {/* <Image src={cat.img} alt={cat.name} fill className="object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"/> */}
                              <div className="absolute inset-0 bg-creme/5 group-hover:bg-creme/0 transition-colors" />
                         </div>
                         <span className="text-sm font-secondary text-creme">{cat.name}</span>
                     </div>
                 ))}
            </div>
        </div>

      </div>
    </div>
  );
}
