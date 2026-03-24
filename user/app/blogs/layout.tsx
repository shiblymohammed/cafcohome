import { Metadata } from 'next';
import { generateMetadata as genMeta } from '@/src/lib/seo/utils';

export async function generateMetadata(): Promise<Metadata> {
  return genMeta({
    title: 'Blog - Stories & Insights',
    description: 'Explore our collection of articles on design, craftsmanship, and the art of creating beautiful living spaces. Discover tips, trends, and inspiration for your home.',
    url: '/blogs',
    keywords: ['furniture blog', 'home decor blog', 'design tips', 'interior design', 'furniture trends', 'home inspiration'],
  });
}

export default function BlogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}