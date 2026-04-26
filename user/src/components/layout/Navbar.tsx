"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import CartIcon from "./menu/carticon";
import SearchIcon from "./menu/searchicon";
import WishlistIcon from "./menu/wishlisticon";
import CartModal from "../modals/CartModal";
import WishlistModal from "../modals/WishlistModal";
import SearchModal from "../modals/SearchModal";
import AuthModal from "../auth/AuthModal";
import ProfileModal from "./modals/ProfileModal";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const isHomePage = pathname === "/";
  
  // Pages where search is useful (product browsing/discovery pages)
  const showSearch = pathname === "/" || 
                     pathname === "/categories" || 
                     pathname === "/blogs" ||
                     pathname.startsWith("/categories/") ||
                     pathname.startsWith("/subcategories/");
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOverOffers, setIsOverOffers] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const searchButtonRef = useRef<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [activeSearchRef, setActiveSearchRef] = useState<React.RefObject<any>>(searchButtonRef);

  // Check if user just signed up with Google and needs to complete profile
  useEffect(() => {
    console.log('[Navbar] Session changed:', session);
    console.log('[Navbar] isNewUser:', session?.isNewUser);
    console.log('[Navbar] showNewUserModal:', showNewUserModal);
    console.log('[Navbar] isAuthOpen:', isAuthOpen);
    
    // Only show modal once when isNewUser is true and modal hasn't been shown yet
    if (session?.isNewUser && !showNewUserModal && !isAuthOpen) {
      console.log('[Navbar] New Google user detected, showing optional fields modal');
      setShowNewUserModal(true);
      setAuthMode("signup");
      setIsAuthOpen(true);
    }
  }, [session?.isNewUser]); // Only depend on isNewUser flag

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setActiveSearchRef(searchButtonRef);
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setIsProfileOpen(false);
    router.refresh();
  };

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
        rootMargin: "-80px 0px -80px 0px" // Offset for navbar height
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

  // On non-homepage, always show solid navbar style
  // On homepage, show solid only if scrolled AND not over the Offers section
  const showSolidNavbar = !isHomePage || (isScrolled && !isOverOffers);

  const navLinks = [
    { href: "/", label: "HOME" },
    { href: "/about", label: "ABOUT" },
    { href: "/categories", label: "CATEGORIES" },
    { href: "/blogs", label: "BLOGS" },
    { href: "/contact", label: "CONTACT" },
  ];

  return (
    <>
      <nav 
        className={`hidden md:flex flex-col fixed top-0 left-0 right-0 z-[100] transition-all duration-500 will-change-transform ${
          isScrolled ? "py-1" : "py-2"
        }`}
      >
        {/* Unified Glass Background */}
        <div 
          className="absolute inset-0 bg-creme/85 backdrop-blur-md will-change-transform shadow-[0_4px_30px_rgba(38,37,36,0.03)] border-b border-alpha/10"
          style={{
            transform: showSolidNavbar ? 'translateY(0)' : 'translateY(-100%)',
            opacity: showSolidNavbar ? 1 : 0,
            transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease',
          }}
        />
        
        {/* First Row - Logo centered, Icons on right */}
        <div className="relative z-10 w-full h-14 max-w-[1920px] mx-auto flex items-center px-6">
          
          {/* Left Side — unified search bar (always same DOM element = triggerRef anchors correctly) */}
          <div className="flex items-center flex-1">
            {showSearch ? (
              <div
                ref={searchButtonRef as any}
                onClick={() => {
                  if (!isSearchOpen) {
                    setActiveSearchRef(searchButtonRef);
                    setIsSearchOpen(true);
                    setTimeout(() => searchInputRef.current?.focus(), 80);
                  }
                }}
                className={`relative flex items-center h-9 px-3.5 transition-all duration-300 cursor-text ${
                  isSearchOpen
                    ? 'w-64 lg:w-80 xl:w-96'
                    : 'w-44 lg:w-56 xl:w-64'
                } ${
                  showSolidNavbar
                    ? isSearchOpen
                      ? 'bg-white border border-alpha/25 rounded-full shadow-[0_2px_16px_rgba(38,37,36,0.10)]'
                      : 'bg-white/60 border border-alpha/12 rounded-full hover:bg-white/80 hover:border-alpha/20'
                    : isSearchOpen
                      ? 'bg-creme/15 border border-creme/35 rounded-full'
                      : 'bg-creme/8 border border-creme/15 rounded-full hover:bg-creme/15 hover:border-creme/25'
                }`}
              >
                {/* Search icon */}
                <SearchIcon
                  size={14}
                  className={`flex-shrink-0 transition-colors duration-200 ${
                    showSolidNavbar
                      ? isSearchOpen ? 'text-alpha/50' : 'text-alpha/35'
                      : isSearchOpen ? 'text-creme/60' : 'text-creme/45'
                  }`}
                />

                {/* Input — always mounted so triggerRef rect is stable */}
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (!isSearchOpen) {
                      setActiveSearchRef(searchButtonRef);
                      setIsSearchOpen(true);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') { setIsSearchOpen(false); setSearchQuery(''); }
                    if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
                      router.push(`/categories?search=${encodeURIComponent(searchQuery.trim())}`);
                      setIsSearchOpen(false); setSearchQuery('');
                    }
                  }}
                  placeholder={isSearchOpen ? 'Search products, categories…' : 'Search…'}
                  autoComplete="off"
                  className={`flex-1 min-w-0 ml-2 bg-transparent text-[12px] font-primary tracking-wide outline-none transition-colors duration-200 ${
                    showSolidNavbar
                      ? 'text-alpha placeholder:text-alpha/30'
                      : 'text-creme placeholder:text-creme/35'
                  }`}
                />

                {/* ⌘K hint — shown when idle */}
                {!isSearchOpen && !searchQuery && (
                  <kbd className={`hidden xl:inline-block flex-shrink-0 ml-1.5 px-1.5 py-0.5 text-[9px] border rounded pointer-events-none ${
                    showSolidNavbar ? 'border-alpha/15 text-alpha/30' : 'border-creme/20 text-creme/40'
                  }`}>
                    ⌘K
                  </kbd>
                )}

                {/* Clear button — shown when query exists */}
                {searchQuery && (
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); setSearchQuery(''); }}
                    className={`flex-shrink-0 ml-1 p-0.5 rounded-full transition-colors ${
                      showSolidNavbar ? 'text-alpha/30 hover:text-alpha/60' : 'text-creme/35 hover:text-creme/65'
                    }`}
                    aria-label="Clear search"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ) : (
              <div />
            )}
          </div>

          {/* Center - Logo */}
          <div className="flex-1 flex justify-center">
            <Link 
              href="/" 
              className={`text-3xl font-['brand-primary'] tracking-tight ${
                showSolidNavbar ? "text-alpha hover:text-alpha/70" : "text-creme hover:text-creme/80"
              }`}
              style={{
                transition: 'color 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.08s',
              }}
            >
              CAFCO
            </Link>
          </div>

          {/* Right Side - Wishlist, Cart, Profile */}
          <div className="flex items-center justify-end gap-1 flex-1">
            <button 
              onClick={() => setIsWishlistOpen(true)}
              className={`p-2 flex items-center justify-center rounded ${
                showSolidNavbar ? "text-alpha/70 hover:text-alpha" : "text-creme/80 hover:text-creme"
              }`}
              style={{
                transition: 'color 0.45s cubic-bezier(0.4, 0, 0.2, 1) 0.1s',
              }}
              aria-label="Wishlist"
            >
              <WishlistIcon size={20} />
            </button>
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className={`p-2 flex items-center justify-center rounded ${
                showSolidNavbar ? "text-alpha/70 hover:text-alpha" : "text-creme/80 hover:text-creme"
              }`}
              style={{
                transition: 'color 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.12s',
              }}
              aria-label="Cart"
            >
              <CartIcon size={20} />
            </button>
            
            {/* User Profile / Auth */}
            {status === 'loading' ? (
              <div className={`p-2 flex items-center justify-center rounded ${
                showSolidNavbar ? "text-alpha/70" : "text-creme/80"
              }`}>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : session ? (
              <button 
                onClick={() => setIsProfileOpen(true)}
                className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                  showSolidNavbar ? "text-alpha/70 hover:text-alpha hover:bg-alpha/5" : "text-creme/80 hover:text-creme hover:bg-creme/10"
                }`}
                style={{
                  transition: 'color 0.55s cubic-bezier(0.4, 0, 0.2, 1) 0.14s',
                }}
                aria-label="Open profile menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs font-primary tracking-wide hidden lg:inline">
                  {session.user?.name || 'User'}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setAuthMode("login"); setIsAuthOpen(true); }}
                  className={`px-3 py-2 text-xs font-primary uppercase tracking-wide rounded transition-colors ${
                    showSolidNavbar ? "text-alpha/70 hover:text-alpha hover:bg-alpha/5" : "text-creme/80 hover:text-creme hover:bg-creme/10"
                  }`}
                  style={{
                    transition: 'color 0.55s cubic-bezier(0.4, 0, 0.2, 1) 0.14s',
                  }}
                >
                  Login
                </button>
                <span className={`hidden sm:inline ${showSolidNavbar ? "text-alpha/30" : "text-creme/40"}`}>|</span>
                <button 
                  onClick={() => { setAuthMode("signup"); setIsAuthOpen(true); }}
                  className={`hidden sm:block px-3 py-2 text-xs font-primary uppercase tracking-wide rounded transition-colors ${
                    showSolidNavbar ? "text-alpha/70 hover:text-alpha hover:bg-alpha/5" : "text-creme/80 hover:text-creme hover:bg-creme/10"
                  }`}
                  style={{
                    transition: 'color 0.55s cubic-bezier(0.4, 0, 0.2, 1) 0.14s',
                  }}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Border between rows */}
        <div 
          className={`relative z-10 w-full h-px ${showSolidNavbar ? "bg-alpha/10" : "bg-creme/15"}`}
          style={{
            transition: 'background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />

        {/* Second Row - Navigation Links */}
        <div className="relative z-10 w-full h-10 max-w-[1920px] mx-auto flex items-center justify-center px-6">
          <div className="flex items-center justify-center gap-6 lg:gap-8 xl:gap-10">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-xs lg:text-sm font-medium tracking-wide px-3 py-1.5 rounded whitespace-nowrap ${
                  showSolidNavbar 
                    ? "text-alpha/70 hover:text-alpha" 
                    : "text-creme/75 hover:text-creme"
                }`}
                style={{
                  transition: `color 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${0.02 * index}s`,
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Border */}
        <div 
          className={`relative z-10 w-full h-px ${showSolidNavbar ? "bg-alpha/10" : "bg-creme/15"}`}
          style={{
            transition: 'background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </nav>

      {/* Modals */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => {
          setIsSearchOpen(false);
          setSearchQuery('');
        }} 
        triggerRef={activeSearchRef} 
        query={searchQuery}
        setQuery={setSearchQuery}
      />
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WishlistModal isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => {
          setIsAuthOpen(false);
          setShowNewUserModal(false);
        }} 
        initialMode={authMode}
        isNewGoogleUser={showNewUserModal}
      />
      {session && (
        <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} session={session} />
      )}
    </>
  );
}
