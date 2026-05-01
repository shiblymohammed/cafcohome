import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApiClient } from '@/src/lib/api/client';
import { generateMetadata as genMeta } from '@/src/lib/seo/utils';
import { generateBreadcrumbSchema } from '@/src/lib/seo/structured-data';
import CollectionClient from './CollectionClient';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const collection = await ApiClient.getCollectionBySlug(slug);
    return genMeta({
      title: collection.name,
      description: collection.description || collection.subtitle || `Shop the ${collection.name} collection`,
      image: collection.image_url,
      url: `/collections/${slug}`,
    });
  } catch {
    return genMeta({ title: 'Collection Not Found', description: '', noindex: true });
  }
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  try {
    const { slug } = await params;
    const collection = await ApiClient.getCollectionBySlug(slug);

    if (!collection || !collection.is_active) notFound();

    // Fetch products in this collection
    let products: any[] = [];
    if (collection.products && collection.products.length > 0) {
      // Products are embedded or we fetch by IDs
      products = collection.products_detail || [];
    }

    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Collections', url: '/products' },
      { name: collection.name, url: `/collections/${slug}` },
    ]);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <Suspense fallback={
          <div className="min-h-screen bg-creme pt-20 flex items-center justify-center font-primary text-alpha/60">
            Loading…
          </div>
        }>
          <CollectionClient collection={collection} products={products} />
        </Suspense>
      </>
    );
  } catch (error) {
    console.error('Collection page error:', error);
    notFound();
  }
}
