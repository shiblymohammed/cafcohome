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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-alpha/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] border border-alpha/10 overflow-hidden transform transition-all duration-500 animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-alpha/5 rounded-full text-alpha/60 hover:text-alpha hover:bg-alpha/10 transition-all duration-300 z-10"
          aria-label="Close modal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Profile Header */}
        <div className="p-8 pb-6 border-b border-alpha/5 bg-alpha/5 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/50 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-[4.5rem] h-[4.5rem] rounded-[1.5rem] bg-white shadow-sm flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-secondary text-alpha">
                {(session.user?.name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0 pr-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-alpha/50 mb-1">Welcome back</p>
              <h2 className="text-2xl font-secondary text-alpha truncate leading-tight">
                {session.user?.name}
              </h2>
              <p className="text-[12px] font-medium text-alpha/60 truncate mt-0.5">
                {session.user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-6 space-y-3">
          {/* Edit Profile */}
          <button
            onClick={() => handleNavigation('/profile')}
            className="w-full flex items-center justify-between p-4 bg-white rounded-[1.5rem] border border-alpha/5 hover:border-alpha/20 hover:shadow-sm transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-[1rem] bg-alpha/5 group-hover:bg-alpha text-alpha/60 group-hover:text-white transition-all duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-alpha">Edit Profile</p>
                <p className="text-[11px] font-medium text-alpha/50 mt-0.5">Update your information</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-alpha/5 flex items-center justify-center group-hover:bg-alpha/10 transition-colors">
              <svg className="w-4 h-4 text-alpha/40 group-hover:text-alpha transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* View Orders */}
          <button
            onClick={() => handleNavigation('/orders')}
            className="w-full flex items-center justify-between p-4 bg-white rounded-[1.5rem] border border-alpha/5 hover:border-alpha/20 hover:shadow-sm transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-[1rem] bg-alpha/5 group-hover:bg-alpha text-alpha/60 group-hover:text-white transition-all duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-alpha">My Orders</p>
                <p className="text-[11px] font-medium text-alpha/50 mt-0.5">Track your purchases</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-alpha/5 flex items-center justify-center group-hover:bg-alpha/10 transition-colors">
              <svg className="w-4 h-4 text-alpha/40 group-hover:text-alpha transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Divider */}
          <div className="py-2 px-2">
            <div className="h-px bg-alpha/5 w-full"></div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 bg-red-50/50 rounded-[1.5rem] border border-red-100 hover:bg-red-50 hover:border-red-200 transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-[1rem] bg-red-100/50 group-hover:bg-red-500 text-red-500 group-hover:text-white transition-all duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-red-600">Logout</p>
                <p className="text-[11px] font-medium text-red-600/60 mt-0.5">Sign out of your account</p>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-alpha/5 text-center flex-shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-alpha/30">
            Member since {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
