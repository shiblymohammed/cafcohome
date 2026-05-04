"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ApiClient, ApiClientError } from "@/src/lib/api/client";

interface Category {
  id: number;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  image_url: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  product_count: number;
  created_at: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        const data: any = await ApiClient.getCategories();
        
        // Handle paginated response
        const categoriesData = data.results || data;
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setError(null);
      } catch (err) {
        console.error('Failed to load categories:', err);
        if (err instanceof ApiClientError) {
          setError(err.error.message);
        } else {
          setError('Failed to load categories. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  const featuredCategory = categories.find(c => c.is_featured);
  const otherCategories = categories.filter(c => c.id !== featuredCategory?.id);

  if (loading) {
    return (
      <main className="bg-creme min-h-screen pt-16 md:pt-20 lg:pt-24 flex items-center justify-center">
        <div className="text-center py-20">
          <div className="inline-block w-16 h-16 border-4 border-alpha/20 border-t-alpha rounded-full animate-spin mb-6"></div>
          <p className="text-alpha/60 font-primary text-sm">Loading categories...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-creme min-h-screen pt-16 md:pt-20 lg:pt-24 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 font-primary mb-6 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-alpha text-creme text-xs uppercase tracking-wider font-medium hover:bg-alpha/90 transition-all rounded-lg"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-creme min-h-screen pt-16 md:pt-20 lg:pt-24">
      {/* Hero Section - Full Width */}
      <section className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-alpha/20 via-alpha/40 to-alpha/80" />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-4 md:px-8 lg:px-12 pb-8 md:pb-12 lg:pb-16">
            <div className="max-w-[1600px] mx-auto">
              <p className="text-[10px] md:text-xs font-primary uppercase tracking-[0.3em] text-creme/70 mb-2">
                Discover Your Style
              </p>
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-secondary text-creme font-light tracking-tight mb-4 md:mb-6">
                Shop by Category
              </h1>
              <p className="text-sm md:text-base text-creme/80 font-primary leading-relaxed max-w-2xl">
                Explore our curated collection of furniture organized by room and lifestyle. 
                Each category is thoughtfully designed to help you create the perfect space.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Category - Full Width */}
      {featuredCategory && (
        <section className="py-0">
          <Link
            href={`/categories/${featuredCategory.slug}`}
            className="group block"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Image */}
              <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[600px] overflow-hidden">
                <Image
                  src={featuredCategory.image_url}
                  alt={featuredCategory.name}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-alpha/10 to-transparent lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500" />
                <span className="absolute top-4 left-4 md:top-6 md:left-6 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] uppercase tracking-wider font-medium rounded-full shadow-lg">
                  Featured Category
                </span>
              </div>
              
              {/* Content */}
              <div className="flex items-center bg-white lg:bg-transparent">
                <div className="w-full px-6 py-10 md:px-12 md:py-16 lg:px-16 lg:py-20">
                  <span className="text-[10px] md:text-xs font-primary uppercase tracking-[0.3em] text-alpha/50 mb-3 block">
                    {featuredCategory.subtitle}
                  </span>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-secondary text-alpha leading-tight mb-4 md:mb-6 group-hover:text-alpha/80 transition-colors duration-300">
                    {featuredCategory.name}
                  </h2>
                  <p className="text-sm md:text-base text-alpha/70 font-primary leading-relaxed mb-6">
                    {featuredCategory.description}
                  </p>
                  <div className="flex items-center gap-6 mb-8">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl md:text-3xl font-secondary text-alpha">{featuredCategory.product_count}</span>
                      <span className="text-xs text-alpha/50 font-primary uppercase tracking-wider">Pieces</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-3 text-xs md:text-sm uppercase tracking-wider font-medium text-alpha group-hover:text-alpha/70 transition-colors duration-300">
                    Explore Collection
                    <svg className="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* All Categories Grid */}
      <section className="py-12 md:py-20 lg:py-24">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="text-center mb-10 md:mb-16">
            <p className="text-[10px] md:text-xs font-primary uppercase tracking-[0.3em] text-alpha/50 mb-2">
              All Collections
            </p>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-secondary text-alpha font-light tracking-tight">
              Browse by Room
            </h2>
          </div>

          {otherCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-1 lg:gap-2">
              {otherCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-alpha/5 rounded-2xl">
              <p className="text-alpha/60 font-primary">No categories available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - Full Width */}
      <section className="relative py-16 md:py-24 lg:py-32 bg-gradient-to-br from-alpha via-alpha/95 to-alpha/90 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>
        <div className="relative max-w-[1200px] mx-auto px-4 md:px-8 text-center">
          <p className="text-[10px] md:text-xs font-primary uppercase tracking-[0.3em] text-creme/50 mb-3">
            Personalized Service
          </p>
          <h3 className="text-2xl md:text-4xl lg:text-5xl font-secondary text-creme font-light tracking-tight mb-6">
            Need Help Choosing?
          </h3>
          <p className="text-sm md:text-base text-creme/70 font-primary mb-10 max-w-2xl mx-auto leading-relaxed">
            Our design consultants are here to help you select pieces that perfectly complement your space and lifestyle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-creme text-alpha text-xs uppercase tracking-wider font-medium hover:bg-creme/90 transition-all rounded-lg shadow-xl"
            >
              Book Consultation
            </Link>
            <Link
              href="/subcategories"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-creme/30 text-creme text-xs uppercase tracking-wider font-medium hover:bg-creme/10 transition-all rounded-lg"
            >
              View Subcategories
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group block relative aspect-[3/4] overflow-hidden"
    >
      <Image
        src={category.image_url}
        alt={category.name}
        fill
        className="object-cover transition-transform duration-1000 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-alpha via-alpha/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
        <p className="text-[10px] font-primary uppercase tracking-[0.3em] text-creme/60 mb-2">
          {category.subtitle}
        </p>
        <h3 className="text-xl md:text-2xl lg:text-3xl font-secondary text-creme tracking-tight mb-3 transform transition-transform duration-300 group-hover:translate-x-2">
          {category.name}
        </h3>
        <p className="text-xs md:text-sm text-creme/70 font-primary leading-relaxed mb-4 line-clamp-2">
          {category.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-creme/60 font-primary uppercase tracking-wider">
            {category.product_count} Pieces
          </span>
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-creme opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            View
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
