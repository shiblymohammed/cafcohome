"use client";

/**
 * useAsync Hook
 * 
 * Manages async operations with loading, error, and data states
 */

import { useState, useCallback, useEffect } from "react";
import { ApiClientError } from "@/src/lib/api/client";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAsyncOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useAsync<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState({ data: null, loading: true, error: null });

      try {
        const data = await asyncFunction(...args);
        setState({ data, loading: false, error: null });
        
        if (options.onSuccess) {
          options.onSuccess(data);
        }
        
        return data;
      } catch (err: any) {
        let errorMessage = "An unexpected error occurred";

        if (err instanceof ApiClientError) {
          errorMessage = err.error.message;
          
          // Handle specific error codes
          if (err.error.code === "NETWORK_ERROR") {
            errorMessage = "Unable to connect to the server. Please check your internet connection.";
          } else if (err.error.code === "VALIDATION_ERROR" && err.error.details) {
            // Format validation errors
            const fieldErrors = Object.entries(err.error.details)
              .map(([field, errors]: [string, any]) => `${field}: ${(errors as string[]).join(", ")}`)
              .join("; ");
            errorMessage = fieldErrors || errorMessage;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setState({ data: null, loading: false, error: errorMessage });
        
        if (options.onError) {
          options.onError(errorMessage);
        }
        
        throw err;
      }
    },
    [asyncFunction, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * useAsyncEffect Hook
 * 
 * Automatically executes async function on mount or when dependencies change
 */
export function useAsyncEffect<T = any>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const execute = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const data = await asyncFunction();
        
        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      } catch (err: any) {
        if (!cancelled) {
          let errorMessage = "An unexpected error occurred";

          if (err instanceof ApiClientError) {
            errorMessage = err.error.message;
            
            if (err.error.code === "NETWORK_ERROR") {
              errorMessage = "Unable to connect to the server. Please check your internet connection.";
            }
          } else if (err instanceof Error) {
            errorMessage = err.message;
          }

          setState({ data: null, loading: false, error: errorMessage });
        }
      }
    };

    execute();

    return () => {
      cancelled = true;
    };
  }, dependencies);

  const retry = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));
  }, []);

  return {
    ...state,
    retry,
  };
}
