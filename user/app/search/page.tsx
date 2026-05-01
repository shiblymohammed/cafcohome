import { redirect } from 'next/navigation';

// /search?q=... → /products?q=...
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q || '';
  redirect(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
}
