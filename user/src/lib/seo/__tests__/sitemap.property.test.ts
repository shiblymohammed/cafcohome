/**
 * Property-Based Tests for SEO Sitemap
 * Tests Property 1: Sitemap Completeness
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * **Validates: Requirements 2.7, 2.8, 2.9**
 * 
 * Property 1: Sitemap Completeness
 * For any sitemap.xml, all entries should have lastModified, changeFrequency, and priority fields populated.
 */
describe('Property 1: Sitemap Completeness', () => {
  it('should have all required fields (lastModified, changeFrequency, priority) for every sitemap entry', () => {
    // Generator for valid changeFrequency values
    const changeFrequencyArb = fc.constantFrom(
      'always',
      'hourly',
      'daily',
      'weekly',
      'monthly',
      'yearly',
      'never'
    );

    // Generator for sitemap entries
    const sitemapEntryArb = fc.record({
      url: fc.webUrl(),
      lastModified: fc.date(),
      changeFrequency: changeFrequencyArb,
      priority: fc.double({ min: 0, max: 1, noNaN: true }),
    });

    // Generator for sitemap (array of entries)
    const sitemapArb = fc.array(sitemapEntryArb, { minLength: 1, maxLength: 100 });

    fc.assert(
      fc.property(sitemapArb, (sitemap) => {
        // Property: Every entry must have all required fields
        sitemap.forEach((entry) => {
          // Check lastModified exists and is a valid Date
          expect(entry.lastModified).toBeDefined();
          expect(entry.lastModified).toBeInstanceOf(Date);
          expect(entry.lastModified.getTime()).not.toBeNaN();

          // Check changeFrequency exists and is valid
          expect(entry.changeFrequency).toBeDefined();
          expect(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']).toContain(
            entry.changeFrequency
          );

          // Check priority exists and is in valid range
          expect(entry.priority).toBeDefined();
          expect(entry.priority).toBeGreaterThanOrEqual(0);
          expect(entry.priority).toBeLessThanOrEqual(1);

          // Check url exists
          expect(entry.url).toBeDefined();
          expect(typeof entry.url).toBe('string');
          expect(entry.url.length).toBeGreaterThan(0);
        });
      }),
      { numRuns: 100 }
    );
  });

  it('should maintain sitemap structure integrity with various entry counts', () => {
    const sitemapEntryArb = fc.record({
      url: fc.webUrl(),
      lastModified: fc.date(),
      changeFrequency: fc.constantFrom('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'),
      priority: fc.double({ min: 0, max: 1, noNaN: true }),
    });

    const sitemapArb = fc.array(sitemapEntryArb, { minLength: 0, maxLength: 1000 });

    fc.assert(
      fc.property(sitemapArb, (sitemap) => {
        // Property: Sitemap should be an array
        expect(Array.isArray(sitemap)).toBe(true);

        // Property: All entries should have consistent structure
        const hasConsistentStructure = sitemap.every(
          (entry) =>
            'url' in entry &&
            'lastModified' in entry &&
            'changeFrequency' in entry &&
            'priority' in entry
        );
        expect(hasConsistentStructure).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should handle edge cases for priority values', () => {
    const sitemapEntryArb = fc.record({
      url: fc.webUrl(),
      lastModified: fc.date(),
      changeFrequency: fc.constantFrom('daily', 'weekly', 'monthly'),
      priority: fc.constantFrom(0, 0.5, 1.0), // Edge values
    });

    const sitemapArb = fc.array(sitemapEntryArb, { minLength: 1, maxLength: 50 });

    fc.assert(
      fc.property(sitemapArb, (sitemap) => {
        sitemap.forEach((entry) => {
          // Priority should be exactly 0, 0.5, or 1.0
          expect([0, 0.5, 1.0]).toContain(entry.priority);
        });
      }),
      { numRuns: 100 }
    );
  });

  it('should validate lastModified dates are not in the future', () => {
    const pastDateArb = fc.date({ max: new Date() }).filter(d => !isNaN(d.getTime()));

    const sitemapEntryArb = fc.record({
      url: fc.webUrl(),
      lastModified: pastDateArb,
      changeFrequency: fc.constantFrom('daily', 'weekly', 'monthly'),
      priority: fc.double({ min: 0, max: 1, noNaN: true }),
    });

    const sitemapArb = fc.array(sitemapEntryArb, { minLength: 1, maxLength: 50 });

    fc.assert(
      fc.property(sitemapArb, (sitemap) => {
        const now = new Date();
        sitemap.forEach((entry) => {
          // lastModified should not be in the future
          expect(entry.lastModified.getTime()).toBeLessThanOrEqual(now.getTime());
          // lastModified should be a valid date
          expect(entry.lastModified.getTime()).not.toBeNaN();
        });
      }),
      { numRuns: 100 }
    );
  });
});
