'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import CustomSelect from '@/src/components/ui/CustomSelect';
import { ApiClient } from '@/src/lib/api/client';

interface ProfileClientProps {
  session: any;
}

export default function ProfileClient({ session: initialSession }: ProfileClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.accessToken as string | undefined;
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    address: '',
    pin_code: '',
    area: '',
    district: '',
    state: '',
  });

  // Fetch user profile from API on mount
  useEffect(() => {
    async function fetchProfile() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await ApiClient.getUserProfile(token);
        if (response && response.user) {
          setFormData({
            name: response.user.name || '',
            email: response.user.email || '',
            phone_number: response.user.phone_number || '',
            address: response.user.address || '',
            pin_code: response.user.pin_code || '',
            area: response.user.area || '',
            district: response.user.district || '',
            state: response.user.state || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
    setSuccess('');
  };

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pincode = e.target.value.trim();
    
    console.log('[Profile Pincode] Input changed:', pincode, 'Length:', pincode.length);
    
    // Update pin_code field immediately
    setFormData(prev => {
      const newData = {
        ...prev,
        pin_code: pincode
      };
      console.log('[Profile Pincode] Updated formData:', newData);
      return newData;
    });
    setError('');
    setSuccess('');
    
    // If exactly 6 digits and in edit mode, lookup district and state
    if (pincode.length === 6 && /^\d{6}$/.test(pincode) && isEditing) {
      console.log('[Profile Pincode] Valid 6-digit pincode, starting lookup...');
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/v1/pincode/${pincode}/`;
        console.log('[Profile Pincode] Fetching from URL:', url);
        
        const res = await fetch(url);
        console.log('[Profile Pincode] Response status:', res.status, 'OK:', res.ok);
        
        if (res.ok) {
          const data = await res.json();
          console.log('[Profile Pincode] Received data:', data);
          
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
            console.log('[Profile Pincode] Updated with location data:', newData);
            return newData;
          });
        } else {
          console.log('[Profile Pincode] Pincode not found, clearing fields');
          setAvailableAreas([]);
          setFormData(prev => ({
            ...prev,
            area: '',
            district: '',
            state: ''
          }));
        }
      } catch (err) {
        console.error('[Profile Pincode] Lookup error:', err);
        setAvailableAreas([]);
        setFormData(prev => ({
          ...prev,
          area: '',
          district: '',
          state: ''
        }));
      }
    } else if (pincode.length < 6) {
      console.log('[Profile Pincode] Incomplete pincode, clearing location fields');
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
    
    if (!token) {
      setError('Authentication required');
      return;
    }
    
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await ApiClient.updateUserProfile({
        name: formData.name,
        phone_number: formData.phone_number,
        address: formData.address,
        pin_code: formData.pin_code,
        area: formData.area,
        district: formData.district,
        state: formData.state,
      }, token);

      if (response && response.user) {
        // Update form data with the response
        setFormData({
          name: response.user.name || '',
          email: response.user.email || '',
          phone_number: response.user.phone_number || '',
          address: response.user.address || '',
          pin_code: response.user.pin_code || '',
          area: response.user.area || '',
          district: response.user.district || '',
          state: response.user.state || '',
        });
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    // Refetch profile data from API
    if (token) {
      try {
        const response = await ApiClient.getUserProfile(token);
        if (response && response.user) {
          setFormData({
            name: response.user.name || '',
            email: response.user.email || '',
            phone_number: response.user.phone_number || '',
            address: response.user.address || '',
            pin_code: response.user.pin_code || '',
            area: response.user.area || '',
            district: response.user.district || '',
            state: response.user.state || '',
          });
        }
      } catch (error) {
        console.error('Failed to refetch profile:', error);
      }
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-creme py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-primary uppercase tracking-[0.25em] text-alpha/60 mb-2 flex items-center justify-center gap-4">
            <span className="w-12 h-[1px] bg-alpha/30"></span>
            Account
            <span className="w-12 h-[1px] bg-alpha/30"></span>
          </span>
          <h1 className="text-4xl md:text-5xl font-secondary text-alpha leading-tight tracking-tight mb-3">
            My <span className="italic font-light text-alpha/80">Profile</span>
          </h1>
          <p className="text-sm font-primary text-alpha/60 leading-relaxed">
            Manage your personal information and preferences
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white shadow-lg border border-alpha/10 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-alpha"></div>
              <p className="mt-4 text-sm text-alpha/60">Loading profile...</p>
            </div>
          ) : (
            <>
              {/* Profile Header */}
              <div className="bg-alpha/5 px-8 py-6 border-b border-alpha/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-alpha/10 flex items-center justify-center">
                      <svg className="w-8 h-8 text-alpha/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-secondary text-alpha">{formData.name || session?.user?.name || initialSession?.user?.name}</h2>
                      <p className="text-sm font-primary text-alpha/60">{formData.email || session?.user?.email || initialSession?.user?.email}</p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 text-xs font-primary uppercase tracking-[0.2em] border border-alpha/20 text-alpha hover:bg-alpha hover:text-creme transition-colors duration-300"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mx-8 mt-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm font-primary">
              {error}
            </div>
          )}
          {success && (
            <div className="mx-8 mt-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 text-sm font-primary">
              {success}
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-[0.6rem] font-primary uppercase tracking-[0.2em] text-alpha/60 mb-3">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className={`w-full bg-transparent border-b py-3 text-base font-primary text-alpha placeholder:text-alpha/30 focus:outline-none transition-colors duration-300 ${
                  isEditing ? 'border-alpha/20 focus:border-alpha' : 'border-alpha/10 cursor-not-allowed'
                }`}
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label htmlFor="email" className="block text-[0.6rem] font-primary uppercase tracking-[0.2em] text-alpha/60 mb-3">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full bg-alpha/5 border-b border-alpha/10 py-3 text-base font-primary text-alpha/50 cursor-not-allowed"
              />
              <p className="text-xs font-primary text-alpha/40 mt-2">Email cannot be changed</p>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone_number" className="block text-[0.6rem] font-primary uppercase tracking-[0.2em] text-alpha/60 mb-3">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full bg-transparent border-b py-3 text-base font-primary text-alpha placeholder:text-alpha/30 focus:outline-none transition-colors duration-300 ${
                  isEditing ? 'border-alpha/20 focus:border-alpha' : 'border-alpha/10 cursor-not-allowed'
                }`}
                placeholder="Enter your phone number"
              />
            </div>

            {/* Pin Code */}
            <div>
              <label htmlFor="pin_code" className="block text-[0.6rem] font-primary uppercase tracking-[0.2em] text-alpha/60 mb-3">
                Pin Code
              </label>
              <input
                type="text"
                id="pin_code"
                name="pin_code"
                value={formData.pin_code}
                onChange={handlePincodeChange}
                disabled={!isEditing}
                maxLength={6}
                className={`w-full bg-transparent border-b py-3 text-base font-primary text-alpha placeholder:text-alpha/30 focus:outline-none transition-colors duration-300 ${
                  isEditing ? 'border-alpha/20 focus:border-alpha' : 'border-alpha/10 cursor-not-allowed'
                }`}
                placeholder="Enter 6-digit pin code"
              />
            </div>

            {/* Area / Locality */}
            <div>
              <label htmlFor="area" className="block text-[0.6rem] font-primary uppercase tracking-[0.2em] text-alpha/60 mb-3">
                Area / Locality {availableAreas.length > 1 && <span className="text-tango">({availableAreas.length} options)</span>}
              </label>
              {availableAreas.length > 1 && isEditing ? (
                <CustomSelect
                  id="area"
                  name="area"
                  value={formData.area}
                  options={availableAreas}
                  onChange={(e: any) => handleChange(e)}
                  className="py-3"
                />
              ) : (
                <input
                  type="text"
                  id="area"
                  name="area"
                  value={formData.area}
                  readOnly
                  className="w-full bg-alpha/5 border-b border-alpha/10 py-3 text-base font-primary text-alpha/60 cursor-not-allowed"
                  placeholder="Auto-filled from pin code"
                />
              )}
            </div>

            {/* District and State */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="district" className="block text-[0.6rem] font-primary uppercase tracking-[0.2em] text-alpha/60 mb-3">
                  District
                </label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={formData.district}
                  readOnly
                  className="w-full bg-alpha/5 border-b border-alpha/10 py-3 text-base font-primary text-alpha/60 cursor-not-allowed"
                  placeholder="Auto-filled from pin code"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-[0.6rem] font-primary uppercase tracking-[0.2em] text-alpha/60 mb-3">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  readOnly
                  className="w-full bg-alpha/5 border-b border-alpha/10 py-3 text-base font-primary text-alpha/60 cursor-not-allowed"
                  placeholder="Auto-filled from pin code"
                />
              </div>
            </div>

            {/* Street Address */}
            <div>
              <label htmlFor="address" className="block text-[0.6rem] font-primary uppercase tracking-[0.2em] text-alpha/60 mb-3">
                Street Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                rows={3}
                className={`w-full bg-transparent border-b py-3 text-base font-primary text-alpha placeholder:text-alpha/30 focus:outline-none transition-colors duration-300 resize-none ${
                  isEditing ? 'border-alpha/20 focus:border-alpha' : 'border-alpha/10 cursor-not-allowed'
                }`}
                placeholder="House/Flat no, Street, Area"
              />
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-alpha text-creme py-4 text-xs font-primary uppercase tracking-[0.2em] hover:bg-tango transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 border border-alpha/20 text-alpha py-4 text-xs font-primary uppercase tracking-[0.2em] hover:bg-alpha/5 transition-colors duration-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>

          {/* Account Actions */}
          <div className="border-t border-alpha/10 px-8 py-6 bg-alpha/5">
            <h3 className="text-sm font-primary uppercase tracking-[0.2em] text-alpha/60 mb-4">
              Account Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/orders')}
                className="w-full text-left px-4 py-3 border border-alpha/10 text-sm font-primary text-alpha hover:bg-white transition-colors duration-300 flex items-center justify-between"
              >
                <span>View My Orders</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 border border-red-200 text-sm font-primary text-red-600 hover:bg-red-50 transition-colors duration-300"
              >
                Logout
              </button>
            </div>
          </div>
            </>
          )}
        </div>

        {/* Account Info */}
        <div className="mt-8 text-center">
          <p className="text-xs font-primary text-alpha/40">
            Member since {new Date((session?.user?.email || initialSession?.user?.email) ? '2024-01-01' : Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
