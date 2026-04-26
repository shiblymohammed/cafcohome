"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

export type ToastType = "success" | "error" | "info" | "warning" | "cart" | "wishlist";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  image?: string;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const duration = toast.duration ?? 3500;

      setToasts((prev) => {
        // Max 4 toasts at once — drop oldest
        const capped = prev.length >= 4 ? prev.slice(1) : prev;
        return [...capped, { ...toast, id }];
      });

      const timer = setTimeout(() => dismissToast(id), duration);
      timers.current.set(id, timer);
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

/* ─────────────────────────────────────────────────────────────
   Toast Container + individual Toast card
───────────────────────────────────────────────────────────── */
function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-6 right-4 md:right-6 z-[9999] flex flex-col gap-2.5 w-[calc(100vw-2rem)] max-w-[360px] pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

const ICON_MAP: Record<ToastType, React.ReactNode> = {
  success: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
    </svg>
  ),
  cart: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  wishlist: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
};

const COLOR_MAP: Record<ToastType, { bar: string; icon: string; bg: string }> = {
  success: { bar: "bg-green-500",  icon: "bg-green-50 text-green-600",  bg: "bg-white" },
  error:   { bar: "bg-red-500",    icon: "bg-red-50 text-red-600",      bg: "bg-white" },
  warning: { bar: "bg-amber-500",  icon: "bg-amber-50 text-amber-600",  bg: "bg-white" },
  info:    { bar: "bg-blue-500",   icon: "bg-blue-50 text-blue-500",    bg: "bg-white" },
  cart:    { bar: "bg-[#262524]",  icon: "bg-[#262524]/8 text-[#262524]", bg: "bg-white" },
  wishlist:{ bar: "bg-rose-400",   icon: "bg-rose-50 text-rose-500",    bg: "bg-white" },
};

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const colors = COLOR_MAP[toast.type];

  return (
    <div
      className="pointer-events-auto w-full flex items-start gap-3 bg-white border border-alpha/8 rounded-lg shadow-[0_8px_32px_rgba(38,37,36,0.14)] overflow-hidden"
      style={{ animation: "toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
      role="alert"
    >
      {/* Left accent bar */}
      <div className={`w-1 self-stretch flex-shrink-0 ${colors.bar}`} />

      {/* Product thumbnail (optional) */}
      {toast.image && (
        <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden mt-3 -ml-1 bg-alpha/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={toast.image} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Icon */}
      {!toast.image && (
        <div className={`flex-shrink-0 mt-3 w-7 h-7 rounded-full flex items-center justify-center ${colors.icon}`}>
          {ICON_MAP[toast.type]}
        </div>
      )}

      {/* Text */}
      <div className="flex-1 py-3 min-w-0">
        <p className="text-[13px] font-primary font-medium text-alpha leading-snug truncate">
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-[11px] font-primary text-alpha/50 mt-0.5 leading-snug line-clamp-2">
            {toast.message}
          </p>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 mt-2.5 mr-2.5 p-1 rounded text-alpha/25 hover:text-alpha/50 transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <style jsx global>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  );
}
