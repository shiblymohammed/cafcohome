"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import CustomSelect from "../ui/CustomSelect";
import OTPVerificationModal from "./OTPVerificationModal";

type AuthMode = "login" | "signup";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  isNewGoogleUser?: boolean;
}

export default function AuthModal({ isOpen, onClose, initialMode = "login", isNewGoogleUser = false }: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
    address: "",
    pin_code: "",
    area: "",
    district: "",
    state: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<{email: string; name: string; password: string} | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Show optional fields modal for new Google users
  useEffect(() => {
    if (isOpen && isNewGoogleUser && !showOptionalFields) {
      console.log('[AuthModal] New Google user prop detected, showing optional fields');
      setJustRegistered(true);
      setShowOptionalFields(true);
    }
  }, [isOpen, isNewGoogleUser, showOptionalFields]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError("");
  };

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pincode = e.target.value.trim();
    
    console.log('[Pincode] Input changed:', pincode, 'Length:', pincode.length);
    
    // Update pin_code field immediately
    setFormData(prev => {
      const newData = {
        ...prev,
        pin_code: pincode
      };
      console.log('[Pincode] Updated formData:', newData);
      return newData;
    });
    setError("");
    
    // If exactly 6 digits, lookup district and state
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      console.log('[Pincode] Valid 6-digit pincode, starting lookup...');
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/v1/pincode/${pincode}/`;
        console.log('[Pincode] Fetching from URL:', url);
        
        const res = await fetch(url);
        console.log('[Pincode] Response status:', res.status, 'OK:', res.ok);
        
        if (res.ok) {
          const data = await res.json();
          console.log('[Pincode] Received data:', data);
          
          // Set available areas if multiple exist
          if (data.areas && data.areas.length > 1) {
            setAvailableAreas(data.areas);
          } else {
            setAvailableAreas([]);
          }
          
          setFormData(prev => {
            const newData = {
              ...prev,
              area: data.area || '',
              district: data.district || '',
              state: data.state || ''
            };
            console.log('[Pincode] Updated with location data:', newData);
            return newData;
          });
        } else {
          console.log('[Pincode] Pincode not found, clearing fields');
          setAvailableAreas([]);
          setFormData(prev => ({
            ...prev,
            area: '',
            district: '',
            state: ''
          }));
        }
      } catch (err) {
        console.error('[Pincode] Lookup error:', err);
        setAvailableAreas([]);
        setFormData(prev => ({
          ...prev,
          area: '',
          district: '',
          state: ''
        }));
      }
    } else if (pincode.length < 6) {
      console.log('[Pincode] Incomplete pincode, clearing location fields');
      setAvailableAreas([]);
      setFormData(prev => ({
        ...prev,
        area: '',
        district: '',
        state: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        // Send OTP for email verification
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/v1/auth/otp/send/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: formData.email,
            name: formData.name 
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error?.message || 'Failed to send verification code');
        }

        // Store registration data and show OTP modal
        setPendingRegistration({
          email: formData.email,
          name: formData.name,
          password: formData.password
        });
        setShowOTPModal(true);
      } else {
        // Login existing user
        const result = await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (result?.error) {
          throw new Error('Invalid email or password');
        }

        // Success - close modal and refresh
        onClose();
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerified = async () => {
    if (!pendingRegistration) return;

    setIsLoading(true);
    setError("");

    try {
      // Now register the user after email verification
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/v1/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pendingRegistration.name,
          email: pendingRegistration.email,
          password: pendingRegistration.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Registration failed');
      }

      // Auto-login after registration
      const result = await signIn('credentials', {
        redirect: false,
        email: pendingRegistration.email,
        password: pendingRegistration.password,
      });

      if (result?.error) {
        throw new Error('Registration successful but auto-login failed. Please sign in.');
      }

      // Close OTP modal and show optional fields
      setShowOTPModal(false);
      setPendingRegistration(null);
      setJustRegistered(true);
      setShowOptionalFields(true);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setShowOTPModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipOptionalFields = () => {
    // Close modal and refresh
    setShowOptionalFields(false);
    setJustRegistered(false);
    onClose();
    router.refresh();
  };

  const handleSaveOptionalFields = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Get the session to get the access token
      const session = await fetch('/api/auth/session').then(res => res.json());
      
      if (!session?.accessToken) {
        throw new Error('Not authenticated');
      }

      // Update profile with optional fields
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/v1/users/profile/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          phone_number: formData.phone_number,
          address: formData.address,
          pin_code: formData.pin_code,
          area: formData.area,
          district: formData.district,
          state: formData.state,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to update profile');
      }

      // Success - close modal and refresh
      setShowOptionalFields(false);
      setJustRegistered(false);
      onClose();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (err) {
      setError('Google sign-in failed');
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setFormData({
      name: "",
      email: "",
      password: "",
      phone_number: "",
      address: "",
      pin_code: "",
      area: "",
      district: "",
      state: "",
    });
    setError("");
  };

  if (!isOpen) return null;

  // Show OTP verification modal
  if (showOTPModal && pendingRegistration) {
    return (
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => {
          setShowOTPModal(false);
          setPendingRegistration(null);
        }}
        email={pendingRegistration.email}
        name={pendingRegistration.name}
        onVerified={handleOTPVerified}
      />
    );
  }

  // Show optional fields modal after registration
  if (showOptionalFields && justRegistered) {
    return (
      <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-alpha/60 backdrop-blur-light animate-fade-in"
          onClick={handleSkipOptionalFields}
        />
        
        {/* Optional Fields Modal */}
        <div className="relative bg-creme w-full max-w-md shadow-modal animate-slide-up">
          {/* Close Button */}
          <button
            onClick={handleSkipOptionalFields}
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
              <span className="text-xs font-primary uppercase tracking-[0.25em] text-alpha/60 mb-2 flex items-center justify-center gap-4">
                <span className="w-8 h-[1px] bg-alpha/30"></span>
                Complete Your Profile
                <span className="w-8 h-[1px] bg-alpha/30"></span>
              </span>
              <h2 className="text-2xl font-secondary text-alpha leading-tight tracking-tight mb-2">
                Add <span className="italic font-light text-alpha/80">Details</span>
              </h2>
              <p className="text-xs font-primary text-alpha/60 leading-relaxed">
                Help us serve you better by adding your details.
              </p>
              <p className="text-xs font-primary text-tango mt-2">
                Skip and add these later in your profile page.
              </p>
            </div>
          </div>

          {/* Optional Fields Form */}
          <form onSubmit={(e) => { e.preventDefault(); handleSaveOptionalFields(); }} className="px-8 pb-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-xs font-primary mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Phone Number */}
              <div className="relative">
                <label 
                  htmlFor="phone_number_optional" 
                  className="block text-[0.6rem] font-primary uppercase tracking-[0.2em] text-alpha/60 mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone_number_optional"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full bg-transparent border-b border-alpha/20 focus:border-alpha py-2 text-sm font-primary text-alpha placeholder:text-alpha/30 focus:outline-none transition-colors duration-300"
                />
              </div>

              {/* Pin Code */}
              <div className="relative">
                <label 
                  htmlFor="pin_code_optional" 
                  className="block text-[0.6rem] font-primary uppercase tracking-[0.2em] text-alpha/60 mb-2"
                >
                  Pin Code
                </label>
                <input
                  type="text"
                  id="pin_code_optional"
                  name="pin_code"
                  value={formData.pin_code}
                  onChange={handlePincodeChange}
                  placeholder="Enter 6-digit pin code"
                  maxLength={6}
                  className="w-full bg-transparent border-b border-alpha/20 focus:border-alpha py-2 text-sm font-primary text-alpha placeholder:text-alpha/30 focus:outline-none transition-colors duration-300"
                />
              </div>

              {/* Area / Locality */}
              {(formData.area || availableAreas.length > 0) && (
                <div className="relative">
                  <label 
                    htmlFor="area_optional" 
                    className="block text-[0.6rem] font-primary uppercase tracking-[0.2em] text-alpha/60 mb-2"
                  >
                    Area {availableAreas.length > 1 && <span className="text-tango text-[0.5rem]">({availableAreas.length} options)</span>}
                  </label>
                  {availableAreas.length > 1 ? (
                    <CustomSelect
                      id="area_optional"
                      name="area"
                      value={formData.area}
                      options={availableAreas}
                      onChange={handleChange}
                    />
                  ) : (
                    <input
                      type="text"
                      id="area_optional"
                      name="area"
                      value={formData.area}
                      readOnly
                      className="w-full bg-alpha/5 border-b border-alpha/10 py-2 text-sm font-primary text-alpha/60 cursor-not-allowed"
                    />
                  )}
                </div>
              )}

              {/* District and State - Compact */}
              {(formData.district || formData.state) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <label 
                      htmlFor="district_optional" 
                      className="block text-[0.6rem] font-primary uppercase tracking-[0.2em] text-alpha/60 mb-2"
                    >
                      District
                    </label>
                    <input
                      type="text"
                      id="district_optional"
                      value={formData.district}
                      readOnly
                      className="w-full bg-alpha/5 border-b border-alpha/10 py-2 text-sm font-primary text-alpha/60 cursor-not-allowed"
                    />
                  </div>

                  <div className="relative">
                    <label 
                      htmlFor="state_optional" 
                      className="block text-[0.6rem] font-primary uppercase tracking-[0.2em] text-alpha/60 mb-2"
                    >
                      State
                    </label>
                    <input
                      type="text"
                      id="state_optional"
                      value={formData.state}
                      readOnly
                      className="w-full bg-alpha/5 border-b border-alpha/10 py-2 text-sm font-primary text-alpha/60 cursor-not-allowed"
                    />
                  </div>
                </div>
              )}

              {/* Street Address - Compact */}
              <div className="relative">
                <label 
                  htmlFor="address_optional" 
                  className="block text-[0.6rem] font-primary uppercase tracking-[0.2em] text-alpha/60 mb-2"
                >
                  Street Address
                </label>
                <textarea
                  id="address_optional"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House/Flat no, Street"
                  rows={2}
                  className="w-full bg-transparent border-b border-alpha/20 focus:border-alpha py-2 text-sm font-primary text-alpha placeholder:text-alpha/30 focus:outline-none transition-colors duration-300 resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-alpha text-creme py-3 text-xs font-primary uppercase tracking-[0.2em] hover:bg-tango transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : "Save Details"}
              </button>
              <button
                type="button"
                onClick={handleSkipOptionalFields}
                disabled={isLoading}
                className="w-full border border-alpha/20 text-alpha py-3 text-xs font-primary uppercase tracking-[0.2em] hover:bg-alpha/5 transition-colors duration-300 disabled:opacity-50"
              >
                Skip for Now
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-alpha/60 backdrop-blur-light animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-creme w-full max-w-md mx-4 p-8 md:p-12 shadow-modal animate-slide-up">
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

        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-primary uppercase tracking-[0.25em] text-alpha/60 mb-2 flex items-center justify-center gap-4">
            <span className="w-8 h-[1px] bg-alpha/30"></span>
            {mode === "login" ? "Welcome Back" : "Welcome"}
            <span className="w-8 h-[1px] bg-alpha/30"></span>
          </span>
          <h2 className="text-3xl md:text-4xl font-secondary text-alpha leading-tight tracking-tight mb-3">
            {mode === "login" ? (
              <>Sign <span className="italic font-light text-alpha/80">In</span></>
            ) : (
              <>Create <span className="italic font-light text-alpha/80">Account</span></>
            )}
          </h2>
          <p className="text-sm font-primary text-alpha/60 leading-relaxed max-w-xs mx-auto">
            {mode === "login" 
              ? "Continue your journey with DravoHome's curated collection."
              : "Join the DravoHome family and discover timeless furniture."
            }
          </p>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-4 border border-alpha/20 hover:border-alpha/40 transition-colors duration-300 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="text-xs font-primary uppercase tracking-[0.2em] text-alpha">
            Continue with Google
          </span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
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

          {mode === "signup" && (
            <div className="relative">
              <label 
                htmlFor="name" 
                className="block text-[0.6rem] font-primary uppercase tracking-[0.2em] text-alpha/60 mb-3"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full bg-transparent border-b border-alpha/20 focus:border-alpha py-3 text-base font-primary text-alpha placeholder:text-alpha/30 focus:outline-none transition-colors duration-300"
                required
              />
            </div>
          )}

          <div className="relative">
            <label 
              htmlFor="email" 
              className="block text-[0.6rem] font-primary uppercase tracking-[0.2em] text-alpha/60 mb-3"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full bg-transparent border-b border-alpha/20 focus:border-alpha py-3 text-base font-primary text-alpha placeholder:text-alpha/30 focus:outline-none transition-colors duration-300"
              required
            />
          </div>

          <div className="relative">
            <label 
              htmlFor="password" 
              className="block text-[0.6rem] font-primary uppercase tracking-[0.2em] text-alpha/60 mb-3"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full bg-transparent border-b border-alpha/20 focus:border-alpha py-3 text-base font-primary text-alpha placeholder:text-alpha/30 focus:outline-none transition-colors duration-300"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-alpha text-creme py-4 text-xs font-primary uppercase tracking-[0.2em] hover:bg-tango transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Switch Mode */}
        <div className="text-center">
          <p className="text-sm font-primary text-alpha/60 mb-3">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button 
            onClick={switchMode}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold border-b border-alpha pb-1 hover:text-tango hover:border-tango transition-colors duration-300"
          >
            {mode === "login" ? "Create Account" : "Login"}
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
