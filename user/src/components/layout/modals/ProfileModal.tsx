"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session;
}

export default function ProfileModal({ isOpen, onClose, session }: ProfileModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    onClose();
    router.push('/');
    router.refresh();
  };

  const handleNavigation = (path: string) => {
    onClose();
    router.push(path);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-alpha/60 backdrop-blur-light animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-creme w-full max-w-md mx-4 shadow-modal animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-alpha/60 hover:text-alpha transition-colors duration-300"
          aria-label="Close modal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Profile Header */}
        <div className="p-8 md:p-12 border-b border-alpha/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-alpha/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-alpha/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-secondary text-alpha truncate">
                {session.user?.name}
              </h2>
              <p className="text-sm font-primary text-alpha/60 truncate">
                {session.user?.email}
              </p>
            </div>
          </div>

          <div className="text-center">
            <span className="text-xs font-primary uppercase tracking-[0.25em] text-alpha/60 mb-2 flex items-center justify-center gap-4">
              <span className="w-8 h-[1px] bg-alpha/30"></span>
              Account
              <span className="w-8 h-[1px] bg-alpha/30"></span>
            </span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-6 space-y-3">
          {/* Edit Profile */}
          <button
            onClick={() => handleNavigation('/profile')}
            className="w-full flex items-center justify-between px-6 py-4 border border-alpha/10 hover:border-alpha/20 hover:bg-alpha/5 transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-alpha/5 group-hover:bg-alpha/10 transition-colors duration-300">
                <svg className="w-5 h-5 text-alpha/60 group-hover:text-alpha transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-primary font-semibold text-alpha">Edit Profile</p>
                <p className="text-xs font-primary text-alpha/50">Update your information</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-alpha/40 group-hover:text-alpha group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* View Orders */}
          <button
            onClick={() => handleNavigation('/orders')}
            className="w-full flex items-center justify-between px-6 py-4 border border-alpha/10 hover:border-alpha/20 hover:bg-alpha/5 transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-alpha/5 group-hover:bg-alpha/10 transition-colors duration-300">
                <svg className="w-5 h-5 text-alpha/60 group-hover:text-alpha transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-primary font-semibold text-alpha">My Orders</p>
                <p className="text-xs font-primary text-alpha/50">Track your purchases</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-alpha/40 group-hover:text-alpha group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <span className="flex-1 h-[1px] bg-alpha/10"></span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-6 py-4 border border-red-200 hover:border-red-300 hover:bg-red-50 transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-red-50 group-hover:bg-red-100 transition-colors duration-300">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-primary font-semibold text-red-600">Logout</p>
                <p className="text-xs font-primary text-red-600/60">Sign out of your account</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-red-600/40 group-hover:text-red-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-alpha/5 border-t border-alpha/10">
          <p className="text-xs font-primary text-alpha/40 text-center">
            Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
