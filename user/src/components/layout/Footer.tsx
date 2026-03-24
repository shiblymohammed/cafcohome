export default function Footer() {
  return (
    <footer className="hidden md:flex flex-col h-[45vh] bg-alpha text-ivory relative overflow-hidden">

      {/* TOP CONTENT AREA */}
      <div className="flex justify-around px-12 pt-12 pb-8 relative z-10">

        {/* LEFT — LOGO + SLOGAN */}
        <div className="flex flex-col gap-4">
          {/* Small decorative icon */}
          <div className="w-6 h-6 border border-text-secondary rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-text-secondary rounded-full"></div>
          </div>
          {/* Slogan */}
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
            <span className="text-[10px] uppercase tracking-widest text-tango mb-2">About</span>
            <a href="#" className="text-sm text-text-muted hover:text-ivory transition-colors">About Us</a>
            <a href="#" className="text-sm text-text-muted hover:text-ivory transition-colors">Furnitures</a>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-tango mb-2">Info</span>
            <a href="#" className="text-sm text-text-muted hover:text-ivory transition-colors">Contact</a>
            <a href="#" className="text-sm text-text-muted hover:text-ivory transition-colors">Gallery</a>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-tango mb-2">Socials</span>
            <a href="#" className="text-sm text-text-muted hover:text-ivory transition-colors">Support</a>
            <a href="#" className="text-sm text-text-muted hover:text-ivory transition-colors">Instagram</a>
          </div>
        </div>
      </div>

      {/* BOTTOM — LARGE BRAND NAME WITH COPYRIGHT */}
      <div className="absolute ml-10 bottom-[-65%] left-0 w-full select-none pointer-events-none">
        <div className="relative flex items-end justify-center">
          <span className="text-[28vw] font-bold tracking-[0.15em] text-charcoal/40 leading-none">
            CAFCO
          </span>
        </div>
      </div>
    </footer>
  );
}
