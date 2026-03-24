/**
 * Tests for Robots.txt Generation
 * Validates Requirements 1.1, 1.2, 1.3, 1.4, 1.5
 */

import { describe, it, expect } from 'vitest';

describe('Robots.txt Generation', () => {
  it('should generate robots.txt with correct structure', async () => {
    const robotsModule = await import('@/app/robots');
    const robots = robotsModule.default();

    // Requirement 1.1: Should provide robots.txt
    expect(robots).toBeDefined();

    // Requirement 1.2: Should allow all user agents
    expect(robots.rules).toBeDefined();
    expect(Array.isArray(robots.rules)).toBe(true);
    expect(robots.rules.length).toBeGreaterThan(0);
    
    const mainRule = robots.rules[0];
    expect(mainRule.userAgent).toBe('*');
    expect(mainRule.allow).toBe('/');

    // Requirement 1.4: Should disallow admin, API, and private paths
    expect(mainRule.disallow).toBeDefined();
    expect(Array.isArray(mainRule.disallow)).toBe(true);
    expect(mainRule.disallow).toContain('/api/');
    expect(mainRule.disallow).toContain('/admin/');
    expect(mainRule.disallow).toContain('/auth/');
    expect(mainRule.disallow).toContain('/checkout/');
    expect(mainRule.disallow).toContain('/profile/');
    expect(mainRule.disallow).toContain('/cart/');
    expect(mainRule.disallow).toContain('/wishlist/');

    // Requirement 1.3: Should reference sitemap location
    expect(robots.sitemap).toBeDefined();
    expect(typeof robots.sitemap).toBe('string');
    expect(robots.sitemap).toContain('/sitemap.xml');
  });

  it('should use correct base URL from environment', async () => {
    const robotsModule = await import('@/app/robots');
    const robots = robotsModule.default();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cafcohome.com';
    expect(robots.sitemap).toBe(`${baseUrl}/sitemap.xml`);
  });
});
