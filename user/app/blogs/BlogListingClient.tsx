"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url: string;
  author_name: string | null;
  is_featured: boolean;
  published_at: string;
}

interface BlogListingClientProps {
  blogs: BlogPost[];
}

/* ─── Intersection Observer hook ─── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Reading time estimate ─── */
function readTime(excerpt: string) {
  const words = excerpt.split(/\s+/).length;
  return `${Math.max(Math.ceil(words / 40), 3)} min read`;
}

/* ─── Date formatter ─── */
function fmtDate(d: string, long = false) {
  return new Date(d).toLocaleDateString('en-US', {
    month: long ? 'long' : 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function BlogListingClient({ blogs }: BlogListingClientProps) {
  const [email, setEmail] = useState("");
  const heroAnim = useInView(0.15);
  const featuredAnim = useInView(0.08);
  const gridAnim = useInView(0.06);
  const ctaAnim = useInView(0.15);

  const featuredBlog = blogs.find(b => b.is_featured) || blogs[0];
  const regularBlogs = featuredBlog
    ? blogs.filter(b => b.id !== featuredBlog.id)
    : blogs;

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter subscription:", email);
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════
          HERO HEADER  — Full-width editorial intro
          ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Decorative line grid */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[1px] h-full bg-alpha/[0.04]" />
          <div className="absolute top-0 left-1/2 w-[1px] h-full bg-alpha/[0.04]" />
          <div className="absolute top-0 left-3/4 w-[1px] h-full bg-alpha/[0.04]" />
        </div>

        <div
          ref={heroAnim.ref}
          className="max-w-[1440px] mx-auto px-4 md:px-12 py-20 md:py-32 lg:py-40"
        >
          <div className="text-center max-w-4xl mx-auto">
            {/* Animated subtitle */}
            <span className={`inline-flex items-center gap-3 text-[10px] font-primary uppercase tracking-[0.3em] text-alpha/40 mb-5 transition-all duration-1000 ${heroAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className={`h-[1px] bg-alpha/25 transition-all duration-1000 delay-500 ${heroAnim.visible ? 'w-12' : 'w-0'}`} />
              Our Journal
              <span className={`h-[1px] bg-alpha/25 transition-all duration-1000 delay-500 ${heroAnim.visible ? 'w-12' : 'w-0'}`} />
            </span>

            {/* Title with staggered words */}
            <h1 className={`text-5xl md:text-7xl lg:text-8xl font-secondary text-alpha leading-[0.92] tracking-tight mb-8 transition-all duration-1000 delay-200 ${heroAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Stories &{" "}
              <span className="italic font-light">Insights</span>
            </h1>

            {/* Description */}
            <p className={`text-sm md:text-base text-alpha/50 font-primary leading-relaxed max-w-lg mx-auto transition-all duration-1000 delay-400 ${heroAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              Explore our collection of articles on design, craftsmanship, and the art of creating beautiful living spaces.
            </p>

            {/* Scroll indicator */}
            <div className={`mt-14 md:mt-20 transition-all duration-1000 delay-700 ${heroAnim.visible ? 'opacity-100' : 'opacity-0'}`}>
              <div className="w-[1px] h-12 bg-alpha/15 mx-auto relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-alpha/40 animate-blog-scroll-line" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FEATURED ARTICLE  — Cinematic hero card
          ═══════════════════════════════════════════════ */}
      {featuredBlog && (
        <section className="border-t border-black/5">
          <div
            ref={featuredAnim.ref}
            className={`max-w-[1440px] mx-auto px-4 md:px-12 py-12 md:py-20 transition-all duration-1000 ${featuredAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          >
            <Link
              href={`/blogs/${featuredBlog.slug}`}
              className="group cursor-pointer block"
            >
              {/* Cinematic Layout */}
              <div className="relative overflow-hidden bg-alpha">
                <div className="grid grid-cols-1 lg:grid-cols-5">
                  {/* Image — takes 3/5 on desktop */}
                  <div className="lg:col-span-3 relative h-[50vh] md:h-[65vh] lg:h-[75vh] overflow-hidden">
                    <Image
                      src={featuredBlog.featured_image_url}
                      alt={featuredBlog.title}
                      fill
                      className="object-cover transition-transform duration-[2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-alpha/40 via-transparent to-transparent lg:bg-gradient-to-l lg:from-alpha lg:via-alpha/60 lg:to-transparent" />

                    {/* Mobile overlay content */}
                    <div className="lg:hidden absolute inset-0 flex flex-col justify-end p-6 md:p-10">
                      <span className="inline-block self-start px-3 py-1 mb-4 text-[9px] uppercase tracking-[0.2em] bg-white/15 backdrop-blur-sm border border-white/20 text-creme font-primary">
                        Featured
                      </span>
                      <h2 className="text-2xl md:text-4xl font-secondary text-creme leading-tight mb-3">
                        {featuredBlog.title}
                      </h2>
                      <p className="text-xs text-creme/70 font-primary line-clamp-2 mb-4 max-w-md">
                        {featuredBlog.excerpt}
                      </p>
                      <div className="flex items-center gap-3 text-[9px] text-creme/50 font-primary uppercase tracking-wider">
                        <span>{fmtDate(featuredBlog.published_at, true)}</span>
                        {featuredBlog.author_name && (
                          <>
                            <span className="w-1 h-1 bg-creme/30 rounded-full" />
                            <span>By {featuredBlog.author_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Text — takes 2/5 on desktop */}
                  <div className="hidden lg:flex lg:col-span-2 flex-col justify-center px-12 xl:px-16 py-16 bg-alpha text-creme">
                    <span className="inline-block self-start px-3 py-1 mb-8 text-[9px] uppercase tracking-[0.2em] bg-white/10 border border-white/15 font-primary">
                      Featured Story
                    </span>
                    <h2 className="text-3xl xl:text-4xl font-secondary leading-[1.1] mb-6 group-hover:translate-x-1 transition-transform duration-700">
                      {featuredBlog.title}
                    </h2>
                    <p className="text-sm text-creme/60 font-primary leading-relaxed mb-8 max-w-sm">
                      {featuredBlog.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] text-creme/40 font-primary uppercase tracking-wider mb-10">
                      <span>{fmtDate(featuredBlog.published_at, true)}</span>
                      {featuredBlog.author_name && (
                        <>
                          <span className="w-1 h-1 bg-creme/25 rounded-full" />
                          <span>By {featuredBlog.author_name}</span>
                        </>
                      )}
                    </div>
                    <div className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-primary self-start">
                      <span className="relative pb-0.5 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-creme group-hover:after:w-full after:transition-all after:duration-700">
                        Read Article
                      </span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          ARTICLES GRID  — Asymmetric masonry
          ═══════════════════════════════════════════════ */}
      {regularBlogs.length > 0 && (
        <section className="border-t border-black/5">
          <div
            ref={gridAnim.ref}
            className="max-w-[1440px] mx-auto px-4 md:px-12 py-16 md:py-24"
          >
            {/* Section label */}
            <div className={`flex items-center gap-4 mb-12 transition-all duration-1000 ${gridAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <span className="text-[10px] font-primary uppercase tracking-[0.25em] text-alpha/40">
                All Stories
              </span>
              <span className="flex-1 h-[1px] bg-alpha/[0.07]" />
              <span className="text-[10px] font-primary text-alpha/30">
                {regularBlogs.length} article{regularBlogs.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14 md:gap-y-20">
              {regularBlogs.map((blog, i) => (
                <BlogCard
                  key={blog.id}
                  blog={blog}
                  index={i}
                  visible={gridAnim.visible}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {blogs.length === 0 && (
        <section className="py-20 md:py-32">
          <div className="max-w-[1440px] mx-auto px-4 md:px-12">
            <div className="text-center max-w-lg mx-auto">
              <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-alpha/5 flex items-center justify-center">
                <svg className="w-10 h-10 text-alpha/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-secondary text-alpha mb-4">
                No Stories Yet
              </h2>
              <p className="text-base text-alpha/50 font-primary leading-relaxed mb-8">
                We&apos;re crafting inspiring stories about design, craftsmanship, and beautiful living spaces.
              </p>
              <Link
                href="/"
                className="inline-block px-8 py-3 bg-alpha text-creme text-xs uppercase tracking-wider font-primary hover:bg-alpha/90 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          NEWSLETTER CTA  — Dark cinematic section
          ═══════════════════════════════════════════════ */}
      <section className="relative bg-alpha overflow-hidden">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        <div
          ref={ctaAnim.ref}
          className={`max-w-[1440px] mx-auto px-4 md:px-12 py-20 md:py-28 relative z-10 transition-all duration-1000 ${ctaAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="max-w-2xl mx-auto text-center">
            <span className={`inline-flex items-center gap-3 text-[10px] font-primary uppercase tracking-[0.3em] text-creme/35 mb-5 transition-all duration-1000 delay-200 ${ctaAnim.visible ? 'opacity-100' : 'opacity-0'}`}>
              <span className={`h-[1px] bg-creme/20 transition-all duration-1000 delay-600 ${ctaAnim.visible ? 'w-10' : 'w-0'}`} />
              Stay Inspired
              <span className={`h-[1px] bg-creme/20 transition-all duration-1000 delay-600 ${ctaAnim.visible ? 'w-10' : 'w-0'}`} />
            </span>

            <h3 className={`text-3xl md:text-4xl lg:text-5xl font-secondary text-creme leading-tight mb-5 transition-all duration-1000 delay-300 ${ctaAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              Subscribe to Our{" "}
              <span className="italic font-light">Newsletter</span>
            </h3>

            <p className={`text-xs md:text-sm text-creme/40 font-primary mb-10 max-w-md mx-auto leading-relaxed transition-all duration-1000 delay-400 ${ctaAnim.visible ? 'opacity-100' : 'opacity-0'}`}>
              Get the latest articles, design tips, and exclusive insights delivered to your inbox.
            </p>

            <form
              onSubmit={handleNewsletterSubmit}
              className={`flex flex-col sm:flex-row gap-3 max-w-md mx-auto transition-all duration-1000 delay-500 ${ctaAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-5 py-3.5 bg-creme/[0.06] border border-creme/10 text-creme placeholder:text-creme/25 text-sm font-primary focus:outline-none focus:border-creme/30 transition-all duration-500"
              />
              <button
                type="submit"
                className="group px-7 py-3.5 bg-creme text-alpha text-[10px] uppercase tracking-[0.2em] font-primary hover:bg-white transition-colors duration-500 flex items-center justify-center gap-2"
              >
                Subscribe
                <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

/* ═══════════════════════════════════════════════
   BLOG CARD — Staggered reveal article card
   ═══════════════════════════════════════════════ */
function BlogCard({
  blog,
  index,
  visible,
}: {
  blog: BlogPost;
  index: number;
  visible: boolean;
}) {
  // Alternate card style for visual rhythm
  const isLarge = index === 0;

  return (
    <article
      className={`${isLarge ? 'md:col-span-2 lg:col-span-1' : ''} transition-all duration-1000 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
      style={{ transitionDelay: `${200 + index * 150}ms` }}
    >
      <Link
        href={`/blogs/${blog.slug}`}
        className="group cursor-pointer block"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden mb-5 bg-ivory">
          <Image
            src={blog.featured_image_url}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-alpha/5 group-hover:bg-alpha/0 transition-colors duration-700" />

          {/* Read time badge */}
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-[9px] font-primary uppercase tracking-wider text-alpha/70 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
            {readTime(blog.excerpt)}
          </div>

          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-3 text-[9px] text-alpha/35 font-primary uppercase tracking-[0.2em]">
          <span>{fmtDate(blog.published_at, true)}</span>
          {blog.author_name && (
            <>
              <span className="w-1 h-1 bg-alpha/20 rounded-full" />
              <span>{blog.author_name}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-secondary text-alpha leading-snug mb-3 group-hover:text-tango transition-colors duration-500">
          {blog.title}
        </h3>

        {/* Excerpt */}
        <p className="text-xs text-alpha/45 font-primary leading-relaxed mb-4 line-clamp-2">
          {blog.excerpt}
        </p>

        {/* Read more */}
        <span className="inline-flex items-center gap-2.5 text-[10px] uppercase tracking-[0.2em] font-primary text-alpha/50 group-hover:text-alpha transition-colors duration-500">
          <span className="relative pb-0.5 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-alpha/40 group-hover:after:w-full after:transition-all after:duration-700">
            Read More
          </span>
          <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </Link>
    </article>
  );
}
