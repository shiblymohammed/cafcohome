"use client";

import Image from "next/image";
import { useEffect, useState, useLayoutEffect } from "react";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WishlistDrawer({ isOpen, onClose }: WishlistDrawerProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Use useLayoutEffect for synchronous visibility updates to avoid cascading renders
  useLayoutEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full md:w-[450px] bg-creme z-[61] shadow-2xl transition-transform duration-300 ease-out transform flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-alpha/10">
          <h2 className="text-xl font-secondary text-alpha">Wishlist</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-alpha hover:opacity-70 transition-opacity"
          >
            <svg
              className="w-4 h-4"
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 gap-4">
                 {/* Wishlist Item 1 */}
                <div className="group cursor-pointer">
                    <div className="relative aspect-[3/4] bg-neutral-100 mb-3 overflow-hidden">
                         <Image 
                            src="https://images.unsplash.com/photo-1595123550441-d377e017de6a?q=80&w=400" 
                            alt="Travertine Table"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                         <button className="absolute top-2 right-2 w-6 h-6 bg-alpha text-creme rounded-full flex items-center justify-center">
                            <span className="text-xs">×</span>
                         </button>
                    </div>
                    <h3 className="text-sm font-secondary text-alpha leading-tight">Travertine Table</h3>
                    <p className="text-xs font-primary text-alpha/60 mt-1">$2,400</p>
                    <button className="mt-3 w-full border border-alpha text-alpha text-[0.6rem] uppercase tracking-widest py-2 hover:bg-alpha hover:text-creme transition-colors">
                        Add to Cart
                    </button>
                </div>

                 {/* Wishlist Item 2 */}
                 <div className="group cursor-pointer">
                    <div className="relative aspect-[3/4] bg-neutral-100 mb-3 overflow-hidden">
                         <Image 
                            src="https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=400" 
                            alt="Walnut Credenza"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <button className="absolute top-2 right-2 w-6 h-6 bg-alpha text-creme rounded-full flex items-center justify-center">
                            <span className="text-xs">×</span>
                         </button>
                    </div>
                    <h3 className="text-sm font-secondary text-alpha leading-tight">Walnut Credenza</h3>
                    <p className="text-xs font-primary text-alpha/60 mt-1">$3,200</p>
                    <button className="mt-3 w-full border border-alpha text-alpha text-[0.6rem] uppercase tracking-widest py-2 hover:bg-alpha hover:text-creme transition-colors">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}
