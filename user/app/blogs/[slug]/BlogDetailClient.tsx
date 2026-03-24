"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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

export default function BlogDetailClient({ blog }: BlogDetailClientProps) {
  const [email, setEmail] = useState("");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(blog.title);

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter submission logic would go here
    console.log("Newsletter subscription:", email);
  };

  return (
    <>
      <section className="py-12 md:py-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12">
          {/* Back Button */}
          <Link 
            href="/blogs"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-primary text-alpha/60 hover:text-alpha transition-colors mb-8"
          >
            <span>←</span>
            Back to All Articles
          </Link>

          {/* Article Header */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-secondary text-alpha leading-tight mb-6">
                {blog.title}
              </h1>
              <div className="flex items-center justify-center gap-4 text-xs text-alpha/50 font-primary uppercase tracking-wider">
                <span>{formatDate(blog.published_at)}</span>
                <span className="w-1 h-1 bg-alpha/30 rounded-full"></span>
                <span>{calculateReadTime(blog.content)}</span>
                {blog.author_name && (
                  <>
                    <span className="w-1 h-1 bg-alpha/30 rounded-full"></span>
                    <span>By {blog.author_name}</span>
                  </>
                )}
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative aspect-[16/9] overflow-hidden mb-12">
              <Image
                src={blog.featured_image_url}
                alt={blog.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-3xl mx-auto">
              {/* Excerpt */}
              <p className="text-lg md:text-xl text-alpha/80 font-primary leading-relaxed mb-8">
                {blog.excerpt}
              </p>
              
              {/* Main Content - Render HTML */}
              <div 
                className="blog-content space-y-6 text-base text-alpha/70 font-primary leading-loose"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              {/* Share Section */}
              <div className="mt-12 pt-8 border-t border-alpha/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-primary text-alpha/50">Share this article</span>
                  <div className="flex items-center gap-4">
                    {/* Twitter */}
                    <button 
                      onClick={() => handleShare('twitter')}
                      className="w-10 h-10 flex items-center justify-center border border-alpha/20 hover:bg-alpha hover:text-creme transition-colors"
                      aria-label="Share on Twitter"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                    </button>
                    
                    {/* Facebook */}
                    <button 
                      onClick={() => handleShare('facebook')}
                      className="w-10 h-10 flex items-center justify-center border border-alpha/20 hover:bg-alpha hover:text-creme transition-colors"
                      aria-label="Share on Facebook"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                    </button>
                    
                    {/* LinkedIn */}
                    <button 
                      onClick={() => handleShare('linkedin')}
                      className="w-10 h-10 flex items-center justify-center border border-alpha/20 hover:bg-alpha hover:text-creme transition-colors"
                      aria-label="Share on LinkedIn"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>
                    </button>
                    
                    {/* Copy Link */}
                    <button 
                      onClick={handleCopyLink}
                      className="w-10 h-10 flex items-center justify-center border border-alpha/20 hover:bg-alpha hover:text-creme transition-colors"
                      aria-label="Copy link"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
