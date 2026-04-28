
import { getSession } from "next-auth/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    public error: ApiError,
  ) {
    super(error.message);
    this.name = "ApiClientError";
  }
}

// Type for request interceptor
type RequestInterceptor = (config: RequestInit) => RequestInit | Promise<RequestInit>;

// Type for response interceptor
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

// Interceptor storage
const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];

/**
 * Add a request interceptor
 */
export function addRequestInterceptor(interceptor: RequestInterceptor): void {
  requestInterceptors.push(interceptor);
}

/**
 * Add a response interceptor
 */
export function addResponseInterceptor(interceptor: ResponseInterceptor): void {
  responseInterceptors.push(interceptor);
}

/**
 * Default request interceptor to add auth token from NextAuth Session
 * Only adds token for endpoints that require authentication
 */
addRequestInterceptor(async (config) => {
  // List of endpoints that require authentication
  const authRequiredEndpoints = [
    '/orders',
    '/profile',
    '/users/profile',
    '/users',
    '/auth/logout',
    '/contact'
  ];
  
  // Check if this is a write operation (POST, PUT, PATCH, DELETE) or requires auth
  const isWriteOperation = config.method && !['GET', 'HEAD', 'OPTIONS'].includes(config.method.toUpperCase());
  
  // Check if the URL requires authentication
  const url = typeof config.url === 'string' ? config.url : '';
  const requiresAuth = authRequiredEndpoints.some(endpoint => url.includes(endpoint));
  
  // Only add token for write operations or auth-required endpoints
  if (isWriteOperation || requiresAuth) {
    const session = await getSession();
    const token = session?.accessToken;

    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
});

/**
 * Default response interceptor
 */
addResponseInterceptor(async (response) => {
  return response;
});

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryableStatuses: number[];
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryable(statusCode: number, config: RetryConfig): boolean {
  return config.retryableStatuses.includes(statusCode);
}

/**
 * Cache configuration for different resource types
 */
interface CacheConfig {
  revalidate?: number | false;
  tags?: string[];
}

const defaultCacheConfig: Record<string, CacheConfig> = {
  products: { revalidate: 300, tags: ['products'] }, // 5 minutes
  categories: { revalidate: 300, tags: ['categories'] },
  subcategories: { revalidate: 300, tags: ['subcategories'] },
  blogs: { revalidate: 300, tags: ['blogs'] },
  brands: { revalidate: 300, tags: ['brands'] },
  offers: { revalidate: 60, tags: ['offers'] }, // 1 minute - offers change more frequently
  static: { revalidate: 1800, tags: ['static'] }, // 30 minutes
};

/**
 * Makes an API request with automatic error handling, interceptors, retry logic, and Next.js caching
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retryConfig: Partial<RetryConfig> = {},
  cacheConfig?: CacheConfig,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = { ...defaultRetryConfig, ...retryConfig };

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  let requestConfig: RequestInit = {
    ...options,
    url: url, // Add URL to config for interceptors
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // Apply Next.js caching if configured
  if (cacheConfig) {
    if (cacheConfig.revalidate !== undefined) {
      requestConfig.next = {
        ...requestConfig.next,
        revalidate: cacheConfig.revalidate,
      };
    }
    if (cacheConfig.tags) {
      requestConfig.next = {
        ...requestConfig.next,
        tags: cacheConfig.tags,
      };
    }
  }

  // Apply request interceptors
  for (const interceptor of requestInterceptors) {
    requestConfig = await interceptor(requestConfig);
  }

  let lastError: ApiClientError | null = null;
  let attempt = 0;

  while (attempt <= config.maxRetries) {
    try {
      const response = await fetch(url, requestConfig);

      // Apply response interceptors
      let interceptedResponse = response;
      for (const interceptor of responseInterceptors) {
        interceptedResponse = await interceptor(interceptedResponse);
      }

      if (!interceptedResponse.ok) {
        let error: ApiError;
        try {
          const errorData = await interceptedResponse.json();
          error = errorData.error || {
            code: "UNKNOWN_ERROR",
            message: "An unexpected error occurred",
          };
        } catch {
          error = {
            code: "NETWORK_ERROR",
            message: `Request failed with status ${interceptedResponse.status}`,
          };
        }

        const apiError = new ApiClientError(interceptedResponse.status, error);

        // Check if we should retry
        if (attempt < config.maxRetries && isRetryable(interceptedResponse.status, config)) {
          lastError = apiError;
          attempt++;
          await sleep(config.retryDelay * attempt); // Exponential backoff
          continue;
        }

        throw apiError;
      }

      // Handle 204 No Content
      if (interceptedResponse.status === 204) {
        return {} as T;
      }

      return await interceptedResponse.json();
    } catch (error) {
      if (error instanceof ApiClientError) {
        // Check if we should retry network errors
        if (attempt < config.maxRetries && error.statusCode === 0) {
          lastError = error;
          attempt++;
          await sleep(config.retryDelay * attempt);
          continue;
        }
        throw error;
      }

      // Handle unexpected errors
      const networkError = new ApiClientError(0, {
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Network request failed",
      });

      if (attempt < config.maxRetries) {
        lastError = networkError;
        attempt++;
        await sleep(config.retryDelay * attempt);
        continue;
      }

      throw networkError;
    }
  }

  // If we exhausted all retries, throw the last error
  throw lastError || new ApiClientError(0, {
    code: "MAX_RETRIES_EXCEEDED",
    message: "Maximum retry attempts exceeded",
  });
}

/**
 * API Client class with all endpoint methods
 */
export class ApiClient {
  static async logout(token: string) {
    return request<void>("/v1/auth/logout/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Products
  static async getProducts(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return request<any>(
      `/v1/products/${queryString ? `?${queryString}` : ''}`,
      {},
      {},
      defaultCacheConfig.products
    );
  }

  static async getProductBySlug(slug: string) {
    return request<any>(
      `/v1/products/${slug}/`,
      {},
      {},
      { revalidate: 300, tags: ['products', `product-${slug}`] } // Reduced cache time to 5 minutes
    );
  }

  static async getProductVariants(productId: number) {
    const response = await request<any>(
      `/v1/variants/?product=${productId}`,
      {},
      {},
      { revalidate: 300, tags: ['products', `product-${productId}-variants`] } // Reduced cache time to 5 minutes
    );
    // Handle paginated response
    return response.results || response;
  }

  // Categories (old Collections)
  static async getCategories() {
    return request<any[]>(
      "/v1/categories/",
      {},
      {},
      defaultCacheConfig.categories
    );
  }

  static async getCategoryBySlug(slug: string) {
    return request<any>(
      `/v1/categories/${slug}/`,
      {},
      {},
      { revalidate: 3600, tags: ['categories', `category-${slug}`] }
    );
  }

  // Subcategories (old Categories)
  static async getSubcategories(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return request<any[]>(
      `/v1/subcategories/${queryString ? `?${queryString}` : ''}`,
      {},
      {},
      defaultCacheConfig.subcategories
    );
  }

  static async getSubcategoryBySlug(slug: string) {
    return request<any>(
      `/v1/subcategories/${slug}/`,
      {},
      {},
      { revalidate: 3600, tags: ['subcategories', `subcategory-${slug}`] }
    );
  }

  // Brands
  static async getBrands() {
    return request<any[]>(
      "/v1/brands/",
      {},
      {},
      defaultCacheConfig.brands
    );
  }

  static async getBrandBySlug(slug: string) {
    return request<any>(
      `/v1/brands/${slug}/`,
      {},
      {},
      { revalidate: 3600, tags: ['brands', `brand-${slug}`] }
    );
  }

  // Offers
  static async getOffers() {
    return request<any[]>(
      "/v1/offers/",
      {},
      {},
      defaultCacheConfig.offers
    );
  }

  static async getOfferById(id: string) {
    return request<any>(
      `/v1/offers/${id}/`,
      {},
      {},
      { revalidate: 60, tags: ['offers', `offer-${id}`] } // Match the offers list cache time
    );
  }

  // Blog
  static async getBlogPosts(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return request<any>(
      `/v1/blog/${queryString ? `?${queryString}` : ''}`,
      {},
      {},
      defaultCacheConfig.blogs
    );
  }

  static async getBlogPostBySlug(slug: string) {
    return request<any>(
      `/v1/blog/${slug}/`,
      {},
      {},
      { revalidate: 3600, tags: ['blogs', `blog-${slug}`] }
    );
  }

  // Collections
  static async getCollections() {
    return request<any>(
      "/v1/collections/",
      {},
      {},
      { revalidate: 300, tags: ['collections'] }
    );
  }

  static async getCollectionBySlug(slug: string) {
    return request<any>(
      `/v1/collections/${slug}/`,
      {},
      {},
      { revalidate: 300, tags: ['collections', `collection-${slug}`] }
    );
  }

  // Shop By Room
  static async getShopByRooms() {
    return request<any>(
      "/v1/shop-by-rooms/",
      {},
      {},
      { revalidate: 300, tags: ['shop-by-rooms'] }
    );
  }

  // Orders
  static async createOrder(orderData: any, token: string) {
    return request<any>("/v1/orders/create/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
  }

  static async getOrders(token: string) {
    const response = await request<any>("/v1/orders/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Handle paginated response
    if (response && typeof response === 'object') {
      if (Array.isArray(response)) {
        return response;
      } else if (response.results && Array.isArray(response.results)) {
        return response.results;
      }
    }
    
    return [];
  }

  static async getOrderById(id: string, token: string) {
    return request<any>(`/v1/orders/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Contact
  static async submitContactForm(data: any) {
    return request<void>("/v1/contact/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // User Profile
  static async getUserProfile(token?: string) {
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return request<any>("/v1/users/profile/", {
      headers,
    });
  }

  static async updateUserProfile(data: any, token?: string) {
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return request<any>("/v1/users/profile/", {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });
  }

  static async lookupPincode(pincode: string) {
    return request<any>(`/v1/pincode/${pincode}/`);
  }

  // Reviews
  static async getReviews(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return request<any>(
      `/v1/reviews/${queryString ? `?${queryString}` : ''}`,
      {},
      {},
      { revalidate: 60, tags: ['reviews'] }
    );
  }

  static async getReviewSummary(productId: number) {
    return request<any>(
      `/v1/reviews/summary/?product=${productId}`,
      {},
      {},
      { revalidate: 60, tags: ['reviews', `product-${productId}-reviews`] }
    );
  }

  static async createReview(reviewData: any, token: string) {
    return request<any>("/v1/reviews/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
      cache: 'no-store'
    });
  }

  static async updateReview(reviewId: number, reviewData: any, token: string) {
    return request<any>(`/v1/reviews/${reviewId}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
      cache: 'no-store'
    });
  }

  static async deleteReview(reviewId: number, token: string) {
    return request<void>(`/v1/reviews/${reviewId}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store'
    });
  }

  static async markReviewHelpful(reviewId: number, token: string) {
    return request<any>(`/v1/reviews/${reviewId}/mark_helpful/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store'
    });
  }

  static async unmarkReviewHelpful(reviewId: number, token: string) {
    return request<any>(`/v1/reviews/${reviewId}/unmark_helpful/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store'
    });
  }

  static async getMyReviews(token: string) {
    return request<any[]>("/v1/reviews/my_reviews/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store'
    });
  }

  static async canReviewProduct(productId: number, token: string) {
    return request<any>(`/v1/reviews/can_review/?product=${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store'
    });
  }
}
