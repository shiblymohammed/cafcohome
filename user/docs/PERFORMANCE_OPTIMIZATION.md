# Performance Optimization Guide

## Overview

This document provides comprehensive guidance on optimizing the performance of the CAFCOHOME Next.js application to achieve and maintain high Lighthouse scores and excellent Core Web Vitals.

## Performance Targets

### Lighthouse Scores

- **Performance**: ≥ 90
- **SEO**: ≥ 95
- **Accessibility**: ≥ 90
- **Best Practices**: ≥ 90

### Core Web Vitals

| Metric | Target | Description |
|--------|--------|-------------|
| FCP | < 1.8s | First Contentful Paint - Time until first content appears |
| LCP | < 2.5s | Largest Contentful Paint - Time until main content is visible |
| CLS | < 0.1 | Cumulative Layout Shift - Visual stability score |
| TTI | < 3.8s | Time to Interactive - Time until page is fully interactive |
| TBT | < 300ms | Total Blocking Time - Time page is blocked from user input |

## Image Optimization

### Using Next.js Image Component

The Next.js Image component automatically optimizes images for performance.

#### Basic Usage

```typescript
import Image from 'next/image';

<Image
  src="/product.jpg"
  alt="Product name"
  width={800}
  height={600}
  quality={85}
/>
```

#### Above-the-Fold Images

Use `priority` prop for images visible on initial page load:

```typescript
<Image
  src="/hero.jpg"
  alt="Hero image"
  fill
  priority
  quality={90}
  sizes="100vw"
/>
```

#### Below-the-Fold Images

Use lazy loading (default behavior):

```typescript
<Image
  src="/product.jpg"
  alt="Product"
  width={800}
  height={600}
  loading="lazy"
  quality={85}
/>
```

#### Responsive Images

Use `sizes` prop for responsive images:

```typescript
<Image
  src="/product.jpg"
  alt="Product"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  quality={85}
/>
```

### Image Optimization Best Practices

1. **Always specify dimensions** to prevent layout shift
2. **Use appropriate quality** (75-85 for most images, 90 for hero images)
3. **Use priority for above-the-fold** images only
4. **Optimize source images** before uploading (compress, resize)
5. **Use WebP/AVIF formats** (automatic with Next.js Image)
6. **Provide descriptive alt text** for SEO and accessibility

### Image Configuration

Current configuration in `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'images.unsplash.com' },
    { protocol: 'https', hostname: 'i.pravatar.cc' },
    { protocol: 'https', hostname: 'res.cloudinary.com' },
  ],
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
}
```

## Code Splitting

### Dynamic Imports

Use dynamic imports to split code and reduce initial bundle size.

#### Basic Dynamic Import

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
});
```

#### Disable SSR for Client-Only Components

```typescript
const ClientOnlyComponent = dynamic(() => import('./ClientOnlyComponent'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});
```

#### Current Implementation

Homepage uses dynamic imports for below-the-fold sections:

```typescript
// app/page.tsx
const HotSelling = dynamic(() => import("@/src/components/homepage/HotSelling"), {
  loading: () => <div className="py-20 bg-creme" />,
});
const Categories = dynamic(() => import("@/src/components/homepage/Categories"), {
  loading: () => <div className="py-20 bg-creme" />,
});
// ... more components
```

### When to Use Code Splitting

**Good candidates for code splitting:**
- Below-the-fold sections
- Modal dialogs
- Tabs and accordions
- Interactive widgets
- Large third-party libraries
- Admin/dashboard components
- Analytics and tracking scripts

**Not recommended for:**
- Above-the-fold content
- Critical navigation
- Small components (< 10KB)
- Frequently used utilities

## Caching Strategy

### API Response Caching

Use Next.js fetch with revalidate option:

```typescript
// Cache for 1 hour
const response = await fetch(url, {
  next: { revalidate: 3600 },
});

// Cache indefinitely (static)
const response = await fetch(url, {
  cache: 'force-cache',
});

