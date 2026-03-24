/**
 * Prefetch Utilities
 * 
 * Utilities for prefetching data and routes for better performance
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook to prefetch a route on component mount
 */
export function usePrefetch(href: string, enabled: boolean = true) {
  const router = useRouter();

  useEffect(() => {
    if (enabled && href) {
      router.prefetch(href);
    }
  }, [href, enabled, router]);
}

/**
 * Hook to prefetch routes on hover
 */
export function usePrefetchOnHover() {
  const router = useRouter();

  const handleMouseEnter = (href: string) => {
    router.prefetch(href);
  };

  return handleMouseEnter;
}

/**
 * Prefetch multiple routes
 */
export function usePrefetchMultiple(hrefs: string[], enabled: boolean = true) {
  const router = useRouter();

  useEffect(() => {
    if (enabled && hrefs.length > 0) {
      hrefs.forEach((href) => {
        router.prefetch(href);
      });
    }
  }, [hrefs, enabled, router]);
}

/**
 * Prefetch on intersection (when element enters viewport)
 */
export function usePrefetchOnIntersection(
  ref: React.RefObject<HTMLElement>,
  href: string,
  options?: IntersectionObserverInit
) {
  const router = useRouter();

  useEffect(() => {
    const element = ref.current;
    if (!element || !href) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            router.prefetch(href);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, href, router, options]);
}
