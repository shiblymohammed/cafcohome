"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useLayoutEffect } from "react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
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
          <h2 className="text-xl font-secondary text-alpha">Shopping Bag (2)</h2>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Cart Item 1 */}
          <div className="flex gap-4">
            <div className="relative w-24 aspect-[3/4] bg-neutral-100 overflow-hidden">
               <Image 
                src="https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=200" 
                alt="Noir Lounge Chair"
                fill
                className="object-cover"
               />
            </div>
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                    <h3 className="text-sm font-secondary text-alpha">Noir Lounge Chair</h3>
                    <span className="text-xs font-primary">$1,200</span>
                </div>
                <p className="text-[0.65rem] uppercase tracking-wider text-alpha/60 mt-1">Midnight Velvet</p>
                
                <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-alpha/20">
                        <button className="px-2 py-1 text-xs hover:bg-alpha/5">-</button>
                        <span className="px-2 text-xs border-l border-r border-alpha/20">1</span>
                        <button className="px-2 py-1 text-xs hover:bg-alpha/5">+</button>
                    </div>
                    <button className="text-[0.6rem] uppercase tracking-widest border-b border-alpha/30 hover:border-alpha transition-colors">
                        Remove
                    </button>
                </div>
            </div>
          </div>

          {/* Cart Item 2 */}
          <div className="flex gap-4">
            <div className="relative w-24 aspect-[3/4] bg-neutral-100 overflow-hidden">
               <Image 
                src="https://images.unsplash.com/photo-1513506003011-38f366677b09?q=80&w=200" 
                alt="Alabaster Pendant"
                fill
                className="object-cover"
               />
            </div>
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                    <h3 className="text-sm font-secondary text-alpha">Alabaster Pendant</h3>
                    <span className="text-xs font-primary">$850</span>
                </div>
                <p className="text-[0.65rem] uppercase tracking-wider text-alpha/60 mt-1">Natural Stone</p>
                
                <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-alpha/20">
                        <button className="px-2 py-1 text-xs hover:bg-alpha/5">-</button>
                        <span className="px-2 text-xs border-l border-r border-alpha/20">1</span>
                        <button className="px-2 py-1 text-xs hover:bg-alpha/5">+</button>
                    </div>
                    <button className="text-[0.6rem] uppercase tracking-widest border-b border-alpha/30 hover:border-alpha transition-colors">
                        Remove
                    </button>
                </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-alpha/10 bg-creme">
            <div className="flex items-center justify-between mb-4 text-sm font-medium text-alpha">
                <span>Subtotal</span>
                <span>$2,050</span>
            </div>
            <p className="text-[0.6rem] text-alpha/60 mb-6 font-primary text-center">
                Shipping & taxes calculated at checkout.
            </p>
            <Link 
              href="/checkout"
              onClick={onClose}
              className="w-full bg-alpha text-creme py-4 text-xs uppercase tracking-[0.2em] hover:bg-alpha/90 transition-colors block text-center"
            >
                Checkout
            </Link>
        </div>
      </div>
    </>
  );
}
