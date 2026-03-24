'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    signIn('google', { callbackUrl });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-creme px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-12 shadow-lg">
        {/* Header */}
        <div className="text-center">
          <span className="text-xs font-primary uppercase tracking-[0.25em] text-alpha/60 mb-2 flex items-center justify-center gap-4">
            <span className="w-8 h-[1px] bg-alpha/30"></span>
            Welcome Back
            <span className="w-8 h-[1px] bg-alpha/30"></span>
          </span>
          <h2 className="text-3xl md:text-4xl font-secondary text-alpha leading-tight tracking-tight mb-3">
            Sign <span className="italic font-light text-alpha/80">In</span>
          </h2>
          <p className="text-sm font-primary text-alpha/60 leading-relaxed">
            Continue your journey with CAFCO's curated collection.
          </p>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-4 border border-alpha/20 hover:border-alpha/40 transition-colors duration-300 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="text-xs font-primary uppercase tracking-[0.2em] text-alpha">
            Continue with Google
          </span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <span className="flex-1 h-[1px] bg-alpha/10"></span>
          <span className="text-[0.6rem] font-primary uppercase tracking-widest text-alpha/40">or</span>
          <span className="flex-1 h-[1px] bg-alpha/10"></span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-xs font-primary">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-[0.6rem] font-primary uppercase tracking-[0.2em] text-alpha/60 mb-3">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border-b border-alpha/20 focus:border-alpha py-3 text-base font-primary text-alpha placeholder:text-alpha/30 focus:outline-none transition-colors duration-300"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[0.6rem] font-primary uppercase tracking-[0.2em] text-alpha/60 mb-3">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-transparent border-b border-alpha/20 focus:border-alpha py-3 text-base font-primary text-alpha placeholder:text-alpha/30 focus:outline-none transition-colors duration-300"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-alpha text-creme py-4 text-xs font-primary uppercase tracking-[0.2em] hover:bg-tango transition-colors duration-300 disabled:opacity-50"
          >
            {isLoading ? 'Please wait...' : 'Sign In'}
          </button>
        </form>

        {/* Switch Mode */}
        <div className="text-center pt-4">
          <p className="text-sm font-primary text-alpha/60 mb-3">
            Don't have an account?
          </p>
          <Link 
            href="/auth/register"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold border-b border-alpha pb-1 hover:text-tango hover:border-tango transition-colors duration-300"
          >
            Create Account
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-creme">
        <div className="text-alpha">Loading...</div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
