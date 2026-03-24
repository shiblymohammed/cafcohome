import { Metadata } from 'next';
import { ApiClient } from '@/src/lib/api/client';
import { generateMetadata as genMeta, generateErrorMetadata } from '@/src/lib/seo/utils';
import { generateProductSchema, generateBreadcrumbSchema } from '@/src/lib/seo/structured-data';
import ProductClient from './ProductClient';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await ApiClient.getProductBySlug(slug);
    const variants = await ApiClient.getProductVariants(product.id);
    const defaultVariant = variants.find((v: any) => v.is_default) || variants[0];

    // Get first image from default variant
    const productImage = defaultVariant?.images?.[0]?.url;

    // Build keywords array
    const keywords = [
      product.name,
      product.category_name,
      product.subcategory_name,
      product.brand_name,
      'furniture',
      'home decor',
    ].filter(Boolean);

    return genMeta({
      title: product.name,
      description: product.description,
      image: productImage,
      url: `/product/${product.slug}`,
      type: 'product',
      keywords,
    });
  } catch (error) {
    // Return error metadata with noindex for non-existent products
    return generateErrorMetadata(404);
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const { slug } = await params;
    const product = await ApiClient.getProductBySlug(slug);
    
    // Fetch variants with error handling
    let variants: any[] = [];
    let defaultVariant: any = undefined;
    
    try {
      variants = await ApiClient.getProductVariants(product.id);
      defaultVariant = variants.find((v: any) => v.is_default) || variants[0];
    } catch (err) {
      console.error("Error fetching product variants:", err);
      // Continue without variants - the structured data function will handle undefined variant
    }

    // Fetch related products
    let relatedProducts: any[] = [];
    if (product.subcategory) {
      try {
        const relatedData = await ApiClient.getProducts({
          subcategory: product.subcategory.toString(),
          page_size: "4",
        });
        const relatedArray = relatedData.results || relatedData;
        relatedProducts = (Array.isArray(relatedArray) ? relatedArray : [])
          .filter((p: any) => p.id !== product.id)
          .slice(0, 4);
      } catch (err) {
        console.error("Error fetching related products:", err);
      }
    }

    // Generate structured data with error handling
    let productSchema;
    let breadcrumbSchema;
    
    try {
      productSchema = generateProductSchema(product, defaultVariant);
      breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Categories', url: '/categories' },
        { name: product.category_name, url: `/categories/${product.category_slug}` },
        { name: product.name, url: `/product/${product.slug}` },
      ]);
    } catch (schemaError) {
      console.error('Error generating structured data:', schemaError);
      // Fallback structured data
      productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
      };
      breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [],
      };
    }

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <ProductClient 
          product={product} 
          variants={variants || []} 
          relatedProducts={relatedProducts || []} 
        />
      </>
    );
  } catch (error) {
    console.error('Product page error:', error);
    return (
      <div className="bg-creme min-h-screen pt-20">
        <div className="max-w-[1440px] mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-secondary text-alpha mb-3">Product Not Found</h1>
          <p className="text-alpha/60 mb-6">The product you're looking for doesn't exist.</p>
          <a href="/categories" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-primary border-b border-alpha pb-1 hover:text-tango hover:border-tango transition-colors">
            Browse Categories
          </a>
        </div>
      </div>
    );
  }
}
