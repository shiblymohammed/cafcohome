/**
 * Cloudinary Configuration
 *
 * This module contains the Cloudinary configuration
 */

export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
};

/**
 * Validates that Cloudinary configuration is present
 * @throws Error if cloud name is missing
 */
export function validateCloudinaryConfig(): void {
  if (!cloudinaryConfig.cloudName) {
    throw new Error(
      "Missing Cloudinary cloud name. " +
        "Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable.",
    );
  }
}
