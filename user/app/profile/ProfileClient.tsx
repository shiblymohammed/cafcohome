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
    <div className="min-h-screen bg-creme pt-40 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-alpha/5 rounded-full blur-[100px]" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-secondary text-alpha leading-tight tracking-tight mb-3">
            My Profile
          </h1>
          <p className="text-[13px] font-medium text-alpha/60 leading-relaxed">
            Manage your personal information and preferences
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-sm border border-alpha/5 overflow-hidden">
          {isLoading ? (
            <div className="p-16 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-alpha"></div>
              <p className="mt-4 text-[13px] font-medium text-alpha/60">Loading profile...</p>
            </div>
          ) : (
            <>
              {/* Profile Header */}
              <div className="bg-alpha/5 px-8 py-8 border-b border-alpha/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-sm flex items-center justify-center">
                      <span className="text-2xl font-secondary text-alpha">
                        {(formData.name || session?.user?.name || initialSession?.user?.name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-secondary text-alpha">{formData.name || session?.user?.name || initialSession?.user?.name}</h2>
                      <p className="text-[13px] font-medium text-alpha/60">{formData.email || session?.user?.email || initialSession?.user?.email}</p>
                    </div>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-3 bg-white border border-alpha/10 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-alpha hover:border-alpha/20 hover:shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="mx-8 mt-6 bg-red-50/80 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-[13px] font-medium">
                  {error}
                </div>
              )}
              {success && (
                <div className="mx-8 mt-6 bg-green-50/80 border border-green-100 text-green-600 px-4 py-3 rounded-xl text-[13px] font-medium">
                  {success}
                </div>
              )}

              {/* Profile Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-widest text-alpha/50 mb-2 pl-1">
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
                      className={`w-full bg-alpha/5 border border-transparent rounded-2xl px-5 py-3.5 text-sm font-medium text-alpha placeholder:text-alpha/40 focus:outline-none transition-all duration-300 ${
                        isEditing ? 'focus:border-alpha/20 focus:bg-white shadow-inner' : 'opacity-60 cursor-not-allowed'
                      }`}
                    />
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-alpha/50 mb-2 pl-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full bg-alpha/5 border border-transparent rounded-2xl px-5 py-3.5 text-sm font-medium text-alpha/50 cursor-not-allowed"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phone_number" className="block text-[10px] font-bold uppercase tracking-widest text-alpha/50 mb-2 pl-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full bg-alpha/5 border border-transparent rounded-2xl px-5 py-3.5 text-sm font-medium text-alpha placeholder:text-alpha/40 focus:outline-none transition-all duration-300 ${
                        isEditing ? 'focus:border-alpha/20 focus:bg-white shadow-inner' : 'opacity-60 cursor-not-allowed'
                      }`}
                      placeholder="Enter phone number"
                    />
                  </div>

                  {/* Pin Code */}
                  <div>
                    <label htmlFor="pin_code" className="block text-[10px] font-bold uppercase tracking-widest text-alpha/50 mb-2 pl-1">
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
                      className={`w-full bg-alpha/5 border border-transparent rounded-2xl px-5 py-3.5 text-sm font-medium text-alpha placeholder:text-alpha/40 focus:outline-none transition-all duration-300 ${
                        isEditing ? 'focus:border-alpha/20 focus:bg-white shadow-inner' : 'opacity-60 cursor-not-allowed'
                      }`}
                      placeholder="Enter 6-digit pin code"
                    />
                  </div>
                </div>

                {/* Area / Locality */}
                <div>
                  <label htmlFor="area" className="block text-[10px] font-bold uppercase tracking-widest text-alpha/50 mb-2 pl-1">
                    Area / Locality {availableAreas.length > 1 && <span className="text-tango text-[9px]">({availableAreas.length} options)</span>}
                  </label>
                  {availableAreas.length > 1 && isEditing ? (
                    <CustomSelect
                      id="area"
                      name="area"
                      value={formData.area}
                      options={availableAreas}
                      onChange={(e: any) => handleChange(e)}
                    />
                  ) : (
                    <input
                      type="text"
                      id="area"
                      name="area"
                      value={formData.area}
                      readOnly
                      className="w-full bg-alpha/5 border border-transparent rounded-2xl px-5 py-3.5 text-sm font-medium text-alpha/60 cursor-not-allowed"
                      placeholder="Auto-filled from pin code"
                    />
                  )}
                </div>

                {/* District and State */}
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="district" className="block text-[10px] font-bold uppercase tracking-widest text-alpha/50 mb-2 pl-1">
                      District
                    </label>
                    <input
                      type="text"
                      id="district"
                      name="district"
                      value={formData.district}
                      readOnly
                      className="w-full bg-alpha/5 border border-transparent rounded-2xl px-5 py-3.5 text-sm font-medium text-alpha/60 cursor-not-allowed"
                      placeholder="Auto-filled"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-[10px] font-bold uppercase tracking-widest text-alpha/50 mb-2 pl-1">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      readOnly
                      className="w-full bg-alpha/5 border border-transparent rounded-2xl px-5 py-3.5 text-sm font-medium text-alpha/60 cursor-not-allowed"
                      placeholder="Auto-filled"
                    />
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label htmlFor="address" className="block text-[10px] font-bold uppercase tracking-widest text-alpha/50 mb-2 pl-1">
                    Street Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={3}
                    className={`w-full bg-alpha/5 border border-transparent rounded-2xl px-5 py-3.5 text-sm font-medium text-alpha placeholder:text-alpha/40 focus:outline-none transition-all duration-300 resize-none ${
                      isEditing ? 'focus:border-alpha/20 focus:bg-white shadow-inner' : 'opacity-60 cursor-not-allowed'
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
                      className="flex-1 bg-alpha text-white py-3.5 rounded-2xl text-[12px] font-bold uppercase tracking-widest hover:bg-tango shadow-sm hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex-1 bg-white border border-alpha/10 py-3.5 rounded-2xl text-[12px] font-bold uppercase tracking-widest text-alpha hover:border-alpha/20 hover:bg-alpha/5 transition-all duration-300 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>

              {/* Account Actions */}
              <div className="border-t border-alpha/5 px-8 py-6 bg-alpha/5">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-alpha/50 mb-4 pl-1">
                  Account Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => router.push('/orders')}
                    className="w-full px-5 py-4 bg-white rounded-2xl border border-alpha/5 text-[13px] font-medium text-alpha hover:border-alpha/20 hover:shadow-sm transition-all duration-300 flex items-center justify-between group"
                  >
                    <span>View My Orders</span>
                    <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-5 py-4 bg-white rounded-2xl border border-red-100 text-[13px] font-medium text-red-500 hover:border-red-200 hover:bg-red-50 hover:shadow-sm transition-all duration-300 flex items-center justify-between"
                  >
                    <span>Logout Account</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Account Info */}
        <div className="mt-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-alpha/30">
            Member since {new Date((session?.user?.email || initialSession?.user?.email) ? '2024-01-01' : Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
