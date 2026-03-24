/**
 * Type definitions for the application
 */

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  collection: string;
  collection_name?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  is_active: boolean;
  created_at: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  colors: Array<{ name: string; hex: string }>;
  materials: string[];
  collection: string;
  collection_name?: string;
  category: string;
  category_name?: string;
  brand?: string;
  brand_name?: string;
  images: ProductImage[];
  is_bestseller: boolean;
  is_hot_selling: boolean;
  is_in_stock: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  apply_to: 'product' | 'collection' | 'category' | 'brand';
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface ProductFilters {
  collection?: string;
  category?: string;
  brand?: string;
  material?: string;
  color?: string;
  search?: string;
  is_bestseller?: boolean;
  is_hot_selling?: boolean;
  sort?: 'newest' | 'featured';
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type OrderStage = 'order_received' | 'processing' | 'shipped' | 'delivered';

export interface OrderItem {
  id: string;
  product: string;
  product_snapshot: {
    name: string;
    slug: string;
    images: ProductImage[];
    dimensions?: any;
  };
  quantity: number;
  unit_price: string;
  discount: string;
  total: string;
}

export interface OrderTracking {
  id: string;
  stage: OrderStage;
  updated_by: string;
  notes: string;
  timestamp: string;
}

export interface Order {
  id: string;
  order_number: string;
  user: string;
  delivery_address: string;
  phone_number: string;
  stage: OrderStage;
  assigned_to: string | null;
  subtotal: string;
  discount: string;
  total: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  tracking_history: OrderTracking[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url: string;
  author: string;
  author_name?: string;
  meta_title: string;
  meta_description: string;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone_number: string;
  message: string;
}
