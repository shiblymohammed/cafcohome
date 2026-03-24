/**
 * Loading Spinner Component
 * 
 * Reusable loading indicator for async operations
 */

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  className = "",
  text 
}: LoadingSpinnerProps) {
  const sizeStyles = {
    sm: { height: '1rem', width: '1rem', borderWidth: '2px' },
    md: { height: '2rem', width: '2rem', borderWidth: '3px' },
    lg: { height: '3rem', width: '3rem', borderWidth: '4px' },
  };

  const style = sizeStyles[size];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        style={{
          ...style,
          border: `${style.borderWidth} solid #2563eb`,
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
          {text}
        </p>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * Full Page Loading Spinner
 */
export function LoadingPage({ text = "Loading..." }: { text?: string }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb'
    }}>
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

/**
 * Inline Loading Spinner for buttons
 */
export function ButtonSpinner() {
  return (
    <svg
      style={{
        animation: 'spin 1s linear infinite',
        height: '1.25rem',
        width: '1.25rem',
        color: 'white'
      }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        style={{ opacity: 0.25 }}
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        style={{ opacity: 0.75 }}
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  );
}
