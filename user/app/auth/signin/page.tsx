'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from '../../../src/components/auth/AuthModal';

function SignInContent() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-creme flex items-center justify-center">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-alpha/5 backdrop-blur-3xl" />
      
      {isOpen && (
        <AuthModal 
          isOpen={isOpen} 
          onClose={handleClose} 
          initialMode="login" 
        />
      )}
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-creme" />}>
      <SignInContent />
    </Suspense>
  );
}
