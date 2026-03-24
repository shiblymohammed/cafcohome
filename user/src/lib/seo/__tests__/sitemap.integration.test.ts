/**
 * Integration Tests for Sitemap Generation
 * Validates that the sitemap function produces correct output structure
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { MetadataRoute } from 'next';

// Mock the API client
vi.mock('@/src/lib/api/client', () => ({
  ApiClient: {
    getProducts: vi.fn(),
    getCategories: vi.fn(),
    getSubcategories: vi.fn(),
    getBlogPosts: vi.fn(),
  },
}));

describe('Sitemap Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate sitemap with static pages when API calls fail', async () => {
    const { ApiClient } = await import('@/src/lib/api/client');
    
    // Mock API failures
    vi.mocked(ApiClient.getProducts).mockRejectedValue(new Error('API Error'));
    vi.mocked(ApiClient.getCategories).mockRejectedValue(new Error('API Error'));
    vi.mocked(ApiClient.getSubcategories).mockRejectedValue(new Error('API Error'));
    vi.mocked(ApiClient.getBlogPosts).mockRejectedValue(new Error('API Error'));

    // Import sitemap function after mocks are set up
    const sitemapModule = await import('@/app/sitemap');
    const sitemap = await sitemapModule.default();

    // Should return at least static pages
    expect(Array.isArray(sitemap)).toBe(true);
    expect(sitemap.length).toBeGreaterThan(0);

    // Verify static pages are present
    const urls = sitemap.map((entry) => entry.url);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cafcohome.com';
    
    expect(urls).toContain(baseUrl);
    expect(urls).toContain(`${baseUrl}/about`);
    expect(urls).toContain(`${baseUrl}/contact`);
    expect(urls).toContain(`${baseUrl}/offers`);
    expect(urls).toContain(`${baseUrl}/blogs`);

    // Verify all entries have required fields
    sitemap.forEach((entry) => {
      expect(entry.url).toBeDefined();
      expect(entry.lastModified).toBeInstanceOf(Date);
      expect(entry.changeFrequency).toBeDefined();
      expect(entry.priority).toBeDefined();
      expect(entry.priority).toBeGreaterThanOrEqual(0);
      expect(entry.priority).toBeLessThanOrEqual(1);
    });
  });

  it('should include dynamic content when API calls succeed', async () => {
    const { ApiClient } = await import('@/src/lib/api/client');
    
    // Mock successful API responses
    vi.mocked(ApiClient.getProducts).mockResolvedValue({
      results: [
        { slug: 'product-1', updated_at: '2024-01-01T00:00:00Z' },
        { slug: 'product-2', updated_at: '2024-01-02T00:00:00Z' },
      ],
    });

    vi.mocked(ApiClient.getCategories).mockResolvedValue([
      { slug: 'category-1', updated_at: '2024-01-01T00:00:00Z' },
    ]);

    vi.mocked(ApiClient.getSubcategories).mockResolvedValue([
      { slug: 'subcategory-1', updated_at: '2024-01-01T00:00:00Z' },
    ]);

    vi.mocked(ApiClient.getBlogPosts).mockResolvedValue({
      results: [
        { slug: 'blog-1', updated_at: '2024-01-01T00:00:00Z' },
      ],
    });

    // Clear module cache to get fresh import
    vi.resetModules();
    const sitemapModule = await import('@/app/sitemap');
    const sitemap = await sitemapModule.default();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cafcohome.com';
    const urls = sitemap.map((entry) => entry.url);

    // Should include static pages
    expect(urls).toContain(baseUrl);
    
    // Should include dynamic pages
    expect(urls).toContain(`${baseUrl}/product/product-1`);
    expect(urls).toContain(`${baseUrl}/product/product-2`);
    expect(urls).toContain(`${baseUrl}/categories/category-1`);
    expect(urls).toContain(`${baseUrl}/subcategories/subcategory-1`);
    expect(urls).toContain(`${baseUrl}/blogs/blog-1`);

    // Verify all entries have required fields (Property 1)
    sitemap.forEach((entry) => {
      expect(entry.url).toBeDefined();
      expect(entry.lastModified).toBeInstanceOf(Date);
      expect(entry.changeFrequency).toBeDefined();
      expect(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']).toContain(
        entry.changeFrequency
      );
      expect(entry.priority).toBeDefined();
      expect(entry.priority).toBeGreaterThanOrEqual(0);
      expect(entry.priority).toBeLessThanOrEqual(1);
    });
  });

  it('should set correct priorities for different page types', async () => {
    const { ApiClient } = await import('@/src/lib/api/client');
    
    vi.mocked(ApiClient.getProducts).mockResolvedValue({
      results: [{ slug: 'product-1', updated_at: '2024-01-01T00:00:00Z' }],
    });
    vi.mocked(ApiClient.getCategories).mockResolvedValue([
      { slug: 'category-1', updated_at: '2024-01-01T00:00:00Z' },
    ]);
    vi.mocked(ApiClient.getSubcategories).mockResolvedValue([
      { slug: 'subcategory-1', updated_at: '2024-01-01T00:00:00Z' },
    ]);
    vi.mocked(ApiClient.getBlogPosts).mockResolvedValue({
      results: [{ slug: 'blog-1', updated_at: '2024-01-01T00:00:00Z' }],
    });

    vi.resetModules();
    const sitemapModule = await import('@/app/sitemap');
    const sitemap = await sitemapModule.default();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cafcohome.com';

    // Find entries by URL
    const homepage = sitemap.find((e) => e.url === baseUrl);
    const productPage = sitemap.find((e) => e.url === `${baseUrl}/product/product-1`);
    const categoryPage = sitemap.find((e) => e.url === `${baseUrl}/categories/category-1`);
    const blogPage = sitemap.find((e) => e.url === `${baseUrl}/blogs/blog-1`);

    // Verify priorities according to design
    expect(homepage?.priority).toBe(1.0); // Homepage highest priority
    expect(productPage?.priority).toBe(0.9); // Products high priority
    expect(categoryPage?.priority).toBe(0.8); // Categories medium-high
    expect(blogPage?.priority).toBe(0.7); // Blogs medium
  });

  it('should set correct change frequencies for different page types', async () => {
    const { ApiClient } = await import('@/src/lib/api/client');
    
    vi.mocked(ApiClient.getProducts).mockResolvedValue({
      results: [{ slug: 'product-1', updated_at: '2024-01-01T00:00:00Z' }],
    });
    vi.mocked(ApiClient.getCategories).mockResolvedValue([
      { slug: 'category-1', updated_at: '2024-01-01T00:00:00Z' },
    ]);
    vi.mocked(ApiClient.getSubcategories).mockResolvedValue([]);
    vi.mocked(ApiClient.getBlogPosts).mockResolvedValue({
      results: [{ slug: 'blog-1', updated_at: '2024-01-01T00:00:00Z' }],
    });

    vi.resetModules();
    const sitemapModule = await import('@/app/sitemap');
    const sitemap = await sitemapModule.default();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cafcohome.com';

    const homepage = sitemap.find((e) => e.url === baseUrl);
    const productPage = sitemap.find((e) => e.url === `${baseUrl}/product/product-1`);
    const blogPage = sitemap.find((e) => e.url === `${baseUrl}/blogs/blog-1`);

    // Verify change frequencies according to design
    expect(homepage?.changeFrequency).toBe('daily');
    expect(productPage?.changeFrequency).toBe('weekly');
    expect(blogPage?.changeFrequency).toBe('monthly');
  });
});
