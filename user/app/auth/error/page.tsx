'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You do not have permission to sign in.',
    Verification: 'The verification token has expired or has already been used.',
    Default: 'Unable to sign in. Please try again.',
    CredentialsSignin: 'Invalid email or password. Please check your credentials and try again.',
  };

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-creme px-4">
      <div className="max-w-md w-full bg-white p-8 md:p-12 shadow-lg text-center">
        {/* Error Icon */}
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Header */}
        <h2 className="text-3xl font-secondary text-alpha mb-4">
          Authentication <span className="italic font-light">Error</span>
        </h2>

        {/* Error Message */}
        <p className="text-sm font-primary text-alpha/70 mb-8 leading-relaxed">
          {errorMessage}
        </p>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-left">
            <p className="text-xs font-mono text-red-800">
              Error Code: {error}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          <Link
            href="/auth/signin"
            className="block w-full bg-alpha text-creme py-4 text-xs font-primary uppercase tracking-[0.2em] hover:bg-tango transition-colors duration-300"
          >
            Try Again
          </Link>

          <Link
            href="/"
            className="block text-xs font-primary uppercase tracking-[0.2em] text-alpha/60 hover:text-alpha transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-creme">
        <div className="text-alpha">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
