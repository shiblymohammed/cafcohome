import { Metadata } from 'next';
import Link from "next/link";
import { ApiClient } from '@/src/lib/api/client';
import { generateMetadata as genMeta } from '@/src/lib/seo/utils';
import { generateArticleSchema, generateBreadcrumbSchema } from '@/src/lib/seo/structured-data';
import BlogDetailClient from './BlogDetailClient';

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const blog = await ApiClient.getBlogPostBySlug(slug);

    return genMeta({
      title: blog.meta_title || blog.title,
      description: blog.meta_description || blog.excerpt,
      image: blog.featured_image_url,
      url: `/blogs/${blog.slug}`,
      type: 'article',
      publishedTime: blog.published_at,
      modifiedTime: blog.updated_at,
      author: blog.author_name || undefined,
      keywords: [blog.title, 'furniture', 'home decor', 'design tips', 'interior design'],
    });
  } catch (error) {
    return genMeta({
      title: 'Article Not Found',
      description: 'The article you are looking for does not exist.',
      noindex: true,
    });
  }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  let blog: BlogPost | null = null;
  let error: string | null = null;

  try {
    const { slug } = await params;
    blog = await ApiClient.getBlogPostBySlug(slug);
  } catch (err) {
    console.error('Failed to fetch blog:', err);
    error = 'Failed to load blog post';
  }

  if (error || !blog) {
    return (
      <main className="pt-20 bg-creme min-h-screen">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-secondary text-alpha mb-3">Article Not Found</h1>
            <p className="text-alpha/60 mb-6">{error || "The article you're looking for doesn't exist."}</p>
            <Link 
              href="/blogs" 
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-primary border-b border-alpha pb-1 hover:text-tango hover:border-tango transition-colors"
            >
              ← Back to All Articles
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Generate structured data
  const articleSchema = generateArticleSchema({
    title: blog.title,
    excerpt: blog.excerpt,
    featured_image_url: blog.featured_image_url,
    published_at: blog.published_at,
    updated_at: blog.updated_at,
    author_name: blog.author_name || undefined,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blogs' },
    { name: blog.title, url: `/blogs/${blog.slug}` },
  ]);

  return (
    <main className="pt-20 bg-creme min-h-screen">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <BlogDetailClient blog={blog} />
    </main>
  );
}
