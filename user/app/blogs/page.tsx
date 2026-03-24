"use client";

import { useState, useEffect } from 'react';
import { ApiClient } from "@/src/lib/api/client";
import BlogListingClient from './BlogListingClient';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  featured_image_url: string;
  author_name: string | null;
  status: string;
  is_featured: boolean;
  published_at: string;
  created_at: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const response = await ApiClient.getBlogPosts();
        const fetchedBlogs = response.results || response;
        setBlogs(fetchedBlogs);
      } catch (err) {
        console.error('Failed to fetch blogs:', err);
        setError('Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <main className="pt-20 bg-creme min-h-screen">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-32">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-alpha/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-alpha/30 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="text-2xl font-secondary text-alpha mb-3">Loading Stories...</h2>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="pt-20 bg-creme min-h-screen">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-32">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-secondary text-alpha mb-3">Unable to Load Blogs</h2>
            <p className="text-alpha/60 font-primary text-sm mb-6">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 bg-creme min-h-screen">
      <BlogListingClient blogs={blogs} />
    </main>
  );
}
