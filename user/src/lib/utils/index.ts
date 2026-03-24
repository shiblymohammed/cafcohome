/**
 * Utilities Exports
 */

export {
  reportWebVitals,
  measureRenderTime,
  debounce,
  throttle,
  prefersReducedMotion,
  getConnectionSpeed,
  preloadResource,
  prefetchResource,
} from './performance';

export {
  usePrefetch,
  usePrefetchOnHover,
  usePrefetchMultiple,
  usePrefetchOnIntersection,
} from './prefetch';

export {
  lazyLoad,
  preloadComponent,
} from './lazyLoad';
