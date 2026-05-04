import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApiClient } from '@/src/lib/api/client';
import { generateMetadata as genMeta } from '@/src/lib/seo/utils';
import { generateBreadcrumbSchema } from '@/src/lib/seo/structured-data';
import CategoryClient from './CategoryClient';

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

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  featured_icon_url: string;
  category: number;
  category_name: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  product_count: number;
  created_at: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  colors: string[];
  materials: string[];
  category: number;
  category_name: string;
  category_slug: string;
  subcategory: number;
  subcategory_name: string;
  subcategory_slug: string;
  brand: number | null;
  brand_name: string | null;
  brand_slug: string | null;
  images: Array<{
    url: string;
    alt?: string;
    order?: number;
  }>;
  is_bestseller: boolean;
  is_hot_selling: boolean;
  is_in_stock: boolean;
  created_at: string;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    // Fetch all categories and find the one with matching slug
    const categoriesResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/v1/categories/`,
      { next: { revalidate: 3600 } }
    );
    
    if (!categoriesResponse.ok) {
      return genMeta({
        title: 'Category Not Found',
        description: 'The category you are looking for does not exist.',
        noindex: true,
      });
    }

    const categoriesData = await categoriesResponse.json();
    const categories = categoriesData.results || categoriesData;
    const category = Array.isArray(categories) 
      ? categories.find((c: Category) => c.slug === slug)
      : null;

    if (!category) {
      return genMeta({
        title: 'Category Not Found',
        description: 'The category you are looking for does not exist.',
        noindex: true,
      });
    }

    return genMeta({
      title: category.name,
      description: category.description || `Explore the ${category.name} category. ${category.subtitle}`,
      image: category.image_url,
      url: `/categories/${category.slug}`,
      keywords: [
        category.name,
        category.subtitle,
        'furniture category',
        'home decor',
        'furniture',
      ].filter(Boolean),
    });
  } catch (error) {
    console.error('Error generating category metadata:', error);
    return genMeta({
      title: 'Category Not Found',
      description: 'The category you are looking for does not exist.',
      noindex: true,
    });
  }
}

export default async function CategoryProductsPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    // Fetch all categories and find the one with matching slug
    const categoriesResponse: any = await ApiClient.getCategories();
    const categoriesData = categoriesResponse.results || categoriesResponse;
    const allCategoriesArray = Array.isArray(categoriesData) ? categoriesData : [];
    
    const category = allCategoriesArray.find((c: Category) => c.slug === slug);
    
    if (!category) {
      notFound();
    }

    // Fetch subcategories for this category using category ID
    const subcategoriesResponse: any = await ApiClient.getSubcategories({ category: category.id.toString() });
    const subcategoriesData = subcategoriesResponse.results || subcategoriesResponse;
    const subcategoriesArray = Array.isArray(subcategoriesData) ? subcategoriesData : [];
    const subcategories = subcategoriesArray.filter((c: Subcategory) => c.is_active);

    // Fetch products for this category using category ID
    const productsResponse: any = await ApiClient.getProducts({ category: category.id.toString() });
    const productsData = productsResponse.results || productsResponse;
    const products = Array.isArray(productsData) ? productsData : [];

    // Filter active categories for related section
    const allCategories = allCategoriesArray.filter((c: Category) => c.is_active);

    // Generate breadcrumb structured data
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Categories', url: '/categories' },
      { name: category.name, url: `/categories/${category.slug}` },
    ]);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <Suspense fallback={<div className="min-h-screen bg-creme pt-20 flex items-center justify-center font-primary text-alpha/60">Loading...</div>}>
          <CategoryClient
            category={category}
            subcategories={subcategories}
            products={products}
            allCategories={allCategories}
          />
        </Suspense>
      </>
    );
  } catch (error) {
    console.error('Failed to load category data:', error);
    notFound();
  }
}
