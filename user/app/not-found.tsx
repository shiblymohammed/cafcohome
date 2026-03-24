import Link from "next/link";
import { Metadata } from "next";
import { generateMetadata as genMeta } from "@/src/lib/seo/utils";

export async function generateMetadata(): Promise<Metadata> {
  return genMeta({
    title: "Page Not Found - 404 Error",
    description: "The page you are looking for does not exist or has been moved. Browse our collections or return to the homepage.",
    noindex: true,
  });
}

export default function NotFound() {
  return (
    <main className="min-h-screen bg-creme flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-[120px] md:text-[180px] font-secondary text-alpha/10 leading-none tracking-tight">
            404
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <span className="inline-flex items-center gap-3 text-xs font-primary uppercase tracking-[0.25em] text-alpha/60">
            <span className="w-8 h-[1px] bg-alpha/30"></span>
            Page Not Found
            <span className="w-8 h-[1px] bg-alpha/30"></span>
          </span>

          <h2 className="text-3xl md:text-5xl font-secondary text-alpha leading-tight">
            Oops! This Page <span className="italic font-light">Doesn&apos;t Exist</span>
          </h2>

          <p className="text-base md:text-lg text-alpha/70 font-primary leading-relaxed max-w-xl mx-auto">
            The page you&apos;re looking for might have been moved, deleted, or never existed. 
            Let&apos;s get you back on track.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-alpha text-creme text-xs uppercase tracking-widest font-primary hover:bg-alpha/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go to Homepage
            </Link>

            <Link
              href="/collections/all"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-alpha text-alpha text-xs uppercase tracking-widest font-primary hover:bg-alpha hover:text-creme transition-colors"
            >
              Browse Collections
            </Link>
          </div>

          {/* Quick Links */}
          <div className="pt-12 border-t border-alpha/10 mt-12">
            <p className="text-xs uppercase tracking-wider text-alpha/60 mb-4">Popular Pages</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/about" className="text-alpha hover:text-tango transition-colors">
                About Us
              </Link>
              <span className="text-alpha/20">•</span>
              <Link href="/contact" className="text-alpha hover:text-tango transition-colors">
                Contact
              </Link>
              <span className="text-alpha/20">•</span>
              <Link href="/blogs" className="text-alpha hover:text-tango transition-colors">
                Blog
              </Link>
              <span className="text-alpha/20">•</span>
              <Link href="/offers" className="text-alpha hover:text-tango transition-colors">
                Special Offers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
