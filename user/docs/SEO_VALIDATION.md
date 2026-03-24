# SEO Validation and Testing Guide

## Overview

This document provides step-by-step instructions for validating the SEO implementation using external tools and services. Follow these procedures to ensure all SEO features are working correctly.

## Pre-Deployment Checklist

Before deploying to production, verify:

- [ ] All environment variables are configured
- [ ] robots.txt is accessible locally
- [ ] sitemap.xml is accessible locally
- [ ] All pages have metadata
- [ ] Structured data is present on appropriate pages
- [ ] Images use Next.js Image component
- [ ] No console errors in browser

## Validation Tools and Procedures

### 1. Google Rich Results Test

**Purpose:** Validate structured data (JSON-LD) for rich snippets in search results

**URL:** https://search.google.com/test/rich-results

#### Testing Product Pages

1. Navigate to a product page (e.g., `/product/modern-chair`)
2. Copy the full URL
3. Go to Google Rich Results Test
4. Paste the URL and click "Test URL"
5. Wait for results

**Expected Results:**
- ✅ Product schema detected
- ✅ All required fields present (name, description, image, price, availability)
- ✅ Breadcrumb schema detected
- ✅ No errors or warnings

**Common Issues:**
- Missing required fields → Check `generateProductSchema` function
- Invalid price format → Ensure price is a string
- Missing images → Verify variant has images array

#### Testing Blog Pages

1. Navigate to a blog post (e.g., `/blogs/furniture-trends-2025`)
2. Copy the full URL
3. Test in Google Rich Results Test

**Expected Results:**
- ✅ Article/BlogPosting schema detected
- ✅ Author, published date, modified date present
- ✅ Publisher information included
- ✅ Breadcrumb schema detected

#### Testing Homepage

1. Navigate to homepage (`/`)
2. Test in Google Rich Results Test

**Expected Results:**
- ✅ Organization schema detected
- ✅ Organization name, logo, URL present
- ✅ No errors

### 2. Facebook Sharing Debugger

**Purpose:** Validate Open Graph tags for social media sharing

**URL:** https://developers.facebook.com/tools/debug/

#### Testing All Page Types

1. Navigate to the page you want to test
2. Copy the full URL
3. Go to Facebook Sharing Debugger
4. Paste the URL and click "Debug"
5. Review the preview

**Expected Results:**
- ✅ og:title displays correctly
- ✅ og:description is present and compelling
- ✅ og:image shows proper preview (1200x630px recommended)
- ✅ og:url matches the canonical URL
- ✅ og:type is appropriate (website, article, product)
- ✅ og:site_name is "CAFCOHOME"

**Product Pages Specific:**
- ✅ og:type is "product"
- ✅ Product image displays
- ✅ Product name in title

**Blog Pages Specific:**
- ✅ og:type is "article"
- ✅ article:published_time present
- ✅ article:author present
- ✅ Featured image displays

#### Refreshing Facebook Cache

If you've updated metadata:
1. Enter the URL in Facebook Debugger
2. Click "Scrape Again" button
3. Verify new metadata appears

### 3. Twitter Card Validator

**Purpose:** Validate Twitter Card tags for Twitter/X sharing

**URL:** https://cards-dev.twitter.com/validator

#### Testing Procedure

1. Navigate to the page you want to test
2. Copy the full URL
3. Go to Twitter Card Validator
4. Paste the URL and click "Preview card"
5. Review the card preview

**Expected Results:**
- ✅ twitter:card is "summary_large_image" (for pages with images)
- ✅ twitter:title displays correctly
- ✅ twitter:description is present
- ✅ twitter:image shows correctly
- ✅ twitter:site handle present (if configured)

**Card Types:**
- **summary_large_image**: For product pages, blog posts, collections
- **summary**: For pages without prominent images

### 4. Lighthouse SEO Audit

**Purpose:** Comprehensive SEO, performance, and accessibility testing

**How to Run:**

#### In Chrome DevTools

