"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ProductCard,
  ProductCardImage,
  ProductCardImageContainer,
  ProductCardTitle,
  ProductCardDescription,
  ProductCardMeta,
  ProductCardRating,
  ProductCardWishlist,
  ProductCardBadgeGroup,
  ProductCardPrice,
} from "@/src/components/ui/ProductCard";

interface Collection {
  id: number;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  image_url: string;
  tags: string;
  is_active: boolean;
  product_count: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  mrp: number;
  average_rating?: number;
  review_count?: number;
  category_name: string;
  subcategory_name: string;
  brand_name: string | null;
  images: Array<{ url: string; alt?: string }>;
  is_bestseller: boolean;
  is_hot_selling: boolean;
  is_in_stock: boolean;
}

interface Props {
  collection: Collection;
  products: Product[];
}

export default function CollectionClient({ collection, products }: Props) {
  return (
    <main className="bg-creme min-h-screen pt-16 md:pt-20 pb-20">
      {/* Hero */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        {collection.image_url ? (
          <Image
            src={collection.image_url}
            alt={collection.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-alpha" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-alpha via-alpha/50 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 lg:px-12 pb-10 md:pb-16">
            <nav className="flex items-center gap-2 text-[10px] text-creme/60 mb-4 font-primary">
              <Link href="/" className="hover:text-creme transition-colors">Home</Link>
              <span>/</span>
              <Link href="/products" className="hover:text-creme transition-colors">Collections</Link>
              <span>/</span>
              <span className="text-creme">{collection.name}</span>
            </nav>
            {collection.subtitle && (
              <p className="text-[10px] uppercase tracking-[0.3em] text-creme/60 mb-2 font-primary">
                {collection.subtitle}
              </p>
            )}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-secondary text-creme leading-tight mb-3">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="text-sm text-creme/80 font-primary max-w-xl leading-relaxed">
                {collection.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 pt-12">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-alpha/60 font-primary mb-6">
              No products in this collection yet.
            </p>
            <Link
              href="/products"
              className="text-xs uppercase tracking-widest font-primary border-b border-alpha pb-1 hover:text-tango hover:border-tango transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-alpha/60 font-primary mb-8">
              {products.length} piece{products.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[3px] md:gap-1">
              {products.map((product) => {
                const mainImage = product.images?.[0]?.url || "/placeholder-product.svg";
                const badges = [
                  ...(product.is_bestseller ? [{ label: "Bestseller", variant: "gold" as const }] : []),
                  ...(product.is_hot_selling ? [{ label: "Hot", variant: "sale" as const }] : []),
                  ...(!product.is_in_stock ? [{ label: "Out of Stock", variant: "limited" as const }] : []),
                ];
                return (
                  <ProductCard key={product.id} href={`/product/${product.slug}`}>
                    <ProductCardImageContainer>
                      {badges.length > 0 && <ProductCardBadgeGroup badges={badges} />}
                      <ProductCardImage src={mainImage} alt={product.name} />
                      <ProductCardWishlist product={product} />
                    </ProductCardImageContainer>
                    <div className="flex flex-col items-start px-1.5 md:px-2 py-2 md:py-3">
                      <ProductCardTitle>{product.name}</ProductCardTitle>
                      <ProductCardDescription>{product.description}</ProductCardDescription>
                      <ProductCardMeta
                        collection={product.brand_name || product.category_name}
                        category={product.subcategory_name}
                      />
                      <ProductCardRating
                        rating={product.average_rating || 0}
                        reviewCount={product.review_count || 0}
                      />
                      <ProductCardPrice price={product.price} mrp={product.mrp} />
                    </div>
                  </ProductCard>
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
