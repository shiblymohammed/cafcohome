/**
 * SEO Module - Main Export
 * Centralized exports for all SEO utilities
 */

// Configuration
export { seoConfig } from './config';
export type { SEOConfig } from './config';

// Utilities
export {
  generateMetadata,
  generateCanonicalUrl,
  sanitizeUrl,
  generateErrorMetadata,
  mergeMetadata,
} from './utils';
export type { GenerateMetadataParams } from './utils';

// Structured Data
export {
  generateProductSchema,
  generateBreadcrumbSchema,
  generateArticleSchema,
  generateOrganizationSchema,
  renderStructuredData,
} from './structured-data';
export type {
  StructuredData,
  ProductData,
  ProductVariantData,
  BlogPostData,
} from './structured-data';
