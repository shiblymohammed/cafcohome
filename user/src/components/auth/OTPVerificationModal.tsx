"use client";

import { useState, useEffect, useRef } from "react";

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  name: string;
  onVerified: () => void;
}

export default function OTPVerificationModal({ 
  isOpen, 
  onClose, 
  email, 
  name,
  onVerified 
}: OTPVerificationModalProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Focus first input when modal opens
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (value && index === 5 && newOtp.every(digit => digit !== "")) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    // Only accept 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      setError("");
      inputRefs.current[5]?.focus();
      
      // Auto-submit
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join("");
    
    if (code.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/v1/auth/otp/verify/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Verification failed');
      }

      // Success!
      onVerified();
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/v1/auth/otp/resend/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to resend OTP');
      }

      // Set cooldown and expiry
      setResendCooldown(60);
      setExpiresAt(data.expires_at);
      
      // Clear current OTP
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      
      // Show success message briefly
      setError("");
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-alpha/60 backdrop-blur-light animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-creme w-full max-w-md shadow-modal animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-alpha/60 hover:text-alpha transition-colors duration-300 z-10"
          aria-label="Close modal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <div className="text-center">
            {/* Email Icon */}
            <div className="w-16 h-16 mx-auto mb-4 bg-alpha/5 rounded-full flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>

            <span className="text-xs font-primary uppercase tracking-[0.25em] text-alpha/60 mb-2 flex items-center justify-center gap-4">
              <span className="w-8 h-[1px] bg-alpha/30"></span>
              Verify Email
              <span className="w-8 h-[1px] bg-alpha/30"></span>
            </span>
            <h2 className="text-2xl font-secondary text-alpha leading-tight tracking-tight mb-2">
              Enter <span className="italic font-light text-alpha/80">Verification Code</span>
            </h2>
            <p className="text-xs font-primary text-alpha/60 leading-relaxed">
              We've sent a 6-digit code to
            </p>
            <p className="text-sm font-primary text-alpha font-medium mt-1">
              {email}
            </p>
          </div>
        </div>

        {/* OTP Input */}
        <div className="px-8 pb-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-xs font-primary mb-6">
              {error}
            </div>
          )}

          {/* OTP Boxes */}
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={isLoading}
                className="w-12 h-14 text-center text-2xl font-secondary font-bold border-2 border-alpha/20 focus:border-alpha bg-transparent text-alpha transition-colors duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={() => handleVerify()}
            disabled={isLoading || otp.some(digit => digit === "")}
            className="w-full bg-alpha text-creme py-3 text-xs font-primary uppercase tracking-[0.2em] hover:bg-tango transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </button>

          {/* Resend */}
          <div className="text-center">
            <p className="text-xs font-primary text-alpha/60 mb-2">
              Didn't receive the code?
            </p>
            {resendCooldown > 0 ? (
              <p className="text-xs font-primary text-alpha/40">
                Resend in {resendCooldown}s
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-xs font-primary uppercase tracking-[0.2em] text-alpha hover:text-tango transition-colors duration-300 disabled:opacity-50 border-b border-alpha hover:border-tango pb-1"
              >
                {isResending ? "Sending..." : "Resend Code"}
              </button>
            )}
          </div>

          {/* Expiry Info */}
          {expiresAt && (
            <p className="text-[0.65rem] font-primary text-alpha/40 text-center mt-4">
              Code expires in 10 minutes
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
