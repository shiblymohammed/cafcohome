/**
 * Image configuration for the admin panel
 * Defines aspect ratios and settings for different image types
 */

export interface AspectRatioConfig {
  readonly value: number;
  readonly label: string;
  readonly width: number;
  readonly height: number;
}

export interface ImageTypeConfig {
  readonly aspectRatio: number;
  readonly label: string;
  readonly description: string;
  readonly allowMultiple: boolean;
  readonly maxFiles?: number;
  readonly presets: readonly AspectRatioConfig[];
}

/**
 * Aspect ratio presets
 */
export const ASPECT_RATIOS = {
  SQUARE: { value: 1, label: '1:1 (Square)', width: 800, height: 800 },
  PORTRAIT: { value: 4/5, label: '4:5 (Portrait)', width: 800, height: 1000 },
  STANDARD: { value: 4/3, label: '4:3 (Standard)', width: 800, height: 600 },
  PHOTO: { value: 3/2, label: '3:2 (Photo)', width: 900, height: 600 },
  WIDE: { value: 16/9, label: '16:9 (Wide)', width: 1200, height: 675 },
  ULTRAWIDE: { value: 21/9, label: '21:9 (Ultra Wide)', width: 1400, height: 600 },
  FREE: { value: 0, label: 'Free (No Constraint)', width: 0, height: 0 },
} as const;

/**
 * Image type configurations
 */
export const IMAGE_TYPES = {
  PRODUCT: {
    aspectRatio: 4/5,
    label: 'Product Image',
    description: 'Product images should be 4:5 ratio (800x1000px recommended) - Portrait orientation',
    allowMultiple: true,
    maxFiles: 10,
    presets: [ASPECT_RATIOS.PORTRAIT], // 4:5 for products to match storefront
  },
  CATEGORY: {
    aspectRatio: 4/5,
    label: 'Category Image',
    description: 'Category images should be 4:5 ratio (800x1000px recommended) - Portrait orientation',
    allowMultiple: false,
    presets: [ASPECT_RATIOS.PORTRAIT],
  },
  SUBCATEGORY: {
    aspectRatio: 4/5,
    label: 'Subcategory Image',
    description: 'Subcategory images should be 4:5 ratio (800x1000px recommended) - Portrait orientation',
    allowMultiple: false,
    presets: [ASPECT_RATIOS.PORTRAIT],
  },
  BRAND: {
    aspectRatio: 1,
    label: 'Brand Logo',
    description: 'Brand logos should be square 1:1 ratio (400x400px recommended)',
    allowMultiple: false,
    presets: [ASPECT_RATIOS.SQUARE],
  },
  OFFER: {
    aspectRatio: 16/9,
    label: 'Offer Banner',
    description: 'Offer banners should be 16:9 ratio (1200x675px recommended)',
    allowMultiple: false,
    presets: [ASPECT_RATIOS.WIDE, ASPECT_RATIOS.ULTRAWIDE],
  },
  BLOG: {
    aspectRatio: 16/9,
    label: 'Blog Featured Image',
    description: 'Blog featured images should be 16:9 ratio (1200x675px recommended)',
    allowMultiple: false,
    presets: [ASPECT_RATIOS.WIDE],
  },
} as const;

// Alias for backward compatibility
export const IMAGE_CONFIGS = {
  product: IMAGE_TYPES.PRODUCT,
  category: IMAGE_TYPES.CATEGORY,
  subcategory: IMAGE_TYPES.SUBCATEGORY,
  brand: IMAGE_TYPES.BRAND,
  offer: IMAGE_TYPES.OFFER,
  blog: IMAGE_TYPES.BLOG,
};

/**
 * Default crop settings
 */
export const DEFAULT_CROP_SETTINGS = {
  quality: 0.9, // 90% JPEG quality
  maxSize: 5 * 1024 * 1024, // 5MB
  outputFormat: 'image/jpeg' as const,
  rotation: 0,
  zoom: 1,
};

/**
 * Get image type configuration
 */
export const getImageTypeConfig = (type: keyof typeof IMAGE_TYPES): ImageTypeConfig => {
  return IMAGE_TYPES[type];
};

/**
 * Get aspect ratio for a specific image type
 */
export const getAspectRatio = (type: keyof typeof IMAGE_TYPES): number => {
  return IMAGE_TYPES[type].aspectRatio;
};

/**
 * Get recommended dimensions for an image type
 */
export const getRecommendedDimensions = (type: keyof typeof IMAGE_TYPES): { width: number; height: number } => {
  const config = IMAGE_TYPES[type];
  const preset = config.presets[0]; // Use first preset as default
  return { width: preset.width, height: preset.height };
};
