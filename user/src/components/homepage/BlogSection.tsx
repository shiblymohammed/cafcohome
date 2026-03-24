"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ApiClient } from "@/src/lib/api/client";

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

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await ApiClient.getBlogPosts();
      const allBlogs = response.results || response;
      
      // Get featured blogs first, then fill with regular blogs to get 3 total
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

  // Don't show section while loading
  if (loading) {
    return null;
  }

  // Show empty state if no blogs available
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

            {/* Newsletter CTA */}
            <div className="mt-8 pt-8 border-t border-black/5">
              <p className="text-xs font-primary uppercase tracking-wider text-alpha/50 mb-4">
                Be the first to know
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white border border-black/10 text-alpha placeholder:text-alpha/40 text-sm font-primary focus:outline-none focus:border-alpha/30 transition-colors"
                />
                <button className="px-6 py-3 bg-alpha text-creme text-xs uppercase tracking-wider font-primary hover:bg-alpha/90 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const featuredBlog = blogs[0];
  const sidebarBlogs = blogs.slice(1);

  return (
    <section className="bg-creme border-t border-black/5">

      {/* Editorial Header */}
      <div className="max-w-[1920px] mx-auto px-4 py-16 md:py-24 text-center border-b border-black/5">
        <span className="block text-xs font-primary uppercase tracking-[0.25em] text-alpha/60 mb-1.5">
          The Journal
        </span>
        <h2 className="text-4xl md:text-6xl font-secondary text-alpha tracking-tight">
          Design Notes
        </h2>
      </div>

      {/* Magazine Grid */}
      <div className="max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black/5 border-b border-black/5">

          {/* Main Feature - Spans 2 cols on desktop */}
          <Link href={`/blogs/${featuredBlog.slug}`} className="md:col-span-2 group relative cursor-pointer md:min-h-[80vh] block">
            <div className="relative h-[60vh] md:h-full w-full overflow-hidden">
              <Image
                src={featuredBlog.featured_image_url}
                alt={featuredBlog.title}
                fill
                className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-alpha/10 group-hover:bg-alpha/0 transition-colors duration-700" />

              {/* Overlay Content */}
              <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-end">
                <div className="max-w-xl text-creme transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                  <div className="flex items-center gap-4 mb-4 text-xs font-primary uppercase tracking-widest opacity-90">
                    {featuredBlog.author_name && <span>{featuredBlog.author_name}</span>}
                    <span className="w-8 h-[1px] bg-creme/60" />
                    <span>{new Date(featuredBlog.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <h3 className="text-3xl md:text-5xl font-secondary leading-tight mb-6">
                    {featuredBlog.title}
                  </h3>
                  <p className="text-sm md:text-base font-primary leading-relaxed opacity-90 hidden md:block max-w-md">
                    {featuredBlog.excerpt}
                  </p>
                  <div className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-widest border-b border-transparent group-hover:border-creme transition-colors duration-500">
                    Read Story
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Sidebar Column - Stacked Items */}
          <div className="md:col-span-1 flex flex-col divide-y divide-black/5">
            {/* Sidebar blogs - hidden on mobile, visible on desktop */}
            {sidebarBlogs.length > 0 && sidebarBlogs.map((blog) => (
              <Link href={`/blogs/${blog.slug}`} key={blog.id} className="hidden md:block group relative flex-1 min-h-[40vh] md:min-h-0 cursor-pointer overflow-hidden bg-white hover:bg-ivory transition-colors duration-500">
                <div className="relative h-2/3 overflow-hidden">
                  <Image
                    src={blog.featured_image_url}
                    alt={blog.title}
                    fill
                    className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                  />
                </div>
                <div className="p-8 h-1/3 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-3 text-[0.6rem] font-primary uppercase tracking-widest text-alpha/60">
                    {blog.author_name && <span>{blog.author_name}</span>}
                    <span>•</span>
                    <span>{new Date(blog.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-secondary text-alpha mb-3 group-hover:text-tango transition-colors duration-300">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-alpha/70 font-primary leading-relaxed line-clamp-2">
                    {blog.excerpt}
                  </p>
                </div>
              </Link>
            ))}

            {/* Empty state for sidebar when only 1 blog exists */}
            {sidebarBlogs.length === 0 && (
              <div className="hidden md:flex flex-1 bg-white items-center justify-center p-12 text-center">
                <div className="max-w-xs">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-alpha/5 flex items-center justify-center">
                    <svg className="w-6 h-6 text-alpha/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p className="text-xs text-alpha/40 font-primary uppercase tracking-wider">
                    More stories coming soon
                  </p>
                </div>
              </div>
            )}

            {/* Newsletter Block */}
            <div className="flex-1 bg-alpha text-creme p-8 md:p-12 flex flex-col justify-center items-center text-center">
              <span className="text-[0.6rem] font-primary uppercase tracking-[0.3em] mb-6 opacity-60">
                Newsletter
              </span>
              <h3 className="text-2xl md:text-3xl font-secondary mb-6 italic">
                Join the Inner Circle
              </h3>
              <p className="text-xs font-primary leading-relaxed opacity-70 mb-8 max-w-xs mx-auto">
                Subscribe for exclusive access to new drops, events, and design stories.
              </p>
              <div className="w-full max-w-xs relative">
                <input
                  suppressHydrationWarning
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-transparent border-b border-creme/30 py-2 text-xs uppercase tracking-wider placeholder:text-creme/30 focus:outline-none focus:border-creme transition-colors duration-300 text-center"
                />
                <button suppressHydrationWarning className="absolute right-0 top-0 bottom-0 text-[0.6rem] uppercase tracking-widest hover:text-creme/70 transition-colors">
                  Submit
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Footer Link - hidden on mobile, visible on desktop */}
      <div className="hidden md:block mt-12 text-center pb-12">
        <Link href="/blogs" className="inline-block text-xs uppercase tracking-widest border-b border-alpha/30 pb-1 hover:border-alpha transition-colors duration-300">
          Read All Stories
        </Link>
      </div>
    </section>
  );
}
