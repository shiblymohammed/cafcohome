/**
 * SEO Utilities Module
 * Reusable functions for generating metadata across pages
 */

import { Metadata } from 'next';
import { seoConfig } from './config';

export interface GenerateMetadataParams {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  keywords?: string[];
  noindex?: boolean;
}

/**
 * Generate comprehensive metadata for a page
 * @param params - Metadata parameters
 * @returns Next.js Metadata object
 */
export function generateMetadata(params: GenerateMetadataParams): Metadata {
  const {
    title,
    description,
    image = seoConfig.defaultImage,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    keywords,
    noindex = false,
  } = params;

  const fullTitle = `${title} | ${seoConfig.siteName}`;
  const fullUrl = url ? `${seoConfig.siteUrl}${url}` : seoConfig.siteUrl;
  const fullImage = image.startsWith('http') ? image : `${seoConfig.siteUrl}${image}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords?.join(', '),
    robots: noindex ? 'noindex,nofollow' : 'index,follow',
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: seoConfig.siteName,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: type === 'product' ? 'website' : type, // Next.js doesn't support 'product' type, use 'website' instead
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImage],
      creator: seoConfig.twitterHandle,
    },
  };

  // Add article-specific metadata
  if (type === 'article' && (publishedTime || modifiedTime || author)) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: author ? [author] : undefined,
    };
  }

  return metadata;
}

/**
 * Generate canonical URL for a page
 * @param path - Page path (e.g., '/product/chair')
 * @returns Full canonical URL
 */
export function generateCanonicalUrl(path: string): string {
  return `${seoConfig.siteUrl}${path}`;
}

/**
 * Sanitize and normalize URL
 * Removes trailing slashes, converts to lowercase, removes query params
 * @param url - URL to sanitize
 * @returns Normalized URL
 */
export function sanitizeUrl(url: string): string {
  // First remove query params, then lowercase, then remove trailing slashes
  return url.split('?')[0].toLowerCase().replace(/\/+$/, '');
}

/**
 * Generate default metadata for error pages
 * @param statusCode - HTTP status code (404, 500, etc.)
 * @returns Metadata object with noindex
 */
export function generateErrorMetadata(statusCode: number): Metadata {
  const titles: Record<number, string> = {
    404: 'Page Not Found',
    500: 'Server Error',
  };

  const descriptions: Record<number, string> = {
    404: 'The page you are looking for does not exist or has been moved.',
    500: 'An unexpected error occurred. Please try again later.',
  };

  return generateMetadata({
    title: titles[statusCode] || 'Error',
    description: descriptions[statusCode] || 'An error occurred.',
    noindex: true,
  });
}

/**
 * Merge custom metadata with default values
 * @param custom - Custom metadata values
 * @returns Merged metadata
 */
export function mergeMetadata(custom: Partial<GenerateMetadataParams>): Metadata {
  return generateMetadata({
    title: custom.title || seoConfig.defaultTitle,
    description: custom.description || seoConfig.defaultDescription,
    image: custom.image || seoConfig.defaultImage,
    url: custom.url,
    type: custom.type || 'website',
    keywords: custom.keywords,
    noindex: custom.noindex || false,
  });
}
