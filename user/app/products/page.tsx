import { Metadata } from 'next';
import { Suspense } from 'react';
import { ApiClient } from '@/src/lib/api/client';
import ProductsClient from './ProductsClient';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; bestseller?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const isSearch = !!params.q;
  const title = isSearch
    ? `Search: "${params.q}" — DravoHome`
    : 'All Products — DravoHome';
  const description = isSearch
    ? `Search results for "${params.q}". Browse our full furniture collection.`
    : 'Browse our complete furniture collection. Filter by category, material, color and more.';

  return {
    title,
    description,
    robots: isSearch ? { index: false } : undefined,
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;

  // Fetch categories and brands for filter sidebar
  const [categoriesRes, brandsRes] = await Promise.allSettled([
    ApiClient.getCategories(),
    ApiClient.getBrands(),
  ]);

  const categories =
    categoriesRes.status === 'fulfilled'
      ? (categoriesRes.value as any[]).filter?.((c: any) => c.is_active) ??
        ((categoriesRes.value as any).results || []).filter((c: any) => c.is_active)
      : [];

  const brands =
    brandsRes.status === 'fulfilled'
      ? (brandsRes.value as any[]).filter?.((b: any) => b.is_active) ??
        ((brandsRes.value as any).results || []).filter((b: any) => b.is_active)
      : [];

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-creme pt-24 flex items-center justify-center">
          <div className="text-alpha/40 font-primary uppercase tracking-widest text-sm animate-pulse">
            Loading…
          </div>
        </div>
      }
    >
      <ProductsClient
        initialParams={params}
        categories={categories}
        brands={brands}
      />
    </Suspense>
  );
}