1. Open the page in Chrome
2. Press F12 to open DevTools
3. Click "Lighthouse" tab
4. Select categories:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
5. Click "Analyze page load"
6. Wait for results

#### Target Scores

**Production Targets:**
- Performance: ≥ 90
- SEO: ≥ 95
- Accessibility: ≥ 90
- Best Practices: ≥ 90

**Development Targets (may be lower):**
- Performance: ≥ 70
- SEO: ≥ 90
- Accessibility: ≥ 85
- Best Practices: ≥ 85

#### Key SEO Checks

Lighthouse verifies:
- ✅ Document has a `<title>` element
- ✅ Document has a meta description
- ✅ Page has successful HTTP status code
- ✅ Links have descriptive text
- ✅ Images have alt attributes
- ✅ Document has a valid `rel=canonical`
- ✅ Page is mobile-friendly
- ✅ Text is readable (font size, contrast)
- ✅ Tap targets are sized appropriately

#### Common Issues and Fixes

**Low Performance Score:**
- Optimize images (use WebP, proper sizing)
- Enable code splitting
- Reduce JavaScript bundle size
- Use CDN for static assets

**Low SEO Score:**
- Add missing meta tags
- Fix broken links
- Improve page titles/descriptions
- Add structured data

**Low Accessibility Score:**
- Add alt text to all images
- Ensure proper heading hierarchy (h1, h2, h3)
- Improve color contrast
- Add ARIA labels to interactive elements

### 5. Core Web Vitals Testing

**Purpose:** Measure real-world performance metrics

#### Using PageSpeed Insights

**URL:** https://pagespeed.web.dev/

1. Enter your page URL
2. Click "Analyze"
3. Review both Mobile and Desktop results

**Target Metrics:**

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| FCP (First Contentful Paint) | < 1.8s | 1.8s - 3.0s | > 3.0s |
| LCP (Largest Contentful Paint) | < 2.5s | 2.5s - 4.0s | > 4.0s |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |
| TTI (Time to Interactive) | < 3.8s | 3.8s - 7.3s | > 7.3s |
| TBT (Total Blocking Time) | < 300ms | 300ms - 600ms | > 600ms |

#### Improving Core Web Vitals

**For FCP (First Contentful Paint):**
- Optimize server response time
- Eliminate render-blocking resources
- Minimize CSS and JavaScript

**For LCP (Largest Contentful Paint):**
- Optimize images (use Next.js Image with priority)
- Preload critical resources
- Optimize server response time
- Use CDN for static assets

**For CLS (Cumulative Layout Shift):**
- Always include width and height on images
- Reserve space for ads and embeds
- Avoid inserting content above existing content
- Use CSS aspect-ratio for responsive elements

**For TTI (Time to Interactive):**
- Minimize JavaScript execution time
- Code split and lazy load non-critical code
- Remove unused JavaScript
- Optimize third-party scripts

### 6. robots.txt Validation

**Purpose:** Ensure search engines can crawl your site

#### Manual Testing

1. Navigate to: `https://yourdomain.com/robots.txt`
2. Verify content is displayed
3. Check format is correct

