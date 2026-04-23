"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ApiClient } from "@/src/lib/api/client";
import { motion, Variants } from "framer-motion";

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

export default function BlogSection() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    try {
      const response = await ApiClient.getBlogPosts();
      const allBlogs = response.results || response;
      const featuredBlogs = allBlogs.filter((blog: BlogPost) => blog.is_featured);
      const regularBlogs = allBlogs.filter((blog: BlogPost) => !blog.is_featured);
      const displayBlogs = [...featuredBlogs, ...regularBlogs].slice(0, 3);
      setBlogs(displayBlogs);
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  if (blogs.length === 0) {
    return (
      <section className="bg-creme border-t border-black/5">
        <div className="max-w-[1920px] mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-2xl mx-auto">
            <span className="block text-xs font-primary uppercase tracking-[0.25em] text-alpha/60 mb-1.5">
              The Journal
            </span>
            <h2 className="text-4xl md:text-6xl font-secondary text-alpha tracking-tight mb-8">
              Design Notes
            </h2>

            <div className="py-12 md:py-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-alpha/5 flex items-center justify-center">
                <svg className="w-8 h-8 text-alpha/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl md:text-3xl font-secondary text-alpha mb-4 italic">
                Stories Coming Soon
              </h3>
              <p className="text-sm md:text-base text-alpha/60 font-primary leading-relaxed max-w-md mx-auto">
                We're curating inspiring stories about design, craftsmanship, and the art of creating beautiful living spaces.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const featuredBlog = blogs[0];
  const sidebarBlogs = blogs.slice(1);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
  };

  const staggerSidebar: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
  };

  return (
    <section className="bg-creme border-t border-black/5 overflow-hidden">

      {/* Editorial Header */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-[1920px] mx-auto px-4 pt-20 pb-12 md:pt-28 md:pb-16 text-center border-b border-black/5"
      >
        <motion.span variants={fadeUp} className="inline-flex items-center gap-3 text-[10px] font-primary uppercase tracking-[0.3em] text-alpha/50 mb-3">
          <span className="w-10 h-[1px] bg-alpha/30" />
          The Journal
          <span className="w-10 h-[1px] bg-alpha/30" />
        </motion.span>
        <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl lg:text-7xl font-secondary text-alpha tracking-tight">
          Design <span className="italic font-light">Notes</span>
        </motion.h2>
      </motion.div>

      {/* Magazine Grid */}
      <div className="max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 border-b border-black/5">

          {/* Main Feature — Spans 2 cols on desktop */}
          <div className="md:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <Link href={`/blogs/${featuredBlog.slug}`} className="group relative cursor-pointer block md:min-h-[80vh] overflow-hidden h-full">
                <div className="relative h-[60vh] md:h-full w-full overflow-hidden">
                  <Image
                    src={featuredBlog.featured_image_url}
                    alt={featuredBlog.title}
                    fill
                    className="object-cover transition-transform duration-[2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-alpha/70 via-alpha/20 to-transparent" />

                  {/* Overlay Content */}
                  <div className="absolute inset-0 p-6 md:p-12 lg:p-16 flex flex-col justify-end">
                    <div className="max-w-xl text-creme">
                      <span className="inline-block px-3 py-1 mb-4 text-[9px] uppercase tracking-[0.2em] bg-white/15 backdrop-blur-sm border border-white/20 font-primary">
                        Featured Story
                      </span>

                      <div className="flex items-center gap-4 mb-4 text-[10px] font-primary uppercase tracking-widest opacity-80">
                        {featuredBlog.author_name && <span>{featuredBlog.author_name}</span>}
                        <span className="w-6 h-[1px] bg-creme/50" />
                        <span>{formatDate(featuredBlog.published_at)}</span>
                      </div>

                      <h3 className="text-2xl md:text-4xl lg:text-5xl font-secondary leading-[1.1] mb-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-700">
                        {featuredBlog.title}
                      </h3>

                      <p className="text-sm md:text-base font-primary leading-relaxed opacity-80 hidden md:block max-w-md mb-6">
                        {featuredBlog.excerpt}
                      </p>

                      <div className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-primary group/link">
                        <span className="relative pb-0.5 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-creme group-hover:after:w-full after:transition-all after:duration-500">
                          Read Story
                        </span>
                        <svg className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Sidebar Column */}
          <motion.div
            variants={staggerSidebar}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="md:col-span-1 flex flex-col border-t md:border-t-0 md:border-l border-black/5"
          >
            {/* Sidebar Blogs */}
            {sidebarBlogs.length > 0 && sidebarBlogs.map((blog) => (
              <motion.div variants={fadeUp} key={blog.id} className="hidden md:flex flex-1">
                <Link
                  href={`/blogs/${blog.slug}`}
                  className="group relative flex-1 cursor-pointer overflow-hidden bg-white hover:bg-ivory transition-all duration-700 flex flex-col border-b border-black/5 last:border-b-0"
                >
                  <div className="relative h-48 lg:h-56 overflow-hidden">
                    <Image
                      src={blog.featured_image_url}
                      alt={blog.title}
                      fill
                      className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-alpha/5 group-hover:bg-alpha/0 transition-colors duration-700" />
                  </div>
                  <div className="p-6 lg:p-8 flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2.5 text-[9px] font-primary uppercase tracking-[0.2em] text-alpha/40">
                      {blog.author_name && <span>{blog.author_name}</span>}
                      <span>•</span>
                      <span>{formatDate(blog.published_at)}</span>
                    </div>
                    <h3 className="text-lg lg:text-xl font-secondary text-alpha mb-2 group-hover:text-tango transition-colors duration-500 leading-snug">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-alpha/50 font-primary leading-relaxed line-clamp-2">
                      {blog.excerpt}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* Sidebar blog cards on mobile - horizontal scroll */}
            {sidebarBlogs.length > 0 && (
              <motion.div variants={fadeUp} className="md:hidden flex gap-4 px-4 py-6 overflow-x-auto scrollbar-hide">
                {sidebarBlogs.map((blog) => (
                  <Link
                    href={`/blogs/${blog.slug}`}
                    key={blog.id}
                    className="group flex-shrink-0 w-[75vw] cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden mb-3">
                      <Image src={blog.featured_image_url} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="flex items-center gap-2 mb-1.5 text-[9px] font-primary uppercase tracking-[0.15em] text-alpha/40">
                      <span>{formatDate(blog.published_at)}</span>
                    </div>
                    <h3 className="text-base font-secondary text-alpha leading-snug">
                      {blog.title}
                    </h3>
                  </Link>
                ))}
              </motion.div>
            )}

            {/* Empty state for sidebar when only 1 blog */}
            {sidebarBlogs.length === 0 && (
              <div className="hidden md:flex flex-1 bg-white items-center justify-center p-12 text-center">
                <div className="max-w-xs">
                  <p className="text-xs text-alpha/40 font-primary uppercase tracking-wider">
                    More stories coming soon
                  </p>
                </div>
              </div>
            )}

            {/* Newsletter Block */}
            <motion.div
              variants={fadeUp}
              className="bg-alpha text-creme p-8 md:p-10 lg:p-12 flex flex-col justify-center items-center text-center"
            >
              <span className="text-[9px] font-primary uppercase tracking-[0.3em] mb-5 opacity-50">
                Newsletter
              </span>
              <h3 className="text-xl md:text-2xl font-secondary mb-4 italic leading-snug">
                Join the Inner Circle
              </h3>
              <p className="text-[11px] font-primary leading-relaxed opacity-50 mb-6 max-w-[240px] mx-auto">
                Subscribe for exclusive access to new drops, events, and design stories.
              </p>
              <div className="w-full max-w-[240px] relative group">
                <input
                  suppressHydrationWarning
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-transparent border-b border-creme/20 py-2 text-[10px] uppercase tracking-wider placeholder:text-creme/25 focus:outline-none focus:border-creme/50 transition-colors duration-500 text-center"
                />
                <button suppressHydrationWarning className="absolute right-0 top-0 bottom-0 text-[9px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity duration-300">
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* View All Stories Link */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="hidden md:block py-12 text-center"
      >
        <Link href="/blogs" className="group inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-primary text-alpha/60 hover:text-alpha transition-colors duration-500">
          <span className="relative pb-0.5 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-alpha/20 group-hover:after:bg-alpha after:transition-colors after:duration-500">
            Read All Stories
          </span>
          <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </motion.div>
    </section>
  );
}
