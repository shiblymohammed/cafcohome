# SEO Property-Based Testing

This directory contains comprehensive property-based tests for the SEO implementation using fast-check.

## Overview

Property-based testing validates that the SEO system maintains correctness properties across a wide range of randomly generated inputs. Each test runs 100+ iterations with different random data to ensure robustness.

## Test Files

### seo-properties.test.ts

Main property-based test suite covering all 14 correctness properties defined in the design document.

## Properties Tested

### Property 1: Sitemap Completeness
Validates that all sitemap entries have required fields (lastModified, changeFrequency, priority) with valid values.

### Property 2: Product Metadata Completeness
Ensures product pages generate complete metadata including title, description, canonical URL, Open Graph tags, Twitter Cards, and keywords.

### Property 3: Collection Metadata Completeness
Validates collection pages have all required metadata fields properly populated.

### Property 4: Category Metadata Completeness
Ensures category pages generate complete metadata with all required fields.

### Property 5: Blog Post Metadata Completeness
Validates blog posts have complete metadata including article-specific Open Graph fields (publishedTime, modifiedTime, author).

### Property 6: Product Structured Data Completeness
Ensures product structured data (JSON-LD) includes all required schema.org fields: name, description, image, SKU, brand, offers with price, currency, availability, and condition.

### Property 7: Breadcrumb Structured Data Completeness
Validates breadcrumb structured data has proper hierarchy with sequential positions and all required fields (position, name, item).

### Property 8: Article Structured Data Completeness
Ensures blog posts generate valid article structured data with headline, description, image, dates, author, and publisher information.

### Property 9: Open Graph Tag Completeness
Validates that all pages include required Open Graph tags: og:title, og:description, og:image, og:url, og:type, og:site_name, og:locale.

### Property 10: Twitter Card Completeness
Ensures all pages have required Twitter Card tags: twitter:card, twitter:title, twitter:description, twitter:image.

### Property 11: Canonical URL Normalization
Validates that canonical URLs are properly normalized (absolute URLs, lowercase, no trailing slashes, no query parameters).

### Property 12: Organization Schema Completeness
Ensures the homepage includes valid organization structured data with all required fields.

### Property 13: Error Page Metadata
Validates that error pages (404, 500) have proper metadata with noindex directives.

### Property 14: Static Page Metadata Completeness
Ensures static pages (about, contact, offers) have complete metadata with all required fields.

## Running Tests

```bash
# Run all tests
npm test

# Run only property-based tests
npm test -- src/lib/seo/__tests__/seo-properties.test.ts

# Run with watch mode
npm run test:watch

# Run with UI
npm run test:ui
```

## Test Configuration

- **Test Framework**: Vitest
- **Property Testing Library**: fast-check v4.5.3
- **Number of Runs**: 100 iterations per property
- **Shrinking**: Enabled (automatically finds minimal failing examples)

## Arbitraries (Data Generators)

The test suite uses custom arbitraries to generate realistic test data:

- `productArbitrary`: Generates random product data
- `variantArbitrary`: Generates random product variant data
- `blogPostArbitrary`: Generates random blog post data
- `breadcrumbItemsArbitrary`: Generates random breadcrumb hierarchies
- `sitemapEntryArbitrary`: Generates random sitemap entries
- `imageUrlArbitrary`: Generates random image URLs (both absolute and relative)
- `urlPathArbitrary`: Generates random URL paths

## Benefits of Property-Based Testing

1. **Comprehensive Coverage**: Tests thousands of input combinations automatically
2. **Edge Case Discovery**: Finds edge cases that manual tests might miss
3. **Regression Prevention**: Ensures properties hold true across code changes
4. **Documentation**: Properties serve as executable specifications
5. **Shrinking**: When a test fails, fast-check automatically finds the minimal failing example

## Example Output

When all tests pass:
```
✓ src/lib/seo/__tests__/seo-properties.test.ts (17 tests) 75ms
  ✓ Property 1: Sitemap Completeness
  ✓ Property 2: Product Metadata Completeness
  ✓ Property 3: Collection Metadata Completeness
  ...
```

When a test fails, fast-check provides:
- The seed for reproducibility
- The minimal counterexample that causes failure
- The shrinking path taken to find the minimal example

## Maintenance

When adding new SEO features:

1. Define the correctness property in the design document
2. Create an arbitrary for generating test data
3. Write a property test that validates the correctness property
4. Run tests with 100+ iterations to ensure robustness

## References

- [fast-check Documentation](https://github.com/dubzzz/fast-check)
- [Property-Based Testing Guide](https://hypothesis.works/articles/what-is-property-based-testing/)
- [Schema.org Documentation](https://schema.org/)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
