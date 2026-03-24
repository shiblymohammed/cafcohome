"use client";

import Image from "next/image";
import { useState } from "react";

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

export default function BlogListingClient({ blogs }: BlogListingClientProps) {
  const [email, setEmail] = useState("");

  // Find featured blog or use first blog
  const featuredBlog = blogs.find(blog => blog.is_featured) || blogs[0];
  // Filter out the featured blog from regular blogs
  const regularBlogs = featuredBlog 
    ? blogs.filter(blog => blog.id !== featuredBlog.id)
    : blogs;

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter submission logic would go here
    console.log("Newsletter subscription:", email);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="py-16 md:py-24 border-b border-black/5">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-3 text-xs font-primary uppercase tracking-[0.25em] text-alpha/60 mb-4">
              <span className="w-8 h-[1px] bg-alpha/30"></span>
              Our Journal
              <span className="w-8 h-[1px] bg-alpha/30"></span>
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-secondary text-alpha leading-[0.95] tracking-tight mb-6">
              Stories & <span className="italic font-light">Insights</span>
            </h1>
            <p className="text-base md:text-lg text-alpha/70 font-primary leading-relaxed max-w-xl mx-auto">
              Explore our collection of articles on design, craftsmanship, and the art of creating beautiful living spaces.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Blog */}
      {featuredBlog && (
        <section className="py-12 md:py-20">
          <div className="max-w-[1440px] mx-auto px-4 md:px-12">
            <a 
              href={`/blogs/${featuredBlog.slug}`}
              className="group cursor-pointer block"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                <div className="relative aspect-[4/3] lg:aspect-[4/5] overflow-hidden">
                  <Image
                    src={featuredBlog.featured_image_url}
                    alt={featuredBlog.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-alpha/10 group-hover:bg-alpha/0 transition-colors duration-500" />
                  <span className="absolute top-4 left-4 px-3 py-1 bg-alpha text-creme text-[10px] uppercase tracking-wider font-primary">
                    Featured
                  </span>
                </div>
                <div className="lg:pr-12">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-secondary text-alpha leading-tight mb-4 group-hover:text-tango transition-colors duration-300">
                    {featuredBlog.title}
                  </h2>
                  <p className="text-base md:text-lg text-alpha/70 font-primary leading-relaxed mb-6">
                    {featuredBlog.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-alpha/50 font-primary uppercase tracking-wider">
                    <span>{new Date(featuredBlog.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    {featuredBlog.author_name && (
                      <>
                        <span className="w-1 h-1 bg-alpha/30 rounded-full"></span>
                        <span>By {featuredBlog.author_name}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-8">
                    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold border-b border-alpha pb-1 group-hover:border-tango group-hover:text-tango transition-colors duration-300">
                      Read Article
                      <span className="transform transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      {regularBlogs.length > 0 && (
        <section className="py-12 md:py-20 border-t border-black/5">
          <div className="max-w-[1440px] mx-auto px-4 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {regularBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          </div>
        </section>
      )}

      {blogs.length === 0 && (
        <section className="py-20 md:py-32">
          <div className="max-w-[1440px] mx-auto px-4 md:px-12">
            <div className="text-center max-w-lg mx-auto">
              <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-alpha/5 flex items-center justify-center">
                <svg className="w-10 h-10 text-alpha/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-secondary text-alpha mb-4">
                No Stories Yet
              </h2>
              <p className="text-base text-alpha/60 font-primary leading-relaxed mb-8">
                We're working on bringing you inspiring stories about design, craftsmanship, and beautiful living spaces. Check back soon!
              </p>
              <a 
                href="/"
                className="inline-block px-8 py-3 bg-alpha text-creme text-xs uppercase tracking-wider font-primary hover:bg-alpha/90 transition-colors"
              >
                Back to Home
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-16 md:py-24 bg-alpha">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-flex items-center gap-3 text-xs font-primary uppercase tracking-[0.25em] text-creme/50 mb-4">
              <span className="w-8 h-[1px] bg-creme/30"></span>
              Stay Inspired
              <span className="w-8 h-[1px] bg-creme/30"></span>
            </span>
            <h3 className="text-3xl md:text-4xl font-secondary text-creme leading-tight mb-4">
              Subscribe to Our <span className="italic font-light">Newsletter</span>
            </h3>
            <p className="text-sm text-creme/60 font-primary mb-8">
              Get the latest articles, design tips, and exclusive insights delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 bg-creme/10 border border-creme/20 text-creme placeholder:text-creme/40 text-sm font-primary focus:outline-none focus:border-creme/40 transition-colors"
              />
              <button 
                type="submit"
                className="px-6 py-3 bg-creme text-alpha text-xs uppercase tracking-wider font-primary hover:bg-creme/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

// Blog Card Component
function BlogCard({ blog }: { blog: BlogPost }) {
  return (
    <article>
      <a 
        href={`/blogs/${blog.slug}`}
        className="group cursor-pointer block"
      >
        <div className="relative aspect-[4/3] overflow-hidden mb-5">
          <Image
            src={blog.featured_image_url}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-alpha/20 group-hover:bg-alpha/0 transition-colors duration-500" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
            <span className="px-4 py-2 bg-creme text-alpha text-xs uppercase tracking-wider font-primary">
              Read More
            </span>
          </div>
        </div>
        <h3 className="text-xl md:text-2xl font-secondary text-alpha leading-snug mb-3 group-hover:text-tango transition-colors duration-300">
          {blog.title}
        </h3>
        <p className="text-sm text-alpha/60 font-primary leading-relaxed mb-4 line-clamp-2">
          {blog.excerpt}
        </p>
        <div className="flex items-center gap-3 text-[10px] text-alpha/40 font-primary uppercase tracking-wider">
          <span>{new Date(blog.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          {blog.author_name && (
            <>
              <span className="w-1 h-1 bg-alpha/30 rounded-full"></span>
              <span>By {blog.author_name}</span>
            </>
          )}
        </div>
      </a>
    </article>
  );
}
