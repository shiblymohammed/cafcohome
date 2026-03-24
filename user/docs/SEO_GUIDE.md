# SEO Implementation Guide

## Overview

This document provides comprehensive guidance on the SEO implementation in the CAFCOHOME Next.js application. It covers the architecture, best practices, maintenance procedures, and troubleshooting tips.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Adding Metadata to New Pages](#adding-metadata-to-new-pages)
3. [Structured Data Implementation](#structured-data-implementation)
4. [SEO Utilities Reference](#seo-utilities-reference)
5. [Testing and Validation](#testing-and-validation)
6. [Performance Optimization](#performance-optimization)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance Checklist](#maintenance-checklist)

## Architecture Overview

### SEO System Components

The SEO implementation consists of four main layers:

1. **Configuration Layer** (`src/lib/seo/config.ts`)
   - Centralized SEO settings
   - Environment-specific values
   - Organization information

2. **Utility Layer** (`src/lib/seo/utils.ts`)
   - Metadata generation functions
   - URL normalization
   - Helper utilities

3. **Structured Data Layer** (`src/lib/seo/structured-data.ts`)
   - JSON-LD schema generators
   - Product, Article, Organization schemas
   - Breadcrumb generation

4. **Static Files Layer**
   - `app/robots.ts` - Dynamic robots.txt
   - `app/sitemap.ts` - Dynamic sitemap.xml
   - `app/manifest.ts` - PWA manifest

### Server-Side Rendering Strategy

All SEO-critical pages use Next.js Server Components with the `generateMetadata` function for optimal SEO:

- **Server Components**: Pages without "use client" directive
- **Client Components**: Interactive elements extracted into separate components
- **Metadata Generation**: Server-side using `generateMetadata` function

## Adding Metadata to New Pages

### Step 1: Import SEO Utilities

```typescript
import { Metadata } from 'next';
import { generateMetadata as genMeta } from '@/src/lib/seo/utils';
```

### Step 2: Create generateMetadata Function

```typescript
export async function generateMetadata(): Promise<Metadata> {
  return genMeta({
    title: 'Your Page Title',
    description: 'Your page description (150-160 characters)',
    url: '/your-page-path',
    keywords: ['keyword1', 'keyword2', 'keyword3'],
  });
}
```

### Step 3: For Dynamic Pages with API Data

```typescript
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const data = await ApiClient.getDataBySlug(params.slug);

    return genMeta({
      title: data.title,
      description: data.description,
      image: data.image_url,
      url: `/path/${data.slug}`,
      type: 'article', // or 'product', 'website'
      keywords: [data.name, 'furniture', 'home decor'],
    });
  } catch (error) {
    // Return error metadata with noindex
    return generateErrorMetadata(404);
  }
}
```

### Metadata Best Practices

- **Title**: 50-60 characters, include primary keyword
- **Description**: 150-160 characters, compelling and descriptive
- **Keywords**: 5-10 relevant keywords, avoid keyword stuffing
- **Images**: Use high-quality images (1200x630px for Open Graph)
- **URLs**: Use clean, descriptive URLs without query parameters

## Structured Data Implementation

### Adding Product Schema

```typescript
import { generateProductSchema } from '@/src/lib/seo/structured-data';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await ApiClient.getProductBySlug(params.slug);
  const variant = product.variants[0];
  
  const productSchema = generateProductSchema(product, variant);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {/* Page content */}
    </>
  );
}
```

### Adding Breadcrumb Schema

```typescript
import { generateBreadcrumbSchema } from '@/src/lib/seo/structured-data';

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Collections', url: '/collections' },
  { name: product.collection_name, url: `/collections/${product.collection_slug}` },
  { name: product.name, url: `/product/${product.slug}` },
]);
```

### Adding Article Schema

```typescript
import { generateArticleSchema } from '@/src/lib/seo/structured-data';

const articleSchema = generateArticleSchema(blogPost);
```

### Schema Types Available

- **Product**: For product pages
- **Article/BlogPosting**: For blog posts
- **Organization**: For homepage
- **BreadcrumbList**: For navigation hierarchy
- **WebSite**: For site-wide information

## SEO Utilities Reference

### generateMetadata(params)

Generates complete metadata object for Next.js pages.

**Parameters:**
- `title` (string, required): Page title
- `description` (string, required): Page description
- `image` (string, optional): Open Graph image URL
- `url` (string, optional): Canonical URL path
- `type` (string, optional): Open Graph type ('website', 'article', 'product')
- `publishedTime` (string, optional): Article published date
- `modifiedTime` (string, optional): Article modified date
- `author` (string, optional): Article author
- `keywords` (string[], optional): SEO keywords
- `noindex` (boolean, optional): Prevent indexing

**Returns:** Next.js Metadata object

### generateCanonicalUrl(path)

Generates absolute canonical URL from path.

**Parameters:**
- `path` (string): URL path (e.g., '/product/chair')

**Returns:** Full canonical URL (e.g., 'https://cafcohome.com/product/chair')

### sanitizeUrl(url)

Normalizes URL for canonical usage.

**Parameters:**
- `url` (string): URL to sanitize

**Returns:** Normalized URL (lowercase, no trailing slash, no query params)

## Testing and Validation

### 1. Google Rich Results Test

Test structured data for rich snippets:

**URL:** https://search.google.com/test/rich-results

**Steps:**
1. Enter your page URL or paste HTML
2. Click "Test URL"
3. Review detected structured data
4. Fix any errors or warnings

**What to Check:**
- Product schema includes all required fields
- Article schema has valid dates
- Breadcrumbs show correct hierarchy
- No errors or warnings

### 2. Facebook Sharing Debugger

Test Open Graph tags:

**URL:** https://developers.facebook.com/tools/debug/

**Steps:**
1. Enter your page URL
2. Click "Debug"
3. Review Open Graph tags
4. Click "Scrape Again" to refresh cache

**What to Check:**
- og:title displays correctly
- og:description is compelling
- og:image shows proper preview (1200x630px)
- og:type is appropriate

### 3. Twitter Card Validator

Test Twitter Cards:

**URL:** https://cards-dev.twitter.com/validator

**Steps:**
1. Enter your page URL
2. Click "Preview card"
3. Review card appearance

**What to Check:**
- twitter:card type is correct
- twitter:title and twitter:description display properly
- twitter:image shows correctly

### 4. Lighthouse SEO Audit

Run Lighthouse in Chrome DevTools:

**Steps:**
1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "SEO" category
4. Click "Analyze page load"

**Target Scores:**
- Performance: ≥ 90
- SEO: ≥ 95
- Accessibility: ≥ 90
- Best Practices: ≥ 90

### 5. Verify robots.txt and sitemap.xml

**robots.txt:**
- URL: https://cafcohome.com/robots.txt
- Check: Allows crawling, references sitemap

**sitemap.xml:**
- URL: https://cafcohome.com/sitemap.xml
- Check: All pages listed, valid XML format

**Submit to Search Console:**
1. Go to Google Search Console
2. Navigate to Sitemaps
3. Enter sitemap URL: https://cafcohome.com/sitemap.xml
4. Click "Submit"

### 6. Core Web Vitals

Monitor in Google Search Console:

**Metrics:**
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3.8s

## Performance Optimization

### Image Optimization

**Best Practices:**
- Use Next.js Image component for all images
- Specify width and height to prevent layout shift
- Use `priority` prop for above-the-fold images
- Use `loading="lazy"` for below-the-fold images
- Optimize image quality (75-85 for most images)

```typescript
import Image from 'next/image';

// Above-the-fold image
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1920}
  height={1080}
  priority
  quality={90}
/>

// Below-the-fold image
<Image
  src="/product.jpg"
  alt="Product"
  width={800}
  height={600}
  loading="lazy"
  quality={85}
/>
```

### Code Splitting

**Use dynamic imports for non-critical components:**

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false, // Disable SSR if not needed
});
```

**When to use:**
- Below-the-fold sections
- Modal dialogs
- Interactive widgets
- Large third-party libraries

### Caching Strategy

**API Responses:**
```typescript
const response = await fetch(url, {
  next: { revalidate: 3600 }, // Cache for 1 hour
});
```

**Static Assets:**
- Images: 7 days (configured in next.config.ts)
- Fonts: 1 year
- CSS/JS: Automatic versioning

### Bundle Size Optimization

**Check bundle size:**
```bash
npm run build
```

**Analyze bundle:**
```bash
npm install -D @next/bundle-analyzer
```

**Optimization techniques:**
- Remove unused dependencies
- Use tree-shaking
- Lazy load heavy components
- Optimize third-party scripts

## Troubleshooting

### Issue: Metadata Not Showing in Search Results

**Possible Causes:**
1. Page not indexed yet (wait 1-2 weeks)
2. robots.txt blocking crawlers
3. noindex directive present
4. Duplicate content issues

**Solutions:**
1. Submit URL to Google Search Console
2. Check robots.txt allows crawling
3. Verify metadata doesn't have noindex
4. Use canonical URLs to prevent duplicates

### Issue: Structured Data Errors

**Possible Causes:**
1. Missing required fields
2. Invalid date formats
3. Incorrect schema type
4. Malformed JSON-LD

**Solutions:**
1. Use Google Rich Results Test
2. Check schema.org documentation
3. Validate JSON syntax
4. Ensure all required fields present

### Issue: Open Graph Images Not Displaying

**Possible Causes:**
1. Image URL not absolute
2. Image too small (< 200x200px)
3. Image not accessible
4. Cache not refreshed

**Solutions:**
1. Use full URL with protocol
2. Use images ≥ 1200x630px
3. Verify image URL is publicly accessible
4. Use Facebook Debugger to scrape again

### Issue: Poor Lighthouse Scores

**Performance Issues:**
- Optimize images (use WebP, proper sizing)
- Enable code splitting
- Minimize JavaScript
- Use CDN for static assets

**SEO Issues:**
- Add missing meta tags
- Fix broken links
- Improve page titles/descriptions
- Add structured data

**Accessibility Issues:**
- Add alt text to images
- Ensure proper heading hierarchy
- Improve color contrast
- Add ARIA labels

## Maintenance Checklist

### Weekly Tasks

- [ ] Monitor Google Search Console for errors
- [ ] Check Core Web Vitals metrics
- [ ] Review crawl errors and fix issues
- [ ] Monitor organic traffic trends

### Monthly Tasks

- [ ] Run Lighthouse audits on key pages
- [ ] Validate structured data with Rich Results Test
- [ ] Review and update meta descriptions
- [ ] Check for broken links
- [ ] Analyze keyword rankings
- [ ] Review sitemap coverage

### Quarterly Tasks

- [ ] Comprehensive SEO audit
- [ ] Update organization schema if needed
- [ ] Review and optimize page load times
- [ ] Analyze competitor SEO strategies
- [ ] Update SEO documentation
- [ ] Review and update keywords

### When Adding New Content

- [ ] Add generateMetadata function
- [ ] Include appropriate structured data
- [ ] Add to sitemap (automatic for dynamic pages)
- [ ] Optimize images with Next.js Image
- [ ] Test with validation tools
- [ ] Submit to Search Console for indexing

## Environment Variables

Required environment variables for SEO:

```env
# Site Configuration
NEXT_PUBLIC_SITE_NAME=CAFCOHOME
NEXT_PUBLIC_SITE_URL=https://cafcohome.com
NEXT_PUBLIC_API_URL=https://api.cafcohome.com/api

# Social Media
NEXT_PUBLIC_TWITTER_HANDLE=@cafcohome
NEXT_PUBLIC_FACEBOOK_APP_ID=your-app-id

# Contact
NEXT_PUBLIC_CONTACT_EMAIL=contact@cafcohome.com

# Revalidation
REVALIDATION_SECRET=your-secret-key
```

## Resources

### Official Documentation

- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Schema.org Documentation](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)

### SEO Tools

- [Google Search Console](https://search.google.com/search-console)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Learning Resources

- [Google SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Moz Beginner's Guide to SEO](https://moz.com/beginners-guide-to-seo)
- [Web.dev Performance](https://web.dev/performance/)
- [Next.js Learn](https://nextjs.org/learn)

## Support

For questions or issues related to SEO implementation:

1. Check this documentation first
2. Review the design document at `.kiro/specs/seo-optimization/design.md`
3. Test with validation tools
4. Check Google Search Console for specific errors
5. Consult the development team

---

**Last Updated:** January 2025
**Version:** 1.0
**Maintained by:** CAFCOHOME Development Team
