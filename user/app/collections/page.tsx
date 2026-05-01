import { redirect } from 'next/navigation';

// /collections → /products
export default function CollectionsPage() {
  redirect('/products');
}
