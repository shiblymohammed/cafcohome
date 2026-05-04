"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import MenuAnimation from "./menu/menuanimation";
import CartIcon from "./menu/carticon";
import SearchIcon from "./menu/searchicon";
import WishlistIcon from "./menu/wishlisticon";
import CartDrawer from "./modals/CartDrawer";
import WishlistDrawer from "./modals/WishlistDrawer";
import SearchModal from "../modals/SearchModal";

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";
  
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOverOffers, setIsOverOffers] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for Offers section transparency on homepage
  useEffect(() => {
    if (!isHomePage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOverOffers(entry.isIntersecting);
      },
      { 
        threshold: 0,
        rootMargin: "-48px 0px -48px 0px" // Offset for mobile navbar height (h-12 = 48px)
      }
    );

    const offersSection = document.getElementById("homepage-offers-section");
    if (offersSection) {
      observer.observe(offersSection);
    }

    return () => {
      if (offersSection) {
        observer.unobserve(offersSection);
      }
    };
  }, [isHomePage]);

  // On non-homepage, always show solid navbar style (same as desktop)
  const showSolidNavbar = !isHomePage || (isScrolled && !isOverOffers);

  return (
    <>
      {/* Top Navbar */}
      <div className="flex md:hidden fixed top-0 left-0 right-0 z-50 h-12 bg-transparent shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="h-full w-full flex items-center">

          {/* Hamburger Button - Square */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`h-12 w-14 flex items-center justify-center relative overflow-hidden ${showSolidNavbar ? "text-alpha border-r border-alpha/50" : "text-creme"
              }`}
            style={{
              transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            aria-label="Toggle menu"
          >
            <div 
              className="absolute inset-0 bg-creme will-change-transform"
              style={{
                transform: showSolidNavbar ? 'translateX(0) scale(1)' : 'translateX(-105%) scale(0.95)',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
            <span className="relative z-10">
              <MenuAnimation isOpen={isOpen} size={24} />
            </span>
          </button>

          {/* Search Button - Square */}
          <button
            ref={searchButtonRef}
            onClick={() => setIsSearchOpen(true)}
            className={`h-12 w-14 flex items-center justify-center relative overflow-hidden ${showSolidNavbar ? "text-alpha" : "text-creme"
              }`}
            style={{
              transition: 'color 0.35s cubic-bezier(0.4, 0, 0.2, 1) 0.03s',
            }}
            aria-label="Search"
          >
            <div 
              className="absolute inset-0 bg-creme will-change-transform"
              style={{
                transform: showSolidNavbar ? 'translateY(0) scale(1)' : 'translateY(105%) scale(0.95)',
                transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1) 0.03s',
              }}
            />
            <span className="relative z-10">
              <SearchIcon size={20} />
            </span>
          </button>

          {/* Logo Button - Rectangle (flex-1 to fill remaining space) */}
          <button
            className={`h-12 flex-1 flex items-center justify-center text-3xl font-['brand-primary'] relative overflow-hidden ${showSolidNavbar ? "text-alpha border-l border-r border-alpha/50" : "text-creme"
              }`}
            style={{
              transition: 'color 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.06s',
            }}
            aria-label="Home"
          >
            <div 
              className="absolute inset-0 bg-creme will-change-transform"
              style={{
                transform: showSolidNavbar ? 'translateY(0) scale(1)' : 'translateY(-105%) scale(0.95)',
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.06s',
              }}
            />
            <span className="relative z-10">
              DRAVO
            </span>
          </button>

          {/* Wishlist Button - Square */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            className={`h-12 w-14 flex items-center justify-center relative overflow-hidden ${showSolidNavbar ? "text-alpha" : "text-creme"
              }`}
            style={{
              transition: 'color 0.45s cubic-bezier(0.4, 0, 0.2, 1) 0.09s',
            }}
            aria-label="Wishlist"
          >
            <div 
              className="absolute inset-0 bg-creme will-change-transform"
              style={{
                transform: showSolidNavbar ? 'translateY(0) scale(1)' : 'translateY(105%) scale(0.95)',
                transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1) 0.09s',
              }}
            />
            <span className="relative z-10">
              <WishlistIcon size={20} />
            </span>
          </button>

          {/* Cart Button - Square */}
          <button
            onClick={() => setIsCartOpen(true)}
            className={`h-12 w-14 flex items-center justify-center relative overflow-hidden ${showSolidNavbar ? "text-alpha border-l border-alpha/50" : "text-creme"
              }`}
            style={{
              transition: 'color 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.12s',
            }}
            aria-label="Cart"
          >
            <div 
              className="absolute inset-0 bg-creme will-change-transform"
              style={{
                transform: showSolidNavbar ? 'translateX(0) scale(1)' : 'translateX(105%) scale(0.95)',
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.12s',
              }}
            />
            <span className="relative z-10">
              <CartIcon size={20} />
            </span>
          </button>

        </div>
      </div>

      {/* Background Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-alpha/60 backdrop-blur-sm z-40 transition-all duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Menu */}
      <div
        className={`md:hidden fixed left-0 top-12 bottom-0 w-72 bg-creme z-50 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform shadow-2xl
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Menu Content */}
        <div className="flex flex-col h-full">
          {/* Navigation Links */}
          <nav className="flex-1 px-6 py-8">
            <div className="flex flex-col">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About" },
                { href: "/categories", label: "Categories" },
                { href: "/products", label: "All Products" },
                { href: "/blogs", label: "Blogs" },
                { href: "/contact", label: "Contact" },
              ].map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="group relative py-4 border-b border-alpha/10 last:border-b-0"
                  style={{
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'translateX(0)' : 'translateX(-20px)',
                    transition: `opacity 0.4s ease ${0.1 + index * 0.05}s, transform 0.4s ease ${0.1 + index * 0.05}s`,
                  }}
                >
                  <span className="flex items-center justify-between">
                    <span className="text-xl font-secondary text-alpha group-hover:text-tango transition-colors duration-200">
                      {link.label}
                    </span>
                    <svg 
                      className="w-4 h-4 text-alpha/30 group-hover:text-tango group-hover:translate-x-1 transition-all duration-200" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Bottom Section */}
          <div 
            className="px-6 py-6 border-t border-alpha/10"
            style={{
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.4s ease 0.4s, transform 0.4s ease 0.4s',
            }}
          >
            <p className="text-xs font-primary text-alpha/40 uppercase tracking-widest mb-3">Follow Us</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-alpha/50 hover:text-tango transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-alpha/50 hover:text-tango transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="text-alpha/50 hover:text-tango transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

       {/* Modals */}
       <SearchModal 
         isOpen={isSearchOpen} 
         onClose={() => {
           setIsSearchOpen(false);
           setSearchQuery('');
         }} 
         triggerRef={searchButtonRef as any} 
         query={searchQuery}
         setQuery={setSearchQuery}
       />
       <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
       <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </>
  );
}
