/**
 * Structured Data Module
 * Generators for JSON-LD structured data (schema.org)
 */

import { seoConfig } from './config';

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

/**
 * Product type interface (minimal for structured data)
 */
export interface ProductData {
  id: number;
  name: string;
  description: string;
  slug: string;
  brand_name?: string;
  updated_at?: string;
}

/**
 * Product variant interface
 */
export interface ProductVariantData {
  sku: string;
  price: string;
  is_in_stock: boolean;
  images?: Array<{ url: string; alt?: string; order?: number }>;
}

/**
 * Blog post interface
 */
export interface BlogPostData {
  title: string;
  excerpt: string;
  featured_image_url?: string;
  published_at: string;
  updated_at: string;
  author_name?: string;
}

/**
 * Generate Product structured data (schema.org/Product)
 * @param product - Product data
 * @param variant - Product variant data
 * @returns Product schema JSON-LD
 */
export function generateProductSchema(
  product: ProductData,
  variant?: ProductVariantData
): StructuredData {
  // Use variant data if available, otherwise use product data as fallback
  const images = variant?.images?.map((img) => img.url) || [];
  const sku = variant?.sku || `${product.slug}-default`;
  const price = variant?.price || '0';
  const isInStock = variant?.is_in_stock ?? true;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: images,
    sku: sku,
    brand: {
      '@type': 'Brand',
      name: product.brand_name || seoConfig.organization.name,
    },
    offers: {
      '@type': 'Offer',
      url: `${seoConfig.siteUrl}/product/${product.slug}`,
      priceCurrency: 'INR',
      price: price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      availability: isInStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
}

/**
 * Generate Breadcrumb structured data (schema.org/BreadcrumbList)
 * @param items - Array of breadcrumb items with name and url
 * @returns BreadcrumbList schema JSON-LD
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${seoConfig.siteUrl}${item.url}`,
    })),
  };
}

/**
 * Generate Article structured data (schema.org/BlogPosting)
 * @param blog - Blog post data
 * @returns BlogPosting schema JSON-LD
 */
export function generateArticleSchema(blog: BlogPostData): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.excerpt,
    image: blog.featured_image_url,
    datePublished: blog.published_at,
    dateModified: blog.updated_at,
    author: {
      '@type': 'Person',
      name: blog.author_name || 'DravoHome Team',
    },
    publisher: {
      '@type': 'Organization',
      name: seoConfig.organization.name,
      logo: {
        '@type': 'ImageObject',
        url: `${seoConfig.siteUrl}${seoConfig.organization.logo}`,
      },
    },
  };
}

/**
 * Generate Organization structured data (schema.org/Organization)
 * @returns Organization schema JSON-LD
 */
export function generateOrganizationSchema(): StructuredData {
  const schema: StructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: seoConfig.organization.name,
    url: seoConfig.organization.url,
    logo: `${seoConfig.siteUrl}${seoConfig.organization.logo}`,
    description: seoConfig.organization.description,
  };

  // Add optional contact point
  if (seoConfig.organization.contactEmail) {
    schema.contactPoint = {
      '@type': 'ContactPoint',
      email: seoConfig.organization.contactEmail,
      contactType: 'customer service',
    };
  }

  // Add optional social profiles
  if (
    seoConfig.organization.socialProfiles &&
    seoConfig.organization.socialProfiles.length > 0
  ) {
    schema.sameAs = seoConfig.organization.socialProfiles;
  }

  return schema;
}

/**
 * Render structured data as HTML script tag
 * @param data - Single or array of structured data objects
 * @returns HTML string with script tag(s)
 */
export function renderStructuredData(data: StructuredData | StructuredData[]): string {
  const dataArray = Array.isArray(data) ? data : [data];
  return dataArray
    .map(
      (item) =>
        `<script type="application/ld+json">${JSON.stringify(item)}</script>`
    )
    .join('\n');
}
