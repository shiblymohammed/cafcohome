/**
 * Tests for PWA Manifest Generation
 * Validates Requirements 20.1-20.9
 */

import { describe, it, expect } from 'vitest';

describe('PWA Manifest Generation', () => {
  it('should generate manifest with all required fields', async () => {
    const manifestModule = await import('@/app/manifest');
    const manifest = manifestModule.default();

    // Requirement 20.2: Should include application name
    expect(manifest.name).toBeDefined();
    expect(manifest.name).toBe('CAFCOHOME - Premium Furniture');

    // Requirement 20.3: Should include short name
    expect(manifest.short_name).toBeDefined();
    expect(manifest.short_name).toBe('CAFCOHOME');

    // Requirement 20.4: Should include description
    expect(manifest.description).toBeDefined();
    expect(typeof manifest.description).toBe('string');
    expect(manifest.description.length).toBeGreaterThan(0);

    // Requirement 20.5: Should include start URL
    expect(manifest.start_url).toBeDefined();
    expect(manifest.start_url).toBe('/');

    // Requirement 20.6: Should include display mode
    expect(manifest.display).toBeDefined();
    expect(manifest.display).toBe('standalone');

    // Requirement 20.7: Should include theme color
    expect(manifest.theme_color).toBeDefined();
    expect(manifest.theme_color).toBe('#1A1A1A');

    // Requirement 20.8: Should include background color
    expect(manifest.background_color).toBeDefined();
    expect(manifest.background_color).toBe('#F5F1E8');

    // Requirement 20.9: Should include icon sets
    expect(manifest.icons).toBeDefined();
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);

    // Verify 192x192 icon
    const icon192 = manifest.icons.find((icon) => icon.sizes === '192x192');
    expect(icon192).toBeDefined();
    expect(icon192?.src).toBe('/icon-192.png');
    expect(icon192?.type).toBe('image/png');

    // Verify 512x512 icon
    const icon512 = manifest.icons.find((icon) => icon.sizes === '512x512');
    expect(icon512).toBeDefined();
    expect(icon512?.src).toBe('/icon-512.png');
    expect(icon512?.type).toBe('image/png');
  });

  it('should have valid color formats', async () => {
    const manifestModule = await import('@/app/manifest');
    const manifest = manifestModule.default();

    // Validate hex color format
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    expect(manifest.theme_color).toMatch(hexColorRegex);
    expect(manifest.background_color).toMatch(hexColorRegex);
  });
});
