import { Metadata } from 'next';
import { generateMetadata } from './utils';
import { seoConfig } from './config';

/**
 * Fallback metadata for when API calls fail
 */

export function getProductFallbackMetadata(slug: string): Metadata {
  return generateMetadata({
    title: 'Product Details',
    description: 'Discover premium furniture and home decor at DravoHome. Browse our collection of high-quality products.',
    url: `/product/${slug}`,
    type: 'product',
    keywords: ['furniture', 'home decor', 'premium furniture'],
    noindex: false,
  });
}

export function getCollectionFallbackMetadata(slug: string): Metadata {
  return generateMetadata({
    title: 'Collection',
    description: 'Explore our curated furniture collections. Find the perfect pieces for your home at DravoHome.',
    url: `/collections/${slug}`,
    keywords: ['furniture collection', 'home decor', 'furniture'],
  });
}

export function getCategoryFallbackMetadata(slug: string): Metadata {
  return generateMetadata({
    title: 'Category',
    description: 'Browse furniture by category. Discover quality pieces for every room at DravoHome.',
    url: `/categories/${slug}`,
    keywords: ['furniture category', 'home furnishing', 'furniture'],
  });
}

export function getBlogFallbackMetadata(slug: string): Metadata {
  return generateMetadata({
    title: 'Blog Post',
    description: 'Read our latest articles about furniture, home decor, and interior design tips.',
    url: `/blogs/${slug}`,
    type: 'article',
    keywords: ['furniture blog', 'home decor tips', 'interior design'],
  });
}

export function getNotFoundMetadata(): Metadata {
  return generateMetadata({
    title: 'Page Not Found',
    description: 'The page you are looking for could not be found.',
    noindex: true,
  });
}

/**
 * Fallback structured data for when API calls fail
 */

export function getProductFallbackSchema(slug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Product',
    description: 'Premium furniture product',
    url: `${seoConfig.siteUrl}/product/${slug}`,
    brand: {
      '@type': 'Brand',
      name: seoConfig.organization.name,
    },
  };
}

export function getBlogFallbackSchema(slug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'Blog Post',
    description: 'Read our latest article',
    url: `${seoConfig.siteUrl}/blogs/${slug}`,
    author: {
      '@type': 'Person',
      name: 'DravoHome Team',
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
 * Generic error handler for API calls in metadata generation
 */
export async function withFallback<T>(
  apiCall: () => Promise<T>,
  fallback: T,
  logError: boolean = true
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    if (logError) {
      console.error('API call failed, using fallback:', error);
    }
    return fallback;
  }
}
