import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Extract data from paginated or non-paginated response
 */
export function extractData<T>(response: any): T[] {
  // If response has results (paginated), return results
  if (response && typeof response === 'object' && 'results' in response) {
    return Array.isArray(response.results) ? response.results : [];
  }
  // If response is already an array, return it
  if (Array.isArray(response)) {
    return response;
  }
  // Otherwise return empty array
  return [];
}

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle network errors and retryable status codes
    const shouldRetry = 
      !error.response || // Network error
      (error.response.status && RETRYABLE_STATUS_CODES.includes(error.response.status));

    if (shouldRetry && originalRequest) {
      const retryCount = originalRequest._retry || 0;
      
      if (retryCount < MAX_RETRIES) {
        originalRequest._retry = retryCount + 1;
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, RETRY_DELAY * Math.pow(2, retryCount))
        );
        
        return apiClient(originalRequest);
      }
    }

    // Format error for consistent handling
    const apiError = formatError(error);
    return Promise.reject(apiError);
  }
);

/**
 * Format axios error into ApiError
 */
function formatError(error: AxiosError): ApiError {
  // Network error
  if (!error.response) {
    return new ApiError(
      0,
      'NETWORK_ERROR',
      'Unable to connect to the server. Please check your internet connection.'
    );
  }

  // Server error with structured response
  const data = error.response.data as any;
  if (data?.error) {
    return new ApiError(
      error.response.status,
      data.error.code || 'UNKNOWN_ERROR',
      data.error.message || 'An unexpected error occurred',
      data.error.details
    );
  }

  // Generic error
  return new ApiError(
    error.response.status,
    'HTTP_ERROR',
    error.message || `Request failed with status ${error.response.status}`
  );
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any): string {
  if (error instanceof ApiError) {
    // Handle validation errors
    if (error.code === 'VALIDATION_ERROR' && error.details) {
      const fieldErrors = Object.entries(error.details)
        .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
        .join('; ');
      return fieldErrors || error.message;
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  return error instanceof ApiError && error.code === 'NETWORK_ERROR';
}

export default apiClient;
