/**
 * Cloudinary Image Transformation Utilities
 *
 * This module provides helper functions for generating Cloudinary URLs
 * with various transformations for responsive images and optimization.
 */

import { cloudinaryConfig } from "./config";

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "scale" | "crop" | "thumb" | "limit" | "pad";
  quality?: number | "auto";
  format?: "auto" | "webp" | "jpg" | "png";
  gravity?: "auto" | "face" | "center" | "north" | "south" | "east" | "west";
  aspectRatio?: string;
}

/**
 * Generates a Cloudinary URL with transformations
 * @param publicId - The public ID of the image in Cloudinary
 * @param options - Transformation options
 * @returns Transformed image URL
 */
export function getCloudinaryUrl(
  publicId: string,
  options: ImageTransformOptions = {},
): string {
  const { cloudName } = cloudinaryConfig;

  if (!cloudName) {
    console.warn("Cloudinary cloud name not configured");
    return publicId;
  }

  const transformations: string[] = [];

  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);
  if (options.gravity) transformations.push(`g_${options.gravity}`);
  if (options.aspectRatio) transformations.push(`ar_${options.aspectRatio}`);

  const transformString =
    transformations.length > 0 ? `${transformations.join(",")}/` : "";

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}${publicId}`;
}

/**
 * Generates a responsive image URL optimized for web
 * @param publicId - The public ID of the image in Cloudinary
 * @param width - Desired width
 * @returns Optimized image URL
 */
export function getResponsiveImageUrl(publicId: string, width: number): string {
  return getCloudinaryUrl(publicId, {
    width,
    quality: "auto",
    format: "auto",
    crop: "fill",
  });
}

/**
 * Generates a thumbnail URL
 * @param publicId - The public ID of the image in Cloudinary
 * @param size - Thumbnail size (default: 200)
 * @returns Thumbnail URL
 */
export function getThumbnailUrl(publicId: string, size: number = 200): string {
  return getCloudinaryUrl(publicId, {
    width: size,
    height: size,
    crop: "thumb",
    gravity: "auto",
    quality: "auto",
    format: "auto",
  });
}

/**
 * Generates srcset for responsive images
 * @param publicId - The public ID of the image in Cloudinary
 * @param widths - Array of widths for srcset
 * @returns srcset string
 */
export function generateSrcSet(
  publicId: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1536],
): string {
  return widths
    .map((width) => {
      const url = getResponsiveImageUrl(publicId, width);
      return `${url} ${width}w`;
    })
    .join(", ");
}

/**
 * Generates a product image URL with standard transformations
 * @param publicId - The public ID of the image in Cloudinary
 * @param width - Desired width (default: 800)
 * @returns Product image URL
 */
export function getProductImageUrl(
  publicId: string,
  width: number = 800,
): string {
  return getCloudinaryUrl(publicId, {
    width,
    quality: "auto",
    format: "auto",
    crop: "fill",
    gravity: "auto",
  });
}

/**
 * Extracts public ID from a full Cloudinary URL
 * @param url - Full Cloudinary URL
 * @returns Public ID or original URL if not a Cloudinary URL
 */
export function extractPublicId(url: string): string {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1] : url;
}

/**
 * Generates a WebP image URL with fallback
 * @param publicId - The public ID of the image in Cloudinary
 * @param width - Desired width
 * @returns WebP optimized image URL
 */
export function getWebPImageUrl(publicId: string, width?: number): string {
  return getCloudinaryUrl(publicId, {
    width,
    quality: 'auto',
    format: 'webp',
    crop: 'fill',
  });
}

/**
 * Generates image URLs for different screen densities (1x, 2x, 3x)
 * @param publicId - The public ID of the image in Cloudinary
 * @param baseWidth - Base width for 1x density
 * @returns Object with URLs for different densities
 */
export function getDensityUrls(publicId: string, baseWidth: number) {
  return {
    '1x': getResponsiveImageUrl(publicId, baseWidth),
    '2x': getResponsiveImageUrl(publicId, baseWidth * 2),
    '3x': getResponsiveImageUrl(publicId, baseWidth * 3),
  };
}

/**
 * Generates a blur placeholder URL for progressive loading
 * @param publicId - The public ID of the image in Cloudinary
 * @returns Tiny blurred image URL for placeholder
 */
export function getBlurPlaceholder(publicId: string): string {
  return getCloudinaryUrl(publicId, {
    width: 20,
    quality: 1,
    format: 'auto',
    crop: 'fill',
  });
}
