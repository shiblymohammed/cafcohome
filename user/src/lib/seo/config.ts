/**
 * SEO Configuration Module
 * Centralized configuration for SEO settings across the application
 */

export interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string;
  twitterHandle?: string;
  facebookAppId?: string;
  contactEmail?: string;
  organization: {
    name: string;
    logo: string;
    url: string;
    description: string;
    contactEmail?: string;
    socialProfiles?: string[];
  };
}

export const seoConfig: SEOConfig = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'DravoHome',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://dravohome.com',
  defaultTitle: 'DravoHome - Premium Furniture for Your Home',
  defaultDescription:
    'Discover premium furniture collections for every room. Shop bestsellers, hot-selling items, and exclusive collections at DravoHome. Transform your space with quality furniture and home decor.',
  defaultImage: '/og-default.jpg',
  twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE,
  facebookAppId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  organization: {
    name: 'DravoHome',
    logo: '/logo.png',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://dravohome.com',
    description:
      'DravoHome is a premium furniture retailer offering high-quality furniture and home decor for every room in your home. We specialize in modern, contemporary, and classic furniture designs.',
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    socialProfiles: [
      // Add social media URLs here
      // 'https://www.facebook.com/dravohome',
      // 'https://www.instagram.com/dravohome',
      // 'https://twitter.com/dravohome',
    ],
  },
};