// Never cache (dynamic)
const response = await fetch(url, {
  cache: 'no-store',
});
```

### Current Caching Configuration

**Product Pages**: 1 hour revalidation
**Collection Pages**: 1 hour revalidation
**Blog Posts**: 1 hour revalidation
**Sitemap**: 1 hour revalidation

### On-Demand Revalidation

Trigger revalidation when content changes:

```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const { type, slug } = await request.json();
  
  switch (type) {
    case 'product':
      revalidatePath(`/product/${slug}`);
      break;
    case 'blog':
      revalidatePath(`/blogs/${slug}`);
      break;
  }
  
  return Response.json({ revalidated: true });
}
```

## Bundle Size Optimization

### Analyzing Bundle Size

```bash
# Build and analyze
npm run build

# Install bundle analyzer
npm install -D @next/bundle-analyzer

# Configure in next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true npm run build
```

### Optimization Techniques

1. **Remove unused dependencies**
   ```bash
   npm uninstall unused-package
   ```

2. **Use tree-shaking**
   - Import only what you need
   - Avoid `import *` syntax
   ```typescript
   // Good
   import { useState } from 'react';
   
   // Bad
   import * as React from 'react';
   ```

3. **Lazy load heavy libraries**
   ```typescript
   const Chart = dynamic(() => import('chart.js'), { ssr: false });
   ```

4. **Use lighter alternatives**
   - date-fns instead of moment.js
   - preact instead of react (for specific use cases)
   - native browser APIs instead of libraries

### Current Bundle Targets

- **First Load JS**: < 200KB
- **Total Bundle Size**: < 500KB
- **Largest Chunk**: < 100KB

## Font Optimization

### Using Next.js Font Optimization

```typescript
// app/layout.tsx
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### Font Best Practices

1. **Use font-display: swap** to prevent invisible text
2. **Subset fonts** to include only needed characters
3. **Preload critical fonts** (automatic with Next.js)
4. **Limit font variations** (weights, styles)
5. **Use system fonts** as fallbacks

## JavaScript Optimization

### Minimize JavaScript Execution

1. **Remove console.log statements** in production
   ```typescript
   // Use environment check
   if (process.env.NODE_ENV === 'development') {
     console.log('Debug info');
   }
   ```

2. **Debounce expensive operations**
   ```typescript
   import { debounce } from 'lodash';
   
   const handleSearch = debounce((query) => {
     // Expensive search operation
   }, 300);
   ```

3. **Use React.memo for expensive components**
   ```typescript
   const ExpensiveComponent = React.memo(({ data }) => {
     // Component logic
   });
   ```

4. **Optimize re-renders**
   ```typescript
   // Use useCallback for functions
   const handleClick = useCallback(() => {
     // Handler logic
   }, [dependencies]);
   
   // Use useMemo for expensive calculations
   const expensiveValue = useMemo(() => {
     return calculateExpensiveValue(data);
   }, [data]);
   ```

### Third-Party Scripts

Load third-party scripts efficiently:

```typescript
import Script from 'next/script';

// Load after page is interactive
<Script
  src="https://example.com/script.js"
  strategy="lazyOnload"
/>

// Load before page is interactive
<Script
  src="https://example.com/critical.js"
  strategy="beforeInteractive"
/>

// Load after hydration
<Script
  src="https://example.com/analytics.js"
  strategy="afterInteractive"
/>
```

## CSS Optimization

### Tailwind CSS Optimization

Current configuration automatically purges unused CSS:

```javascript
// tailwind.config.ts
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // ... other config
};
```

### CSS Best Practices

1. **Use Tailwind utilities** instead of custom CSS
2. **Avoid inline styles** when possible
3. **Use CSS modules** for component-specific styles
4. **Minimize CSS-in-JS** runtime overhead
5. **Remove unused CSS** with PurgeCSS

## Server-Side Optimization

### API Response Time

1. **Optimize database queries**
   - Use indexes
   - Limit result sets
   - Use pagination

2. **Implement caching**
   - Redis for session data
   - CDN for static assets
   - API response caching

3. **Use connection pooling**
   - Reuse database connections
   - Configure appropriate pool size

