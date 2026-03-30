"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import "../blog.css";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url: string;
  author_name: string | null;
  meta_title: string;
  meta_description: string;
  status: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

interface BlogDetailClientProps {
  blog: BlogPost;
}

/* ─── InView hook ─── */
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

export default function BlogDetailClient({ blog }: BlogDetailClientProps) {
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroAnim = useInView(0.05);
  const contentAnim = useInView(0.05);
  const shareAnim = useInView(0.15);
  const ctaAnim = useInView(0.15);

  /* ─── Scroll progress bar ─── */
  useEffect(() => {
    const handleScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const readTime = (content: string) => {
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return `${Math.ceil(words / 200)} min read`;
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(blog.title);
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };
    if (urls[platform]) window.open(urls[platform], '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter subscription:", email);
  };

  return (
    <>
      {/* ═══ Reading Progress Bar ═══ */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-transparent">
        <div
          className="h-full bg-alpha/70 transition-[width] duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ═══════════════════════════════════════════════
          HERO — Immersive full-screen image with overlay
          ═══════════════════════════════════════════════ */}
      <section ref={heroAnim.ref} className="relative min-h-[60vh] md:min-h-[75vh] lg:min-h-[85vh] flex items-end overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={blog.featured_image_url}
            alt={blog.title}
            fill
            className={`object-cover transition-all duration-[2s] ease-[cubic-bezier(0.22,1,0.36,1)] ${heroAnim.visible ? 'scale-100' : 'scale-110'}`}
            priority
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-alpha via-alpha/50 to-alpha/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-alpha/30 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 md:px-12 pb-12 md:pb-16 lg:pb-20">
          {/* Back button */}
          <Link
            href="/blogs"
            className={`inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-primary text-creme/60 hover:text-creme transition-all duration-500 mb-8 md:mb-12 ${heroAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '200ms' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Back to Journal
          </Link>

          <div className="max-w-3xl">
            {/* Meta row */}
            <div className={`flex flex-wrap items-center gap-3 mb-5 text-[10px] text-creme/50 font-primary uppercase tracking-[0.2em] transition-all duration-1000 delay-300 ${heroAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <span>{formatDate(blog.published_at)}</span>
              <span className="w-1 h-1 bg-creme/30 rounded-full" />
              <span>{readTime(blog.content)}</span>
              {blog.author_name && (
                <>
                  <span className="w-1 h-1 bg-creme/30 rounded-full" />
                  <span>By {blog.author_name}</span>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className={`text-3xl md:text-5xl lg:text-6xl font-secondary text-creme leading-[1.05] tracking-tight transition-all duration-1000 delay-400 ${heroAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {blog.title}
            </h1>
          </div>
        </div>

        {/* Scroll hint */}
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-800 ${heroAnim.visible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-[1px] h-8 bg-creme/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-creme/60 animate-blog-scroll-line" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          ARTICLE BODY  — Clean editorial layout
          ═══════════════════════════════════════════════ */}
      <section className="bg-creme relative">
        {/* Decorative side lines - desktop only */}
        <div className="hidden lg:block absolute top-0 left-[calc(50%-380px)] w-[1px] h-full bg-alpha/[0.04]" />
        <div className="hidden lg:block absolute top-0 right-[calc(50%-380px)] w-[1px] h-full bg-alpha/[0.04]" />

        <div
          ref={contentAnim.ref}
          className={`max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24 transition-all duration-1000 ${contentAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        >
          {/* Lead excerpt */}
          <p className={`text-lg md:text-xl lg:text-2xl text-alpha/70 font-secondary italic leading-relaxed mb-12 md:mb-16 pb-12 md:pb-16 border-b border-alpha/10 transition-all duration-1000 delay-200 ${contentAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            {blog.excerpt}
          </p>

          {/* Main Content */}
          <div
            className={`blog-content transition-all duration-1000 delay-300 ${contentAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* ─── Share & Social ─── */}
          <div
            ref={shareAnim.ref}
            className={`mt-16 md:mt-20 pt-10 border-t border-alpha/10 transition-all duration-1000 ${shareAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <span className="block text-[10px] uppercase tracking-[0.25em] font-primary text-alpha/35 mb-1">
                  Share this story
                </span>
                <span className="text-xs text-alpha/50 font-primary">
                  Enjoyed this read? Pass it along.
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Twitter/X */}
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-11 h-11 flex items-center justify-center border border-alpha/10 hover:bg-alpha hover:text-creme hover:border-alpha transition-all duration-500 group"
                  aria-label="Share on X"
                >
                  <svg className="w-4 h-4 transition-transform duration-500 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>

                {/* Facebook */}
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-11 h-11 flex items-center justify-center border border-alpha/10 hover:bg-alpha hover:text-creme hover:border-alpha transition-all duration-500 group"
                  aria-label="Share on Facebook"
                >
                  <svg className="w-4 h-4 transition-transform duration-500 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={() => handleShare('linkedin')}
                  className="w-11 h-11 flex items-center justify-center border border-alpha/10 hover:bg-alpha hover:text-creme hover:border-alpha transition-all duration-500 group"
                  aria-label="Share on LinkedIn"
                >
                  <svg className="w-4 h-4 transition-transform duration-500 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>
                </button>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className={`w-11 h-11 flex items-center justify-center border transition-all duration-500 group ${
                    copied
                      ? 'bg-success text-creme border-success'
                      : 'border-alpha/10 hover:bg-alpha hover:text-creme hover:border-alpha'
                  }`}
                  aria-label="Copy link"
                >
                  {copied ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 transition-transform duration-500 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ─── Back to all articles ─── */}
          <div className="mt-12 pt-10 border-t border-alpha/10">
            <Link
              href="/blogs"
              className="group inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-primary text-alpha/50 hover:text-alpha transition-colors duration-500"
            >
              <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              <span className="relative pb-0.5 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-alpha/30 group-hover:after:w-full after:transition-all after:duration-700">
                Back to All Stories
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          NEWSLETTER CTA
          ═══════════════════════════════════════════════ */}
      <section className="relative bg-alpha overflow-hidden">
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

            <h3 className={`text-3xl md:text-4xl font-secondary text-creme leading-tight mb-5 transition-all duration-1000 delay-300 ${ctaAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
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
