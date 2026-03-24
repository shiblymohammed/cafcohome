/**
 * Network Utilities
 * 
 * Utilities for detecting network status and handling offline scenarios
 */

/**
 * Check if the browser is online
 */
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

/**
 * Wait for network to be available
 */
export function waitForNetwork(timeout: number = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isOnline()) {
      resolve();
      return;
    }

    const timeoutId = setTimeout(() => {
      window.removeEventListener('online', onlineHandler);
      reject(new Error('Network timeout'));
    }, timeout);

    const onlineHandler = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', onlineHandler);
      resolve();
    };

    window.addEventListener('online', onlineHandler);
  });
}

/**
 * Add network status listeners
 */
export function addNetworkListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;
  
  // Check for common network error indicators
  if (error.message?.includes('fetch') || 
      error.message?.includes('network') ||
      error.message?.includes('Failed to fetch')) {
    return true;
  }
  
  // Check for ApiClientError with network error code
  if (error.statusCode === 0 || error.error?.code === 'NETWORK_ERROR') {
    return true;
  }
  
  return false;
}
