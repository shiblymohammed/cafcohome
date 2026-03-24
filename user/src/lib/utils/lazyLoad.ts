/**
 * Lazy Loading Utilities
 * 
 * Utilities for code splitting and lazy loading components
 */

import dynamic from 'next/dynamic';
import { ComponentType, createElement } from 'react';

/**
 * Default loading component
 */
const DefaultLoading = () => null;

/**
 * Create a lazy loaded component with loading and error states
 */
export function lazyLoad<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    loading?: any;
    ssr?: boolean;
  }
) {
  return dynamic(importFunc, {
    loading: options?.loading || DefaultLoading,
    ssr: options?.ssr ?? true,
  });
}

/**
 * Preload a lazy loaded component
 */
export function preloadComponent<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>
) {
  return importFunc();
}
