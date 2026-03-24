"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Check, ChevronDown, MessageCircle, Phone, X, MapPin, Edit } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCart } from "@/src/contexts/CartContext";
import { ApiClient } from "@/src/lib/api/client";
import AddressModal, { AddressData } from "@/src/components/modals/AddressModal";

// Country codes list
const countryCodes = [
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "SA", flag: "🇸🇦" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+39", country: "IT", flag: "🇮🇹" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+65", country: "SG", flag: "🇸🇬" },
  { code: "+60", country: "MY", flag: "🇲🇾" },
  { code: "+63", country: "PH", flag: "🇵🇭" },
  { code: "+62", country: "ID", flag: "🇮🇩" },
  { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+52", country: "MX", flag: "🇲🇽" },
  { code: "+27", country: "ZA", flag: "🇿🇦" },
  { code: "+234", country: "NG", flag: "🇳🇬" },
  { code: "+254", country: "KE", flag: "🇰🇪" },
];

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const { items, itemCount } = useCart();
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [whatsappOption, setWhatsappOption] = useState<"address" | "custom">("address");
  const [customWhatsapp, setCustomWhatsapp] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Fetch user profile
  const fetchProfile = async () => {
    if (session) {
      setLoading(true);
      try {
        const response = await ApiClient.getUserProfile();
        
        if (response && response.user) {
          setUserProfile(response.user);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const hasAddress = userProfile?.address && userProfile?.pin_code && userProfile?.area && userProfile?.district && userProfile?.state;

  const handleSaveAddress = async (addressData: AddressData) => {
    try {
      const response = await ApiClient.updateUserProfile(addressData);
      
      if (response && response.user) {
        setUserProfile(response.user);
        // Refetch to ensure we have the latest data
        await fetchProfile();
      }
    } catch (error) {
      console.error("Failed to update address:", error);
      alert("Failed to save address. Please try again.");
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const total = subtotal;

  const getWhatsappNumber = () => {
    if (whatsappOption === "address") {
      return userProfile?.phone_number || "";
    } else {
      return `${selectedCountryCode} ${customWhatsapp}`;
    }
  };

  const selectedCountry = countryCodes.find(c => c.code === selectedCountryCode);

  const handlePlaceOrder = () => {
    if (!hasAddress) {
      alert("Please add your delivery address before placing an order");
      return;
    }
    setShowConsentModal(true);
  };

  const handleConfirmOrder = () => {
    if (consentChecked) {
      // Here you would call the Meta Business API
      console.log("Sending order details to WhatsApp:", getWhatsappNumber());
      setShowConsentModal(false);
      setOrderPlaced(true);
    }
  };

  if (orderPlaced) {
    return (
      <div className="bg-creme min-h-screen pt-24 md:pt-32 pb-16">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-3xl font-secondary text-alpha mb-4">Order Confirmed!</h1>
          <p className="text-alpha/70 mb-2">
            Your order details have been sent to your WhatsApp.
          </p>
          <p className="text-sm text-alpha/50 mb-8">
            <MessageCircle className="w-4 h-4 inline mr-1" />
            {getWhatsappNumber()}
          </p>
          <div className="p-4 bg-sand/30 border border-alpha/10 mb-8">
            <p className="text-sm text-alpha/70">
              Our team will contact you shortly to confirm your order and arrange delivery details.
            </p>
          </div>
          <a
            href="/"
            className="inline-block bg-alpha text-creme px-8 py-4 text-xs uppercase tracking-[0.2em] hover:bg-alpha/90 transition-colors"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-creme min-h-screen pt-20 md:pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-secondary text-alpha mb-2">Checkout</h1>
          <p className="text-sm text-alpha/60">Review your order and confirm</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left - Order Items */}
          <div className="lg:col-span-3 space-y-6">
            {/* Delivery Address */}
            <div className="border border-alpha/10 bg-white">
              <div className="px-5 py-4 border-b border-alpha/10 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-alpha" />
                <h2 className="text-sm font-primary uppercase tracking-widest text-alpha">Delivery Address</h2>
              </div>
              <div className="p-5">
                {/* Debug Info */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-xs">
                    <p><strong>Debug Info:</strong></p>
                    <p>Loading: {loading ? 'Yes' : 'No'}</p>
                    <p>Has Profile: {userProfile ? 'Yes' : 'No'}</p>
                    <p>Has Address: {hasAddress ? 'Yes' : 'No'}</p>
                    <p>Address: {userProfile?.address || 'empty'}</p>
                    <p>Phone: {userProfile?.phone_number || 'empty'}</p>
                    <p>Pincode: {userProfile?.pin_code || 'empty'}</p>
                    <p>Area: {userProfile?.area || 'empty'}</p>
                    <p>District: {userProfile?.district || 'empty'}</p>
                    <p>State: {userProfile?.state || 'empty'}</p>
                  </div>
                )}
                
                {loading ? (
                  <p className="text-sm text-alpha/60">Loading address...</p>
                ) : hasAddress ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-sand/20 border border-alpha/10">
                      <div className="text-sm text-alpha/80 leading-relaxed space-y-1">
                        <p className="font-medium text-alpha">{userProfile.name}</p>
                        <p>{userProfile.address}</p>
                        <p>{userProfile.area}</p>
                        <p>{userProfile.district}, {userProfile.state} - {userProfile.pin_code}</p>
                        {userProfile.phone_number && (
                          <p className="mt-2 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {userProfile.phone_number}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="flex items-center gap-2 text-xs uppercase tracking-widest text-alpha border border-alpha/20 px-4 py-2.5 hover:border-alpha hover:bg-alpha/5 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit Address
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-alpha/20 mx-auto mb-3" />
                    <p className="text-sm text-alpha/60 mb-4">No delivery address added</p>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="bg-alpha text-creme px-6 py-3 text-xs uppercase tracking-widest hover:bg-alpha/90 transition-colors inline-flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      Add Address
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Cart Items */}
            <div className="border border-alpha/10 bg-white">
              <div className="px-5 py-4 border-b border-alpha/10">
                <h2 className="text-sm font-primary uppercase tracking-widest text-alpha">Your Items ({itemCount})</h2>
              </div>
              {items.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-alpha/60">Your cart is empty</p>
                </div>
              ) : (
                <div className="divide-y divide-alpha/10">
                  {items.map((item) => {
                    const mainImage = item.product.images && item.product.images.length > 0
                      ? item.product.images[0].url 
                      : '/placeholder-product.jpg';
                    return (
                      <div key={item.product.id} className="p-5 flex gap-4">
                        <div className="relative w-20 h-24 bg-sand flex-shrink-0">
                          <Image src={mainImage} alt={item.product.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-primary text-alpha">{item.product.name}</h3>
                          <p className="text-xs text-alpha/60 mt-0.5">{item.product.category_name}</p>
                          <p className="text-xs text-alpha/60 mt-1">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* WhatsApp Number Selection */}
            <div className="border border-alpha/10 bg-white">
              <div className="px-5 py-4 border-b border-alpha/10 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <h2 className="text-sm font-primary uppercase tracking-widest text-alpha">
                  WhatsApp for Order Details
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs text-alpha/60">
                  Select where you&apos;d like to receive your order confirmation and details.
                </p>

                {/* Option 1: Use Phone Number from Address */}
                {userProfile?.phone_number && (
                  <label
                    className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${
                      whatsappOption === "address"
                        ? "border-alpha bg-sand/20"
                        : "border-alpha/20 hover:border-alpha/40"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      whatsappOption === "address" ? "border-alpha" : "border-alpha/30"
                    }`}>
                      {whatsappOption === "address" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-alpha"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-primary text-alpha">Use phone number provided in address</p>
                      <p className="text-xs text-alpha/60 mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {userProfile.phone_number}
                      </p>
                    </div>
                    <input
                      type="radio"
                      name="whatsapp"
                      checked={whatsappOption === "address"}
                      onChange={() => setWhatsappOption("address")}
                      className="sr-only"
                    />
                  </label>
                )}

                {/* Option 2: Use Different WhatsApp Number */}
                <label
                  className={`block p-4 border cursor-pointer transition-colors ${
                    whatsappOption === "custom"
                      ? "border-alpha bg-sand/20"
                      : "border-alpha/20 hover:border-alpha/40"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      whatsappOption === "custom" ? "border-alpha" : "border-alpha/30"
                    }`}>
                      {whatsappOption === "custom" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-alpha"></div>
                      )}
                    </div>
                    <p className="text-sm font-primary text-alpha">Use a different WhatsApp number</p>
                    <input
                      type="radio"
                      name="whatsapp"
                      checked={whatsappOption === "custom"}
                      onChange={() => setWhatsappOption("custom")}
                      className="sr-only"
                    />
                  </div>
                  
                  {whatsappOption === "custom" && (
                    <div className="mt-4 ml-9">
                      <div className="flex gap-2">
                        {/* Country Code Dropdown */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                            className="flex items-center gap-2 px-3 py-3 border border-alpha/20 bg-white text-sm font-primary hover:border-alpha/40 transition-colors min-w-[100px]"
                          >
                            <span>{selectedCountry?.flag}</span>
                            <span>{selectedCountryCode}</span>
                            <ChevronDown className={`w-4 h-4 text-alpha/50 transition-transform ${showCountryDropdown ? "rotate-180" : ""}`} />
                          </button>
                          
                          {showCountryDropdown && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setShowCountryDropdown(false)} 
                              />
                              <div 
                                className="absolute bottom-full left-0 mb-1 w-48 bg-white border border-alpha/20 shadow-dropdown z-20 max-h-60 overflow-y-auto overscroll-contain"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {countryCodes.map((country) => (
                                  <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => {
                                      setSelectedCountryCode(country.code);
                                      setShowCountryDropdown(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-sand/30 transition-colors ${
                                      selectedCountryCode === country.code ? "bg-sand/50" : ""
                                    }`}
                                  >
                                    <span>{country.flag}</span>
                                    <span className="text-alpha">{country.country}</span>
                                    <span className="text-alpha/50 ml-auto">{country.code}</span>
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Phone Number Input */}
                        <input
                          type="tel"
                          value={customWhatsapp}
                          onChange={(e) => setCustomWhatsapp(e.target.value.replace(/[^0-9\s]/g, ''))}
                          placeholder="Phone number"
                          className="flex-1 px-4 py-3 border border-alpha/20 bg-white text-sm font-primary placeholder:text-alpha/40 focus:outline-none focus:border-alpha transition-colors"
                        />
                      </div>
                      <p className="text-[10px] text-alpha/50 mt-2">
                        Example: 98765 43210
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Right - Summary */}
          <div className="lg:col-span-2">
            <div className="border border-alpha/10 bg-white sticky top-24">
              <div className="px-5 py-4 border-b border-alpha/10">
                <h2 className="text-sm font-primary uppercase tracking-widest text-alpha">Summary</h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-alpha/70">Total Items</span>
                  <span className="text-alpha">{itemCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-alpha/70">Pricing</span>
                  <span className="text-alpha/60 text-xs">Provided in quotation</span>
                </div>
                <div className="h-px bg-alpha/10"></div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={!hasAddress || (whatsappOption === "custom" && !customWhatsapp) || items.length === 0}
                  className="w-full bg-alpha text-creme py-4 text-xs uppercase tracking-[0.2em] hover:bg-alpha/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                >
                  <MessageCircle className="w-4 h-4" />
                  Place Order
                </button>

                {!hasAddress && (
                  <p className="text-[10px] text-red-600 text-center">
                    Please add delivery address to continue
                  </p>
                )}
                
                <p className="text-[10px] text-alpha/50 text-center">
                  Order details will be sent to your WhatsApp
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-alpha/50 backdrop-blur-sm" onClick={() => setShowConsentModal(false)} />
          <div className="relative bg-creme w-full max-w-md border border-alpha/10 shadow-modal">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-alpha/10">
              <h3 className="text-lg font-secondary text-alpha">Confirm Your Order</h3>
              <button
                onClick={() => setShowConsentModal(false)}
                className="w-8 h-8 flex items-center justify-center text-alpha/50 hover:text-alpha transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* WhatsApp Info */}
              <div className="flex items-center gap-3 p-4 bg-[#25D366]/10 border border-[#25D366]/20">
                <MessageCircle className="w-6 h-6 text-[#25D366]" />
                <div>
                  <p className="text-sm font-primary text-alpha">Order details will be sent to:</p>
                  <p className="text-sm text-alpha/70">{getWhatsappNumber()}</p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-alpha/50">Order Summary</p>
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-alpha/70">{item.product.name} × {item.quantity}</span>
                  </div>
                ))}
                <div className="h-px bg-alpha/10 my-2"></div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-alpha">Total Items</span>
                  <span className="text-alpha">{itemCount}</span>
                </div>
              </div>

              {/* Consent Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="mt-0.5">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 border-2 flex items-center justify-center transition-colors ${
                    consentChecked ? "bg-alpha border-alpha" : "border-alpha/30"
                  }`}>
                    {consentChecked && <Check className="w-3 h-3 text-creme" />}
                  </div>
                </div>
                <span className="text-sm text-alpha/70 leading-relaxed">
                  I consent to receive my order details and updates via WhatsApp. I understand that CAFCO will contact me on the provided number.
                </span>
              </label>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-alpha/10 flex gap-3">
              <button
                onClick={() => setShowConsentModal(false)}
                className="flex-1 py-3 border border-alpha/20 text-xs uppercase tracking-widest text-alpha hover:bg-sand/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={!consentChecked}
                className="flex-1 py-3 bg-alpha text-creme text-xs uppercase tracking-widest hover:bg-alpha/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address Modal */}
      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSave={handleSaveAddress}
        initialAddress={hasAddress ? {
          phone_number: userProfile.phone_number || "",
          address: userProfile.address,
          pin_code: userProfile.pin_code,
          area: userProfile.area,
          district: userProfile.district,
          state: userProfile.state,
        } : undefined}
      />
    </div>
  );
}
