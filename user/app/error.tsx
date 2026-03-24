"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-creme flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 500 Number */}
        <div className="mb-8">
          <h1 className="text-[120px] md:text-[180px] font-secondary text-alpha/10 leading-none tracking-tight">
            500
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <span className="inline-flex items-center gap-3 text-xs font-primary uppercase tracking-[0.25em] text-alpha/60">
            <span className="w-8 h-[1px] bg-alpha/30"></span>
            Server Error
            <span className="w-8 h-[1px] bg-alpha/30"></span>
          </span>

          <h2 className="text-3xl md:text-5xl font-secondary text-alpha leading-tight">
            Something Went <span className="italic font-light">Wrong</span>
          </h2>

          <p className="text-base md:text-lg text-alpha/70 font-primary leading-relaxed max-w-xl mx-auto">
            We&apos;re experiencing technical difficulties. Our team has been notified and is working to fix the issue. Please try again in a few moments.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-alpha text-creme text-xs uppercase tracking-widest font-primary hover:bg-alpha/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-alpha text-alpha text-xs uppercase tracking-widest font-primary hover:bg-alpha hover:text-creme transition-colors"
            >
              Go to Homepage
            </Link>
          </div>

          {/* Support Info */}
          <div className="pt-12 border-t border-alpha/10 mt-12">
            <p className="text-xs uppercase tracking-wider text-alpha/60 mb-4">Need Help?</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm">
              <Link href="/contact" className="text-alpha hover:text-tango transition-colors">
                Contact Support
              </Link>
              <span className="hidden sm:inline text-alpha/20">•</span>
              <a href="mailto:support@cafco.com" className="text-alpha hover:text-tango transition-colors">
                support@cafco.com
              </a>
              <span className="hidden sm:inline text-alpha/20">•</span>
              <a href="tel:+390212345678" className="text-alpha hover:text-tango transition-colors">
                +39 02 1234 5678
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
