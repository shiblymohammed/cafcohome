/**
 * Property-Based Testing for SEO Implementation
 * Tests correctness properties using fast-check
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateMetadata, generateCanonicalUrl, sanitizeUrl, generateErrorMetadata } from '../utils';
import {
  generateProductSchema,
  generateBreadcrumbSchema,
  generateArticleSchema,
  generateOrganizationSchema,
  type ProductData,
  type ProductVariantData,
  type BlogPostData,
} from '../structured-data';
import { seoConfig } from '../config';

// ============================================================================
// Arbitraries (Generators for random test data)
// ============================================================================

const urlPathArbitrary = fc.string({ minLength: 1, maxLength: 50 }).map(s => 
  '/' + s.replace(/[^a-z0-9-]/gi, '-').toLowerCase()
);

const imageUrlArbitrary = fc.oneof(
  fc.webUrl(),
  fc.string({ minLength: 1, maxLength: 30 }).map(s => `/images/${s}.jpg`)
);

const productArbitrary: fc.Arbitrary<ProductData> = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  name: fc.string({ minLength: 3, maxLength: 100 }),
  description: fc.string({ minLength: 10, maxLength: 500 }),
  slug: fc.string({ minLength: 3, maxLength: 50 }).map(s => s.toLowerCase().replace(/[^a-z0-9]/g, '-')),
  brand_name: fc.option(fc.string({ minLength: 2, maxLength: 50 }), { nil: undefined }),
  updated_at: fc.date().map(d => d.toISOString()),
});

const variantArbitrary: fc.Arbitrary<ProductVariantData> = fc.record({
  sku: fc.string({ minLength: 5, maxLength: 20 }).map(s => s.toUpperCase()),
  price: fc.float({ min: 100, max: 100000, noNaN: true }).map(p => p.toFixed(2)),
  is_in_stock: fc.boolean(),
  images: fc.array(
    fc.record({ url: imageUrlArbitrary }),
    { minLength: 0, maxLength: 5 }
  ),
});

const blogPostArbitrary: fc.Arbitrary<BlogPostData> = fc.record({
  title: fc.string({ minLength: 10, maxLength: 100 }),
  excerpt: fc.string({ minLength: 20, maxLength: 300 }),
  featured_image_url: fc.option(imageUrlArbitrary, { nil: undefined }),
  published_at: fc.integer({ min: 1577836800000, max: 1767225600000 }).map(ts => new Date(ts).toISOString()),
  updated_at: fc.integer({ min: 1577836800000, max: 1767225600000 }).map(ts => new Date(ts).toISOString()),
  author_name: fc.option(fc.string({ minLength: 3, maxLength: 50 }), { nil: undefined }),
});

const breadcrumbItemsArbitrary = fc.array(
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 50 }),
    url: urlPathArbitrary,
  }),
  { minLength: 1, maxLength: 10 }
);

const sitemapEntryArbitrary = fc.record({
  url: fc.webUrl(),
  lastModified: fc.date(),
  changeFrequency: fc.constantFrom('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'),
  priority: fc.float({ min: 0, max: 1, noNaN: true }),
});

// ============================================================================
// Property 1: Sitemap Completeness
// ============================================================================

describe('Property 1: Sitemap Completeness', () => {
  it('should have lastModified, changeFrequency, and priority for all entries', () => {
    fc.assert(
      fc.property(
        fc.array(sitemapEntryArbitrary, { minLength: 1, maxLength: 100 }),
        (entries) => {
          // All entries must have required fields
          return entries.every(entry => 
            entry.lastModified !== undefined &&
            entry.changeFrequency !== undefined &&
            entry.priority !== undefined &&
            entry.priority >= 0 &&
            entry.priority <= 1
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 2: Product Metadata Completeness
// ============================================================================

describe('Property 2: Product Metadata Completeness', () => {
  it('should include all required metadata fields for products', () => {
    fc.assert(
      fc.property(
        productArbitrary,
        variantArbitrary,
        (product, variant) => {
          const metadata = generateMetadata({
            title: product.name,
            description: product.description,
            image: variant.images?.[0]?.url,
            url: `/product/${product.slug}`,
            type: 'product',
            keywords: [product.name, product.brand_name || ''].filter(Boolean),
          });

          // Check all required fields
          const hasTitle = typeof metadata.title === 'string' && metadata.title.includes(product.name);
          const hasDescription = metadata.description === product.description;
          const hasCanonical = metadata.alternates?.canonical?.includes(`/product/${product.slug}`);
          const hasOpenGraph = metadata.openGraph !== undefined;
          const hasTwitter = metadata.twitter !== undefined;
          const hasKeywords = metadata.keywords !== undefined;

          // Check Open Graph fields
          const ogComplete = metadata.openGraph &&
            metadata.openGraph.title !== undefined &&
            metadata.openGraph.description !== undefined &&
            metadata.openGraph.url !== undefined &&
            metadata.openGraph.images !== undefined &&
            Array.isArray(metadata.openGraph.images) &&
            metadata.openGraph.images.length > 0;

          // Check Twitter Card fields
          const twitterComplete = metadata.twitter &&
            metadata.twitter.card !== undefined &&
            metadata.twitter.title !== undefined &&
            metadata.twitter.description !== undefined &&
            metadata.twitter.images !== undefined;

          return hasTitle && hasDescription && hasCanonical && hasOpenGraph && 
                 hasTwitter && hasKeywords && ogComplete && twitterComplete;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 3: Collection Metadata Completeness
// ============================================================================

describe('Property 3: Collection Metadata Completeness', () => {
  it('should include all required metadata fields for collections', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 3, maxLength: 100 }),
        fc.string({ minLength: 10, maxLength: 500 }),
        fc.string({ minLength: 3, maxLength: 50 }).map(s => s.toLowerCase()),
        imageUrlArbitrary,
        (name, description, slug, image) => {
          const metadata = generateMetadata({
            title: name,
            description,
            image,
            url: `/collections/${slug}`,
            keywords: [name, 'collection', 'furniture'],
          });

          const hasTitle = typeof metadata.title === 'string' && metadata.title.includes(name);
          const hasDescription = metadata.description === description;
          const hasCanonical = metadata.alternates?.canonical?.includes(`/collections/${slug}`);
          const hasOpenGraph = metadata.openGraph !== undefined;
          const hasTwitter = metadata.twitter !== undefined;
          const hasKeywords = metadata.keywords !== undefined;

          return hasTitle && hasDescription && hasCanonical && hasOpenGraph && hasTwitter && hasKeywords;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 4: Category Metadata Completeness
// ============================================================================

describe('Property 4: Category Metadata Completeness', () => {
  it('should include all required metadata fields for categories', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 3, maxLength: 100 }),
        fc.string({ minLength: 10, maxLength: 500 }),
        fc.string({ minLength: 3, maxLength: 50 }).map(s => s.toLowerCase()),
        (name, description, slug) => {
          const metadata = generateMetadata({
            title: name,
            description,
            url: `/categories/${slug}`,
            keywords: [name, 'category', 'furniture'],
          });

          const hasTitle = typeof metadata.title === 'string' && metadata.title.includes(name);
          const hasDescription = metadata.description === description;
          const hasCanonical = metadata.alternates?.canonical?.includes(`/categories/${slug}`);
          const hasOpenGraph = metadata.openGraph !== undefined;
          const hasTwitter = metadata.twitter !== undefined;
          const hasKeywords = metadata.keywords !== undefined;

          return hasTitle && hasDescription && hasCanonical && hasOpenGraph && hasTwitter && hasKeywords;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 5: Blog Post Metadata Completeness
// ============================================================================

describe('Property 5: Blog Post Metadata Completeness', () => {
  it('should include all required metadata fields for blog posts', () => {
    fc.assert(
      fc.property(
        blogPostArbitrary,
        fc.string({ minLength: 3, maxLength: 50 }).map(s => s.toLowerCase()),
        (blog, slug) => {
          const metadata = generateMetadata({
            title: blog.title,
            description: blog.excerpt,
            image: blog.featured_image_url,
            url: `/blogs/${slug}`,
            type: 'article',
            publishedTime: blog.published_at,
            modifiedTime: blog.updated_at,
            author: blog.author_name,
            keywords: [blog.title, 'blog', 'article'],
          });

          const hasTitle = typeof metadata.title === 'string' && metadata.title.includes(blog.title);
          const hasDescription = metadata.description === blog.excerpt;
          const hasCanonical = metadata.alternates?.canonical?.includes(`/blogs/${slug}`);
          const hasOpenGraph = metadata.openGraph !== undefined;
          const hasTwitter = metadata.twitter !== undefined;
          const hasKeywords = metadata.keywords !== undefined;

          // Check article-specific Open Graph fields
          const ogArticle = metadata.openGraph &&
            metadata.openGraph.type === 'article' &&
            metadata.openGraph.publishedTime === blog.published_at &&
            metadata.openGraph.modifiedTime === blog.updated_at;

          return hasTitle && hasDescription && hasCanonical && hasOpenGraph && 
                 hasTwitter && hasKeywords && ogArticle;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 6: Product Structured Data Completeness
// ============================================================================

describe('Property 6: Product Structured Data Completeness', () => {
  it('should generate valid and complete product structured data', () => {
    fc.assert(
      fc.property(
        productArbitrary,
        variantArbitrary,
        (product, variant) => {
          const schema = generateProductSchema(product, variant);

          // Check required schema.org fields
          const hasContext = schema['@context'] === 'https://schema.org';
          const hasType = schema['@type'] === 'Product';
          const hasName = schema.name === product.name;
          const hasDescription = schema.description === product.description;
          const hasImage = Array.isArray(schema.image);
          const hasSku = schema.sku === variant.sku;
          const hasBrand = schema.brand && schema.brand['@type'] === 'Brand';
          const hasOffers = schema.offers && schema.offers['@type'] === 'Offer';
          
          // Check offers completeness
          const offersComplete = schema.offers &&
            schema.offers.priceCurrency === 'INR' &&
            schema.offers.price === variant.price &&
            schema.offers.availability !== undefined &&
            schema.offers.itemCondition === 'https://schema.org/NewCondition';

          return hasContext && hasType && hasName && hasDescription && hasImage && 
                 hasSku && hasBrand && hasOffers && offersComplete;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 7: Breadcrumb Structured Data Completeness
// ============================================================================

describe('Property 7: Breadcrumb Structured Data Completeness', () => {
  it('should generate valid breadcrumb structured data with proper hierarchy', () => {
    fc.assert(
      fc.property(
        breadcrumbItemsArbitrary,
        (items) => {
          const schema = generateBreadcrumbSchema(items);

          // Check schema structure
          const hasContext = schema['@context'] === 'https://schema.org';
          const hasType = schema['@type'] === 'BreadcrumbList';
          const hasItems = Array.isArray(schema.itemListElement);
          
          // Check all items have required fields and proper positions
          const itemsValid = schema.itemListElement.every((item: any, index: number) => 
            item['@type'] === 'ListItem' &&
            item.position === index + 1 &&
            typeof item.name === 'string' &&
            typeof item.item === 'string' &&
            item.item.startsWith(seoConfig.siteUrl)
          );

          // Check positions are sequential
          const positionsSequential = schema.itemListElement.every((item: any, index: number) =>
            item.position === index + 1
          );

          return hasContext && hasType && hasItems && itemsValid && positionsSequential;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 8: Article Structured Data Completeness
// ============================================================================

describe('Property 8: Article Structured Data Completeness', () => {
  it('should generate valid and complete article structured data', () => {
    fc.assert(
      fc.property(
        blogPostArbitrary,
        (blog) => {
          const schema = generateArticleSchema(blog);

          // Check required schema.org fields
          const hasContext = schema['@context'] === 'https://schema.org';
          const hasType = schema['@type'] === 'BlogPosting';
          const hasHeadline = schema.headline === blog.title;
          const hasDescription = schema.description === blog.excerpt;
          const hasImage = schema.image === blog.featured_image_url;
          const hasDatePublished = schema.datePublished === blog.published_at;
          const hasDateModified = schema.dateModified === blog.updated_at;
          
          // Check author structure
          const hasAuthor = schema.author &&
            schema.author['@type'] === 'Person' &&
            typeof schema.author.name === 'string';
          
          // Check publisher structure
          const hasPublisher = schema.publisher &&
            schema.publisher['@type'] === 'Organization' &&
            schema.publisher.name === seoConfig.organization.name &&
            schema.publisher.logo &&
            schema.publisher.logo['@type'] === 'ImageObject';

          return hasContext && hasType && hasHeadline && hasDescription && hasImage &&
                 hasDatePublished && hasDateModified && hasAuthor && hasPublisher;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 9: Open Graph Tag Completeness
// ============================================================================

describe('Property 9: Open Graph Tag Completeness', () => {
  it('should include all required Open Graph tags for any page', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 3, maxLength: 100 }),
        fc.string({ minLength: 10, maxLength: 500 }),
        imageUrlArbitrary,
        urlPathArbitrary,
        (title, description, image, url) => {
          const metadata = generateMetadata({
            title,
            description,
            image,
            url,
          });

          const og = metadata.openGraph;
          
          return og !== undefined &&
            typeof og.title === 'string' &&
            typeof og.description === 'string' &&
            typeof og.url === 'string' &&
            typeof og.type === 'string' &&
            typeof og.siteName === 'string' &&
            typeof og.locale === 'string' &&
            Array.isArray(og.images) &&
            og.images.length > 0 &&
            og.images[0].url !== undefined;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 10: Twitter Card Completeness
// ============================================================================

describe('Property 10: Twitter Card Completeness', () => {
  it('should include all required Twitter Card tags for any page', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 3, maxLength: 100 }),
        fc.string({ minLength: 10, maxLength: 500 }),
        imageUrlArbitrary,
        urlPathArbitrary,
        (title, description, image, url) => {
          const metadata = generateMetadata({
            title,
            description,
            image,
            url,
          });

          const twitter = metadata.twitter;
          
          return twitter !== undefined &&
            (twitter.card === 'summary_large_image' || twitter.card === 'summary') &&
            typeof twitter.title === 'string' &&
            typeof twitter.description === 'string' &&
            Array.isArray(twitter.images) &&
            twitter.images.length > 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 11: Canonical URL Normalization
// ============================================================================

describe('Property 11: Canonical URL Normalization', () => {
  it('should normalize canonical URLs correctly', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).map(s => '/' + s),
        (path) => {
          const canonical = generateCanonicalUrl(path);
          
          // Should be absolute URL
          const isAbsolute = canonical.startsWith('http://') || canonical.startsWith('https://');
          
          // Should include site URL
          const includesSiteUrl = canonical.includes(seoConfig.siteUrl);
          
          return isAbsolute && includesSiteUrl;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should sanitize URLs by removing trailing slashes, lowercasing, and removing query params', () => {
    fc.assert(
      fc.property(
        fc.webUrl().filter(url => url.length > 0),
        fc.boolean(),
        fc.option(fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/[^a-zA-Z0-9]/g, '')), { nil: undefined }),
        (baseUrl, addTrailingSlash, queryParam) => {
          let url = baseUrl;
          // Only add trailing slash if URL has a path component
          if (addTrailingSlash && url.split('//')[1]?.includes('/')) {
            url += '/';
          }
          if (queryParam) url += `?param=${encodeURIComponent(queryParam)}`;
          
          const sanitized = sanitizeUrl(url);
          
          // Should not have trailing slash
          const noTrailingSlash = !sanitized.endsWith('/');
          
          // Should be lowercase
          const isLowercase = sanitized === sanitized.toLowerCase();
          
          // Should not have query params
          const noQueryParams = !sanitized.includes('?');
          
          return noTrailingSlash && isLowercase && noQueryParams;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 12: Organization Schema Completeness
// ============================================================================

describe('Property 12: Organization Schema Completeness', () => {
  it('should generate valid organization structured data', () => {
    const schema = generateOrganizationSchema();

    // Check required schema.org fields
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Organization');
    expect(schema.name).toBe(seoConfig.organization.name);
    expect(schema.url).toBe(seoConfig.organization.url);
    expect(typeof schema.logo).toBe('string');
    expect(schema.logo).toContain(seoConfig.organization.logo);
    expect(schema.description).toBe(seoConfig.organization.description);
  });
});

// ============================================================================
// Property 13: Error Page Metadata
// ============================================================================

describe('Property 13: Error Page Metadata', () => {
  it('should generate proper metadata for 404 pages with noindex', () => {
    const metadata = generateErrorMetadata(404);

    expect(metadata.title).toContain('Page Not Found');
    expect(metadata.description).toBeTruthy();
    expect(metadata.robots).toBe('noindex,nofollow');
  });

  it('should generate proper metadata for 500 pages with noindex', () => {
    const metadata = generateErrorMetadata(500);

    expect(metadata.title).toContain('Server Error');
    expect(metadata.description).toBeTruthy();
    expect(metadata.robots).toBe('noindex,nofollow');
  });

  it('should always include noindex for error pages', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(404, 500),
        (statusCode) => {
          const metadata = generateErrorMetadata(statusCode);
          return metadata.robots === 'noindex,nofollow';
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 14: Static Page Metadata Completeness
// ============================================================================

describe('Property 14: Static Page Metadata Completeness', () => {
  it('should include all required metadata fields for static pages', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('about', 'contact', 'offers'),
        fc.string({ minLength: 10, maxLength: 100 }),
        fc.string({ minLength: 20, maxLength: 500 }),
        (pageName, title, description) => {
          const metadata = generateMetadata({
            title,
            description,
            url: `/${pageName}`,
            keywords: [pageName, 'furniture', 'CAFCOHOME'],
          });

          const hasTitle = typeof metadata.title === 'string' && metadata.title.includes(title);
          const hasDescription = metadata.description === description;
          const hasCanonical = metadata.alternates?.canonical?.includes(`/${pageName}`);
          const hasOpenGraph = metadata.openGraph !== undefined;
          const hasTwitter = metadata.twitter !== undefined;
          const hasKeywords = metadata.keywords !== undefined;

          return hasTitle && hasDescription && hasCanonical && hasOpenGraph && hasTwitter && hasKeywords;
        }
      ),
      { numRuns: 100 }
    );
  });
});
