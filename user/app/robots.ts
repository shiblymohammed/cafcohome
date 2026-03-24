import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cafcohome.com';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
          '/checkout/',
          '/profile/',
          '/cart/',
          '/wishlist/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
