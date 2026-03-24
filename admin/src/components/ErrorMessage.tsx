/**
 * Error Message Component
 * 
 * Displays user-friendly error messages
 */

interface ErrorMessageProps {
  message: string;
  type?: "error" | "warning" | "info" | "success";
  onDismiss?: () => void;
  className?: string;
}

export function ErrorMessage({ 
  message, 
  type = "error",
  onDismiss,
  className = "" 
}: ErrorMessageProps) {
  const styles = {
    error: {
      bg: "#fef2f2",
      border: "#fecaca",
      text: "#991b1b",
      iconColor: "#ef4444",
    },
    warning: {
      bg: "#fefce8",
      border: "#fef08a",
      text: "#854d0e",
      iconColor: "#eab308",
    },
    info: {
      bg: "#eff6ff",
      border: "#bfdbfe",
      text: "#1e40af",
      iconColor: "#3b82f6",
    },
    success: {
      bg: "#f0fdf4",
      border: "#bbf7d0",
      text: "#166534",
      iconColor: "#22c55e",
    },
  };

  const style = styles[type];

  return (
    <div
      className={className}
      style={{
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: '0.5rem',
        padding: '1rem'
      }}
      role="alert"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <svg
          style={{
            color: style.iconColor,
            height: '1.25rem',
            width: '1.25rem',
            marginTop: '0.125rem',
            flexShrink: 0
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {type === "error" && (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          )}
          {type === "warning" && (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          )}
          {type === "info" && (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          )}
          {type === "success" && (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          )}
        </svg>
        <div style={{ marginLeft: '0.75rem', flex: 1 }}>
          <p style={{ fontSize: '0.875rem', color: style.text }}>{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              marginLeft: '0.75rem',
              color: style.text,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
            aria-label="Dismiss"
          >
            <svg
              style={{ height: '1.25rem', width: '1.25rem' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Form Field Error Message
 */
interface FieldErrorProps {
  error?: string;
}

export function FieldError({ error }: FieldErrorProps) {
  if (!error) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      marginTop: '0.25rem',
      fontSize: '0.875rem',
      color: '#dc2626'
    }}>
      <svg
        style={{ height: '1rem', width: '1rem', marginRight: '0.25rem' }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{error}</span>
    </div>
  );
}
