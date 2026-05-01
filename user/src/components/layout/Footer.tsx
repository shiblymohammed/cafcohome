export default function Footer() {
  return (
    <footer className="hidden md:flex flex-col h-[45vh] bg-alpha text-ivory relative overflow-hidden">

      {/* TOP CONTENT AREA */}
      <div className="flex justify-around px-12 pt-12 pb-8 relative z-10">

        {/* LEFT — LOGO + SLOGAN */}
        <div className="flex flex-col gap-4">
          <div className="w-6 h-6 border border-text-secondary rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-text-secondary rounded-full"></div>
          </div>
          <div>
            <div className="text-sm text-text-muted font-light leading-relaxed">
              Designing spaces
            </div>
            <div className="text-sm text-text-muted font-light leading-relaxed">
              you&apos;ll love to live in
            </div>
          </div>
        </div>

        {/* RIGHT — 3 COLUMN LINKS */}
        <div className="flex gap-24">
          {/* Column 1 */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-tango mb-2">Explore</span>
            <a href="/about" className="text-sm text-text-muted hover:text-ivory transition-colors">About Us</a>
            <a href="/products" className="text-sm text-text-muted hover:text-ivory transition-colors">All Products</a>
            <a href="/blogs" className="text-sm text-text-muted hover:text-ivory transition-colors">Blog</a>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-tango mb-2">Shop</span>
            <a href="/categories" className="text-sm text-text-muted hover:text-ivory transition-colors">Categories</a>
            <a href="/offers" className="text-sm text-text-muted hover:text-ivory transition-colors">Offers</a>
            <a href="/contact" className="text-sm text-text-muted hover:text-ivory transition-colors">Contact</a>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-tango mb-2">Account</span>
            <a href="/orders" className="text-sm text-text-muted hover:text-ivory transition-colors">My Orders</a>
            <a href="/wishlist" className="text-sm text-text-muted hover:text-ivory transition-colors">Wishlist</a>
            <a href="/profile" className="text-sm text-text-muted hover:text-ivory transition-colors">Profile</a>
          </div>
        </div>
      </div>

      {/* BOTTOM — LARGE BRAND NAME WITH COPYRIGHT */}
      <div className="absolute ml-10 bottom-[-65%] left-0 w-full select-none pointer-events-none">
        <div className="relative flex items-end justify-center">
          <span className="text-[28vw] font-bold tracking-[0.15em] text-charcoal/40 leading-none">
            DRAVO
          </span>
        </div>
      </div>
    </footer>
  );
}
