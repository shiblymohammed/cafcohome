import { MetadataRoute } from 'next';
import { ApiClient } from '@/src/lib/api/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dravohome.com';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/offers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  try {
    // Fetch dynamic content from backend API
    const [productsResponse, categories, subcategories, blogsResponse] = await Promise.all([
      ApiClient.getProducts({ page_size: '1000' }),
      ApiClient.getCategories(),
      ApiClient.getSubcategories(),
      ApiClient.getBlogPosts(1),
    ]);

    // Handle paginated products response
    const products = productsResponse.results || productsResponse;
    
    // Product pages
    const productPages: MetadataRoute.Sitemap = Array.isArray(products)
      ? products.map((product: any) => ({
          url: `${baseUrl}/product/${product.slug}`,
          lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.9,
        }))
      : [];

    // Category pages
    const categoryData = categories.results || categories;
    const categoryPages: MetadataRoute.Sitemap = Array.isArray(categoryData)
      ? categoryData.map((category: any) => ({
          url: `${baseUrl}/categories/${category.slug}`,
          lastModified: category.updated_at ? new Date(category.updated_at) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }))
      : [];

    // Subcategory pages
    const subcategoryData = subcategories.results || subcategories;
    const subcategoryPages: MetadataRoute.Sitemap = Array.isArray(subcategoryData)
      ? subcategoryData.map((subcategory: any) => ({
          url: `${baseUrl}/subcategories/${subcategory.slug}`,
          lastModified: subcategory.updated_at ? new Date(subcategory.updated_at) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }))
      : [];

    // Handle paginated blogs response
    const blogs = blogsResponse.results || blogsResponse;
    
    // Blog pages
    const blogPages: MetadataRoute.Sitemap = Array.isArray(blogs)
      ? blogs.map((blog: any) => ({
          url: `${baseUrl}/blogs/${blog.slug}`,
          lastModified: blog.updated_at ? new Date(blog.updated_at) : new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        }))
      : [];

    return [
      ...staticPages,
      ...productPages,
      ...categoryPages,
      ...subcategoryPages,
      ...blogPages,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages only if API fails
    return staticPages;
  }
}

// Revalidate sitemap every hour
export const revalidate = 3600;