### Edge Functions

Consider using Edge Functions for:
- Authentication checks
- A/B testing
- Redirects
- Geolocation-based content

## Monitoring and Measurement

### Real User Monitoring (RUM)

Track actual user performance:

```typescript
// app/layout.tsx
export function reportWebVitals(metric) {
  // Send to analytics
  if (metric.label === 'web-vital') {
    console.log(metric);
    // Send to your analytics service
  }
}
```

### Performance Monitoring Tools

1. **Google Search Console** - Core Web Vitals report
2. **Google Analytics** - Page load times
3. **Lighthouse CI** - Automated testing
4. **WebPageTest** - Detailed performance analysis
5. **Chrome DevTools** - Performance profiling

### Setting Up Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on: [push]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://yourdomain.com
            https://yourdomain.com/product/sample
            https://yourdomain.com/blogs/sample
          uploadArtifacts: true
```

## Performance Checklist

### Before Deployment

- [ ] All images use Next.js Image component
- [ ] Above-the-fold images have priority prop
- [ ] Below-the-fold components use dynamic imports
- [ ] Bundle size is within targets
- [ ] No console.log statements in production
- [ ] Fonts are optimized
- [ ] Third-party scripts use appropriate strategy
- [ ] API responses are cached appropriately
- [ ] Lighthouse scores meet targets

### After Deployment

- [ ] Monitor Core Web Vitals in Search Console
- [ ] Check real user metrics in Analytics
- [ ] Run Lighthouse audits on production
- [ ] Monitor server response times
- [ ] Check CDN cache hit rates
- [ ] Review error logs for performance issues

## Common Performance Issues

### Issue: High LCP (Largest Contentful Paint)

**Causes:**
- Large images not optimized
- Slow server response time
- Render-blocking resources

**Solutions:**
1. Optimize images with Next.js Image
2. Use priority prop for hero images
3. Implement caching
4. Use CDN for static assets
5. Optimize server response time

### Issue: High CLS (Cumulative Layout Shift)

**Causes:**
- Images without dimensions
- Fonts loading late
- Dynamic content insertion

**Solutions:**
1. Always specify width/height on images
2. Use font-display: swap
3. Reserve space for dynamic content
4. Avoid inserting content above existing content

### Issue: High TTI (Time to Interactive)

**Causes:**
- Large JavaScript bundles
- Long-running JavaScript
- Too many third-party scripts

**Solutions:**
1. Code split large components
2. Lazy load non-critical code
3. Optimize JavaScript execution
4. Defer third-party scripts

### Issue: Large Bundle Size

**Causes:**
- Unused dependencies
- Large libraries
- No code splitting

**Solutions:**
1. Remove unused dependencies
2. Use lighter alternatives
3. Implement code splitting
4. Analyze bundle with webpack-bundle-analyzer

## Advanced Optimization Techniques

### Prefetching

Prefetch pages user is likely to visit:

```typescript
import Link from 'next/link';

// Automatic prefetching (default)
<Link href="/product/chair" prefetch>
  View Product
</Link>

// Disable prefetching
<Link href="/product/chair" prefetch={false}>
  View Product
</Link>
```

### Preloading Critical Resources

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <link rel="preload" href="/fonts/font.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Service Workers

Implement service workers for offline support and caching:

```typescript
// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/styles.css',
        '/script.js',
      ]);
    })
  );
});
```

### HTTP/2 Server Push

Configure server to push critical resources:

```nginx
# nginx.conf
location / {
  http2_push /styles.css;
  http2_push /script.js;
}
```

## Resources

### Tools

- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

### Documentation

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web.dev Performance](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [React Performance](https://react.dev/learn/render-and-commit)

### Learning Resources

- [Web Performance Fundamentals](https://frontendmasters.com/courses/web-performance/)
- [Next.js Performance Patterns](https://nextjs.org/learn/seo/improve)
- [Google Web Fundamentals](https://developers.google.com/web/fundamentals/performance)

---

**Last Updated:** January 2025
**Version:** 1.0
**Maintained by:** CAFCOHOME Development Team
