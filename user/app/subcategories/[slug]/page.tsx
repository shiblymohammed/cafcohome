import { Suspense } from 'react';
import { Metadata } from 'next';
import { ApiClient } from '@/src/lib/api/client';
import { generateMetadata as genMeta, generateErrorMetadata } from '@/src/lib/seo/utils';
import { generateBreadcrumbSchema } from '@/src/lib/seo/structured-data';
import SubcategoryClient from './SubcategoryClient';

interface SubcategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SubcategoryPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const subcategory = await ApiClient.getSubcategoryBySlug(slug);

    return genMeta({
      title: `${subcategory.name} - ${subcategory.category_name}`,
      description: subcategory.description,
      image: subcategory.image_url,
      url: `/subcategories/${subcategory.slug}`,
      keywords: [subcategory.name, subcategory.category_name, 'furniture', 'home decor'],
    });
  } catch (error) {
    return generateErrorMetadata(404);
  }
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  try {
    const { slug } = await params;
    const subcategory = await ApiClient.getSubcategoryBySlug(slug);
    
    // Fetch products for this subcategory
    const productsData: any = await ApiClient.getProducts({
      subcategory: subcategory.id.toString(),
      page_size: "100",
    });
    const products = productsData.results || productsData;

    // Fetch all subcategories in the same category for related subcategories
    const allSubcategoriesData: any = await ApiClient.getSubcategories({
      category: subcategory.category.toString(),
    });
    const allSubcategories = allSubcategoriesData.results || allSubcategoriesData;

    // Generate structured data
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Categories', url: '/categories' },
      { name: subcategory.category_name, url: `/categories/${subcategory.category_slug}` },
      { name: subcategory.name, url: `/subcategories/${subcategory.slug}` },
    ]);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <Suspense fallback={<div className="min-h-screen bg-creme pt-20 flex items-center justify-center font-primary text-alpha/60">Loading...</div>}>
          <SubcategoryClient 
            subcategory={subcategory} 
            products={Array.isArray(products) ? products : []} 
            allSubcategories={Array.isArray(allSubcategories) ? allSubcategories : []}
          />
        </Suspense>
      </>
    );
  } catch (error) {
    console.error('Subcategory page error:', error);
    return (
      <div className="bg-creme min-h-screen pt-20">
        <div className="max-w-[1440px] mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-secondary text-alpha mb-3">Subcategory Not Found</h1>
          <p className="text-alpha/60 mb-6">The subcategory you're looking for doesn't exist.</p>
          <a href="/categories" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-primary border-b border-alpha pb-1 hover:text-tango hover:border-tango transition-colors">
            Browse Categories
          </a>
        </div>
      </div>
    );
  }
}
