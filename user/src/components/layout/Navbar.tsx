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
                     pathname === "/products" ||
                     pathname.startsWith("/categories/") ||
                     pathname.startsWith("/subcategories/") ||
                     pathname.startsWith("/products");
  
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
        className="hidden md:flex flex-col fixed left-0 right-0 z-[100] transition-all duration-500 will-change-transform"
        style={{ top: 'var(--marquee-height, 0px)' }}
      >
        {/* Glass Background */}
        <div 
          className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none bg-creme/90 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
          style={{
            transform: showSolidNavbar ? 'translateY(0)' : 'translateY(-100%)',
            opacity: showSolidNavbar ? 1 : 0,
          }}
        />
        
        {/* First Row - Logo centered, Icons on right */}
        <div className="relative z-10 w-full h-16 max-w-[1920px] mx-auto flex items-center px-6 lg:px-8 pt-2">
          
          {/* Left Side — modern unified search pill */}
          <div className="flex items-center flex-1">
            {showSearch && (
              <div
                ref={searchButtonRef as any}
                onClick={() => {
                  if (!isSearchOpen) {
                    setActiveSearchRef(searchButtonRef);
                    setIsSearchOpen(true);
                    setTimeout(() => searchInputRef.current?.focus(), 80);
                  }
                }}
                className={`relative flex items-center h-10 px-4 transition-all duration-500 cursor-text group ${
                  isSearchOpen
                    ? 'w-72 lg:w-96'
                    : 'w-48 lg:w-64'
                } ${
                  showSolidNavbar
                    ? isSearchOpen
                      ? 'bg-white border border-alpha/15 rounded-full shadow-[0_8px_24px_rgba(38,37,36,0.08)]'
                      : 'bg-alpha/5 border border-transparent rounded-full hover:bg-alpha/10'
                    : isSearchOpen
                      ? 'bg-white/20 border border-white/30 rounded-full backdrop-blur-lg shadow-lg'
                      : 'bg-white/10 border border-white/20 rounded-full hover:bg-white/20 backdrop-blur-md'
                }`}
              >
                <SearchIcon
                  size={16}
                  className={`flex-shrink-0 transition-colors duration-300 ${
                    showSolidNavbar
                      ? isSearchOpen ? 'text-alpha' : 'text-alpha/40 group-hover:text-alpha/60'
                      : isSearchOpen ? 'text-white' : 'text-white/60 group-hover:text-white'
                  }`}
                />

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
                  className={`flex-1 min-w-0 ml-3 bg-transparent text-[13px] font-medium tracking-wide outline-none transition-colors duration-200 ${
                    showSolidNavbar
                      ? 'text-alpha placeholder:text-alpha/40'
                      : 'text-white placeholder:text-white/60'
                  }`}
                />

                {!isSearchOpen && !searchQuery && (
                  <kbd className={`hidden xl:inline-block flex-shrink-0 ml-2 px-2 py-0.5 text-[10px] font-bold rounded-md pointer-events-none transition-colors ${
                    showSolidNavbar ? 'bg-alpha/5 text-alpha/40' : 'bg-white/10 text-white/50'
                  }`}>
                    ⌘K
                  </kbd>
                )}

                {searchQuery && (
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); setSearchQuery(''); }}
                    className={`flex-shrink-0 ml-2 p-1 rounded-full transition-colors ${
                      showSolidNavbar ? 'text-alpha/40 hover:bg-alpha/10 hover:text-alpha' : 'text-white/60 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Center - Logo */}
          <div className="flex-1 flex justify-center">
            <Link 
              href="/" 
              className="flex items-center justify-center transition-all duration-500 hover:opacity-70 hover:scale-[1.03] active:scale-[0.97]"
            >
              <img 
                src={showSolidNavbar ? "/logo/logo_dark.png" : "/logo/logo_light.png"} 
                alt="DRAVO Logo" 
                className="h-6 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Right Side - Icon Clusters */}
          <div className="flex items-center justify-end gap-3 flex-1">
            {/* Utility Cluster */}
            <div className={`flex items-center p-1 rounded-full transition-colors duration-300 ${
              showSolidNavbar ? "bg-alpha/5" : "bg-white/10 backdrop-blur-md border border-white/10"
            }`}>
              <button 
                onClick={() => setIsWishlistOpen(true)}
                className={`p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
                  showSolidNavbar ? "text-alpha/70 hover:text-alpha hover:bg-white shadow-sm" : "text-white/80 hover:text-white hover:bg-white/20"
                }`}
              >
                <WishlistIcon size={18} />
              </button>
              
              <button 
                onClick={() => setIsCartOpen(true)}
                className={`p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
                  showSolidNavbar ? "text-alpha/70 hover:text-alpha hover:bg-white shadow-sm" : "text-white/80 hover:text-white hover:bg-white/20"
                }`}
              >
                <CartIcon size={18} />
              </button>
            </div>
            
            {/* Auth Cluster */}
            <div className={`flex items-center rounded-full transition-colors duration-300 ${
              showSolidNavbar ? "bg-alpha/5 p-1" : "bg-white/10 backdrop-blur-md border border-white/10 p-1"
            }`}>
              {status === 'loading' ? (
                <div className="p-2"><svg className="w-5 h-5 animate-spin text-current opacity-50" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>
              ) : session ? (
                <button 
                  onClick={() => setIsProfileOpen(true)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-300 ${
                    showSolidNavbar ? "text-alpha hover:bg-white shadow-sm" : "text-white hover:bg-white/20"
                  }`}
                >
                  <span className="text-xs font-semibold tracking-wide hidden lg:inline">{session.user?.name || 'User'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => { setAuthMode("login"); setIsAuthOpen(true); }}
                    className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full transition-all duration-300 ${
                      showSolidNavbar ? "text-alpha/70 hover:text-alpha hover:bg-white shadow-sm" : "text-white/80 hover:text-white hover:bg-white/20"
                    }`}
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => { setAuthMode("signup"); setIsAuthOpen(true); }}
                    className={`hidden sm:block px-5 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full transition-all duration-300 ${
                      showSolidNavbar ? "bg-alpha text-creme shadow-md hover:shadow-lg hover:scale-105" : "bg-white text-alpha shadow-md hover:shadow-lg hover:scale-105"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Elegant Fading Line Between Rows */}
        <div 
          className={`relative z-10 w-full max-w-[1920px] mx-auto h-px bg-gradient-to-r from-transparent ${
            showSolidNavbar ? "via-alpha/15" : "via-white/20"
          } to-transparent`}
          style={{ transition: 'background-color 0.4s ease' }}
        />

        {/* Second Row - Navigation Links with Pill Active States */}
        <div className="relative z-10 w-full pb-3 pt-1 max-w-[1920px] mx-auto flex items-center justify-center px-6">
          <div className="flex items-center justify-center gap-2 lg:gap-4">
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative text-[11px] lg:text-[12px] font-bold uppercase tracking-[0.15em] px-5 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                    showSolidNavbar 
                      ? isActive ? "bg-alpha text-creme shadow-md" : "text-alpha/70 hover:text-alpha hover:bg-alpha/5" 
                      : isActive ? "bg-white text-alpha shadow-lg" : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                  style={{ transitionDelay: `${0.02 * index}s` }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Elegant Fading Bottom Line */}
        <div 
          className={`absolute bottom-0 left-0 z-10 w-full h-px bg-gradient-to-r from-transparent ${
            showSolidNavbar ? "via-alpha/15" : "via-white/20"
          } to-transparent`}
          style={{ transition: 'background-color 0.4s ease' }}
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
