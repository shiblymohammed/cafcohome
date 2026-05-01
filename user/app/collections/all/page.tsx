import { redirect } from 'next/navigation';

// /collections/all → /products
export default function CollectionsAllPage() {
  redirect('/products');
}
