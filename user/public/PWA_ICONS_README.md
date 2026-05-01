# PWA Icons Required

This folder needs the following PWA icons for the Progressive Web App manifest:

## Required Icons

1. **icon-192.png** (192x192 pixels)
   - Standard PWA icon size
   - Should contain the DravoHome logo
   - PNG format with transparent background recommended

2. **icon-512.png** (512x512 pixels)
   - High-resolution PWA icon
   - Should contain the DravoHome logo
   - PNG format with transparent background recommended

3. **logo.png** (recommended size: 200x200 or larger)
   - Company logo for structured data
   - Referenced in SEO configuration
   - PNG format with transparent background recommended

4. **og-default.jpg** (1200x630 pixels)
   - Default Open Graph image for social media sharing
   - Should contain DravoHome branding
   - JPG or PNG format

## How to Create These Icons

1. Use your existing DravoHome logo
2. Resize to the required dimensions using an image editor
3. Ensure the logo is centered and has appropriate padding
4. Save with the exact filenames listed above
5. Place all files in the `/public` folder

## Tools for Icon Generation

- **Online**: https://realfavicongenerator.net/
- **CLI**: `npm install -g pwa-asset-generator`
- **Manual**: Use Photoshop, GIMP, or Figma

## Testing

After adding the icons, test the PWA manifest at:
- Local: http://localhost:3000/manifest.json
- Production: https://dravohome.com/manifest.json

Use Chrome DevTools > Application > Manifest to verify the icons are loading correctly.
