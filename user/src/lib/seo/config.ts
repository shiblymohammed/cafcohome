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
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'CAFCOHOME',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://cafcohome.com',
  defaultTitle: 'CAFCOHOME - Premium Furniture for Your Home',
  defaultDescription:
    'Discover premium furniture collections for every room. Shop bestsellers, hot-selling items, and exclusive collections at CAFCOHOME. Transform your space with quality furniture and home decor.',
  defaultImage: '/og-default.jpg',
  twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE,
  facebookAppId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  organization: {
    name: 'CAFCOHOME',
    logo: '/logo.png',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://cafcohome.com',
    description:
      'CAFCOHOME is a premium furniture retailer offering high-quality furniture and home decor for every room in your home. We specialize in modern, contemporary, and classic furniture designs.',
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    socialProfiles: [
      // Add social media URLs here
      // 'https://www.facebook.com/cafcohome',
      // 'https://www.instagram.com/cafcohome',
      // 'https://twitter.com/cafcohome',
    ],
  },
};