**Expected Content:**
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /auth/
Disallow: /checkout/
Disallow: /profile/
Disallow: /cart/
Disallow: /wishlist/
Disallow: /*?*

Sitemap: https://yourdomain.com/sitemap.xml
```

#### Using Google Search Console

1. Go to Google Search Console
2. Navigate to "Settings" → "robots.txt Tester"
3. Enter your robots.txt URL
4. Click "Test"
5. Verify no errors

**Common Issues:**
- 404 error → Check `app/robots.ts` file exists
- Syntax errors → Validate format
- Blocking important pages → Review Disallow rules

### 7. sitemap.xml Validation

**Purpose:** Ensure all pages are discoverable by search engines

#### Manual Testing

1. Navigate to: `https://yourdomain.com/sitemap.xml`
2. Verify XML is displayed
3. Check all page types are included:
   - Homepage
   - Product pages
   - Collection pages
   - Category pages
   - Blog posts
   - Static pages (about, contact, offers)

**Expected Structure:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- More URLs -->
</urlset>
```

#### Using XML Sitemap Validator

**URL:** https://www.xml-sitemaps.com/validate-xml-sitemap.html

1. Enter your sitemap URL
2. Click "Validate"
3. Review results

**Expected Results:**
- ✅ Valid XML format
- ✅ All URLs are absolute (include protocol and domain)
- ✅ lastModified dates are valid ISO 8601 format
- ✅ changeFrequency values are valid
- ✅ priority values are between 0.0 and 1.0

#### Submitting to Google Search Console

1. Go to Google Search Console
2. Navigate to "Sitemaps"
3. Enter sitemap URL: `https://yourdomain.com/sitemap.xml`
4. Click "Submit"
5. Wait for processing (may take a few hours)
6. Check for errors in the report

**Common Issues:**
- 404 error → Check `app/sitemap.ts` file exists
- Empty sitemap → Verify API is returning data
- Invalid URLs → Check URL format in sitemap generation
- Too many URLs → Consider sitemap index for large sites

### 8. Schema Markup Validator

**Purpose:** Validate JSON-LD structured data syntax

**URL:** https://validator.schema.org/

#### Testing Procedure

1. Navigate to the page with structured data
2. View page source (Ctrl+U or Cmd+U)
3. Find the `<script type="application/ld+json">` tag
4. Copy the JSON content
5. Go to Schema.org Validator
6. Paste the JSON
7. Click "Validate"

**Expected Results:**
- ✅ Valid JSON syntax
- ✅ All required properties present
- ✅ Property types match schema.org specification
- ✅ No warnings or errors

**Common Schema Types:**

**Product Schema Required Fields:**
- @context: "https://schema.org"
- @type: "Product"
- name
- description
- image
- offers (with price, priceCurrency, availability)

**Article Schema Required Fields:**
- @context: "https://schema.org"
- @type: "Article" or "BlogPosting"
- headline
- image
- datePublished
- author
- publisher (with name and logo)

**Organization Schema Required Fields:**
- @context: "https://schema.org"
- @type: "Organization"
- name
- url
- logo

### 9. Mobile-Friendly Test

**Purpose:** Ensure pages work well on mobile devices

**URL:** https://search.google.com/test/mobile-friendly

#### Testing Procedure

1. Enter your page URL
2. Click "Test URL"
3. Wait for results

**Expected Results:**
- ✅ Page is mobile-friendly
- ✅ Text is readable without zooming
- ✅ Tap targets are appropriately sized
- ✅ Content fits screen width
- ✅ No horizontal scrolling required

**Common Issues:**
- Text too small → Increase font size
- Tap targets too close → Add padding/margin
- Content wider than screen → Fix responsive design
- Viewport not set → Check meta viewport tag

### 10. Canonical URL Validation

**Purpose:** Ensure canonical URLs are properly set to avoid duplicate content

#### Manual Testing

1. Navigate to any page
2. View page source (Ctrl+U or Cmd+U)
3. Find the `<link rel="canonical">` tag
4. Verify the URL is correct

**Expected Format:**
```html
<link rel="canonical" href="https://yourdomain.com/page-path" />
```

**Validation Checklist:**
- ✅ Canonical URL is absolute (includes protocol and domain)
- ✅ URL is lowercase
- ✅ No trailing slash (unless it's the homepage)
- ✅ No query parameters (unless necessary)
- ✅ URL matches the primary URL for the page

**Common Issues:**
- Relative URL → Should be absolute
- Wrong domain → Check NEXT_PUBLIC_SITE_URL
- Query parameters included → Remove non-essential params
- Mixed case → Should be lowercase

## Post-Deployment Validation

After deploying to production, perform these checks:

### Day 1: Immediate Checks

- [ ] robots.txt is accessible
- [ ] sitemap.xml is accessible
- [ ] Homepage metadata displays correctly
- [ ] Sample product page metadata displays correctly
- [ ] Sample blog post metadata displays correctly
- [ ] Open Graph tags work (test with Facebook Debugger)
- [ ] Twitter Cards work (test with Twitter Validator)
- [ ] Structured data validates (test with Rich Results Test)
- [ ] Lighthouse scores meet targets

### Week 1: Monitoring

- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Monitor Search Console for crawl errors
- [ ] Check indexing status in Search Console
- [ ] Monitor Core Web Vitals
- [ ] Review server logs for crawler activity

### Month 1: Analysis

- [ ] Review organic traffic trends
- [ ] Check keyword rankings
- [ ] Analyze click-through rates
- [ ] Review structured data coverage
- [ ] Check for any SEO errors in Search Console
- [ ] Run comprehensive Lighthouse audits
- [ ] Validate all page types

## Automated Testing

### Using Playwright for SEO Testing

Create automated tests for SEO elements:

```typescript
// tests/seo.spec.ts
import { test, expect } from '@playwright/test';

test('homepage has proper SEO metadata', async ({ page }) => {
  await page.goto('/');
  
  // Check title
  await expect(page).toHaveTitle(/CAFCOHOME/);
  
  // Check meta description
  const description = await page.locator('meta[name="description"]');
  await expect(description).toHaveAttribute('content', /.+/);
  
  // Check canonical URL
  const canonical = await page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute('href', /^https:\/\//);
  
  // Check Open Graph tags
  const ogTitle = await page.locator('meta[property="og:title"]');
  await expect(ogTitle).toHaveAttribute('content', /.+/);
  
  // Check structured data
  const structuredData = await page.locator('script[type="application/ld+json"]');
  await expect(structuredData).toBeVisible();
});
```

### CI/CD Integration

Add SEO checks to your CI/CD pipeline:

```yaml
# .github/workflows/seo-check.yml
name: SEO Validation

on: [push, pull_request]

jobs:
  seo-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Run SEO tests
        run: npm run test:seo
      - name: Lighthouse CI
        run: npx @lhci/cli@0.12.x autorun
```

## Troubleshooting Common Issues

### Issue: Metadata Not Updating

**Symptoms:**
- Old title/description showing in search results
- Facebook/Twitter showing cached data

**Solutions:**
1. Clear browser cache
2. Use Facebook Debugger to scrape again
3. Wait 24-48 hours for search engines to recrawl
4. Submit URL to Search Console for re-indexing

### Issue: Structured Data Not Detected

**Symptoms:**
- Rich Results Test shows no structured data
- No rich snippets in search results

**Solutions:**
1. View page source and verify JSON-LD is present
2. Validate JSON syntax with Schema.org Validator
3. Check for JavaScript errors in console
4. Ensure script tag has correct type attribute
5. Wait for Google to recrawl (can take weeks)

### Issue: Low Lighthouse Scores

**Symptoms:**
- Performance score < 90
- SEO score < 95

**Solutions:**
1. Optimize images (use Next.js Image, WebP format)
2. Enable code splitting for large components
3. Minimize JavaScript bundle size
4. Add missing meta tags
5. Fix accessibility issues
6. Improve server response time

### Issue: Pages Not Indexed

**Symptoms:**
- Pages not appearing in search results
- Low coverage in Search Console

**Solutions:**
1. Check robots.txt isn't blocking pages
2. Verify sitemap includes the pages
3. Submit sitemap to Search Console
4. Request indexing for specific URLs
5. Check for noindex meta tags
6. Ensure pages are linked from other pages

## Resources

### Validation Tools

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Schema.org Validator](https://validator.schema.org/)
- [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

### Monitoring Tools

- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [Google Analytics](https://analytics.google.com/)

### Documentation

- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

---

**Last Updated:** January 2025
**Version:** 1.0
**Maintained by:** CAFCOHOME Development Team
