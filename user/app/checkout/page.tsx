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
  const { items, itemCount, clearCart } = useCart();
  
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
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [placingOrder, setPlacingOrder] = useState(false);

  // Fetch user profile
  const fetchProfile = async () => {
    if (session?.accessToken) {
      setLoading(true);
      try {
        const response = await ApiClient.getUserProfile(session.accessToken);
        
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
    if (!session?.accessToken) {
      alert("Please log in to save your address.");
      return;
    }
    
    try {
      const response = await ApiClient.updateUserProfile(addressData, session.accessToken);
      
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

  const cartSubtotal = items.reduce((sum, item) => sum + ((item.variantPrice || Number(item.product.price) || 0) * item.quantity), 0);
  const cartTotalMrp = items.reduce((sum, item) => sum + ((item.variantMrp || Number(item.product.mrp) || 0) * item.quantity), 0);
  const totalDiscount = cartTotalMrp > cartSubtotal ? cartTotalMrp - cartSubtotal : 0;

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

  const handleConfirmOrder = async () => {
    if (!consentChecked || !session?.accessToken) {
      return;
    }

    setPlacingOrder(true);
    
    try {
      // Prepare order data
      const orderData = {
        items: await Promise.all(items.map(async (item) => {
          let unitPrice = item.variantPrice || 0;
          let variantId = item.variantId;
          
          // If no variant price in cart, try to fetch from product
          if (!unitPrice && item.product.id) {
            try {
              const productData = await ApiClient.getProductBySlug(item.product.slug);
              if (productData && productData.variants && productData.variants.length > 0) {
                // Get default or first variant
                const variant = productData.variants.find((v: any) => v.is_default) || productData.variants[0];
                if (variant) {
                  unitPrice = parseFloat(variant.price);
                  variantId = variant.id;
                }
              }
            } catch (error) {
              console.error('Failed to fetch product variant:', error);
            }
          }
          
          console.log('Order item:', {
            product: item.product.name,
            variantId: variantId,
            unitPrice: unitPrice
          });
          
          return {
            product_id: item.product.id,
            quantity: item.quantity,
            variant_id: variantId,
            unit_price: unitPrice,
          };
        })),
        delivery_address: `${userProfile.address}, ${userProfile.area}, ${userProfile.district}, ${userProfile.state} - ${userProfile.pin_code}`,
        phone_number: getWhatsappNumber(),
      };

      // Create order via API
      const response = await ApiClient.createOrder(orderData, session.accessToken);
      
      if (response && response.order) {
        setOrderNumber(response.order.order_number);
        setShowConsentModal(false);
        setOrderPlaced(true);
        
        // Clear cart after successful order
        clearCart();
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      console.error("Failed to place order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="bg-creme min-h-screen pt-32 pb-16 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-success/5 rounded-full blur-[100px]" />
        <div className="max-w-xl mx-auto px-4 text-center relative z-10">
          <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-12 shadow-sm border border-alpha/5">
            <div className="w-24 h-24 bg-success/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
              <Check className="w-10 h-10 text-success" />
            </div>
            <h1 className="text-4xl font-secondary text-alpha mb-4">Order Confirmed!</h1>
            {orderNumber && (
              <p className="text-sm font-bold tracking-widest uppercase text-alpha/60 mb-6">
                Order #{orderNumber}
              </p>
            )}
            <p className="text-[13px] font-medium text-alpha/70 mb-3">
              Your order details have been sent to your WhatsApp.
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366]/10 text-[#25D366] rounded-2xl text-[12px] font-bold tracking-wider mb-8">
              <MessageCircle className="w-4 h-4" />
              {getWhatsappNumber()}
            </div>
            <div className="p-5 bg-alpha/5 rounded-2xl border border-alpha/5 mb-10">
              <p className="text-[12px] font-medium text-alpha/70 leading-relaxed">
                <strong className="block text-alpha mb-1">What's Next?</strong>
                Our team will contact you shortly to confirm your order and arrange delivery details.
              </p>
            </div>
            <a
              href="/"
              className="inline-block bg-alpha text-white px-10 py-4 rounded-2xl text-[12px] font-bold uppercase tracking-widest hover:bg-tango hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-creme min-h-screen pt-28 pb-16 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-alpha/5 rounded-full blur-[100px]" />
      
      <div className="max-w-[1200px] mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="mb-10 text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl font-secondary text-alpha mb-2 tracking-tight">Checkout</h1>
          <p className="text-[13px] font-medium text-alpha/60">Review your order and confirm</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left - Order Items */}
          <div className="lg:col-span-3 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-alpha/5 overflow-hidden">
              <div className="px-6 py-5 border-b border-alpha/5 flex items-center justify-between bg-alpha/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[1rem] bg-white flex items-center justify-center shadow-sm">
                    <MapPin className="w-4 h-4 text-alpha" />
                  </div>
                  <h2 className="text-[11px] font-bold uppercase tracking-widest text-alpha">Delivery Address</h2>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-alpha"></div>
                  </div>
                ) : hasAddress ? (
                  <div className="space-y-5">
                    <div className="p-5 bg-alpha/5 rounded-2xl border border-alpha/5 relative group">
                      <div className="text-[13px] text-alpha/70 leading-relaxed space-y-1">
                        <p className="font-bold text-base text-alpha mb-2">{userProfile.name}</p>
                        <p>{userProfile.address}</p>
                        <p>{userProfile.area}</p>
                        <p>{userProfile.district}, {userProfile.state} - {userProfile.pin_code}</p>
                        {userProfile.phone_number && (
                          <p className="mt-3 flex items-center gap-2 font-medium">
                            <Phone className="w-4 h-4 text-alpha/50" />
                            {userProfile.phone_number}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="flex items-center justify-center gap-2 w-full sm:w-auto text-[11px] font-bold uppercase tracking-widest text-alpha bg-white border border-alpha/10 px-6 py-3.5 rounded-2xl hover:border-alpha/30 hover:shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Address
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-alpha/5 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-8 h-8 text-alpha/40" />
                    </div>
                    <p className="text-[13px] font-medium text-alpha/60 mb-6">No delivery address added</p>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="bg-alpha text-white px-8 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-tango shadow-sm hover:shadow-md transition-all duration-300 inline-flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <MapPin className="w-4 h-4" />
                      Add Address
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Cart Items */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-alpha/5 overflow-hidden">
              <div className="px-6 py-5 border-b border-alpha/5 flex items-center gap-3 bg-alpha/5">
                <div className="w-8 h-8 rounded-[1rem] bg-white flex items-center justify-center shadow-sm">
                  <span className="text-[10px] font-bold">{itemCount}</span>
                </div>
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-alpha">Your Items</h2>
              </div>
              {items.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-[13px] font-medium text-alpha/60">Your cart is empty</p>
                </div>
              ) : (
                <div className="divide-y divide-alpha/5">
                  {items.map((item) => {
                    const mainImage = item.product.images && item.product.images.length > 0
                      ? item.product.images[0].url 
                      : "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=800&fit=crop";
                    return (
                      <div key={item.product.id} className="p-6 flex gap-5 group">
                        <div className="relative w-24 h-24 rounded-2xl bg-alpha/5 overflow-hidden flex-shrink-0">
                          <Image src={mainImage} alt={item.product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h3 className="text-base font-secondary text-alpha line-clamp-2 leading-tight">{item.product.name}</h3>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-alpha/40 mt-1">{item.product.category_name}</p>
                          <div className="flex justify-between items-end mt-3">
                            <p className="text-[12px] font-medium text-alpha/60 bg-alpha/5 px-3 py-1 rounded-lg">Qty: {item.quantity}</p>
                            <p className="text-sm font-bold text-alpha">
                              ₹{((item.variantPrice || Number(item.product.price) || 0) * item.quantity).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* WhatsApp Number Selection */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-alpha/5 overflow-hidden">
              <div className="px-6 py-5 border-b border-alpha/5 flex items-center gap-3 bg-alpha/5">
                <div className="w-8 h-8 rounded-[1rem] bg-white flex items-center justify-center shadow-sm">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                </div>
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-alpha">
                  WhatsApp for Order Details
                </h2>
              </div>
              <div className="p-6 space-y-5">
                <p className="text-[12px] font-medium text-alpha/60">
                  Select where you'd like to receive your order confirmation and details.
                </p>

                {/* Option 1: Use Phone Number from Address */}
                {userProfile?.phone_number && (
                  <label
                    className={`flex items-center gap-4 p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                      whatsappOption === "address"
                        ? "border-alpha bg-alpha/5 shadow-sm"
                        : "border-alpha/10 hover:border-alpha/30 hover:bg-alpha/5"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      whatsappOption === "address" ? "border-alpha" : "border-alpha/30"
                    }`}>
                      {whatsappOption === "address" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-alpha scale-in"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-bold text-alpha">Use address phone number</p>
                      <p className="text-[12px] font-medium text-alpha/60 mt-1 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
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
                  className={`block p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    whatsappOption === "custom"
                      ? "border-alpha bg-alpha/5 shadow-sm"
                      : "border-alpha/10 hover:border-alpha/30 hover:bg-alpha/5"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      whatsappOption === "custom" ? "border-alpha" : "border-alpha/30"
                    }`}>
                      {whatsappOption === "custom" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-alpha scale-in"></div>
                      )}
                    </div>
                    <p className="text-[13px] font-bold text-alpha">Use a different WhatsApp number</p>
                    <input
                      type="radio"
                      name="whatsapp"
                      checked={whatsappOption === "custom"}
                      onChange={() => setWhatsappOption("custom")}
                      className="sr-only"
                    />
                  </div>
                  
                  {whatsappOption === "custom" && (
                    <div className="mt-5 ml-9 animate-fade-in">
                      <div className="flex gap-3">
                        {/* Country Code Dropdown */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                            className="flex items-center gap-2 px-4 py-3.5 bg-white border border-alpha/10 rounded-2xl text-[13px] font-medium hover:border-alpha/30 transition-all min-w-[110px]"
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
                                className="absolute bottom-full left-0 mb-2 w-56 bg-white/95 backdrop-blur-xl border border-alpha/10 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] z-20 max-h-60 overflow-y-auto overscroll-contain py-2"
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
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-left hover:bg-alpha/5 transition-colors ${
                                      selectedCountryCode === country.code ? "bg-alpha/5 text-alpha" : "text-alpha/70"
                                    }`}
                                  >
                                    <span className="text-base">{country.flag}</span>
                                    <span>{country.country}</span>
                                    <span className="text-alpha/40 ml-auto">{country.code}</span>
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
                          className="flex-1 px-5 py-3.5 bg-white border border-alpha/10 rounded-2xl text-[13px] font-medium text-alpha placeholder:text-alpha/40 focus:outline-none focus:border-alpha/30 focus:shadow-inner transition-all"
                        />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-alpha/30 mt-3 pl-2">
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
            <div className="bg-white rounded-[2rem] shadow-sm border border-alpha/5 overflow-hidden sticky top-28">
              <div className="px-6 py-5 border-b border-alpha/5 bg-alpha/5">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-alpha">Order Summary</h2>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex justify-between items-center text-[13px] font-medium">
                  <span className="text-alpha/60">Total Items</span>
                  <span className="text-alpha font-bold">{itemCount}</span>
                </div>
                {cartTotalMrp > cartSubtotal && (
                  <div className="flex justify-between items-center text-[13px] font-medium text-alpha/60">
                    <span>Total MRP</span>
                    <span className="line-through">₹{cartTotalMrp.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[13px] font-medium">
                  <span className="text-alpha/60">Subtotal</span>
                  <span className="text-alpha font-bold">₹{cartSubtotal.toLocaleString("en-IN")}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between items-center text-[13px] font-bold text-success bg-success/5 p-3 rounded-xl">
                    <span>Discount</span>
                    <span>-₹{totalDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="h-px bg-alpha/5 my-2"></div>
                <div className="flex justify-between items-end font-secondary">
                  <span className="text-alpha text-xl">Total</span>
                  <span className="text-alpha text-2xl">₹{cartSubtotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={!hasAddress || (whatsappOption === "custom" && !customWhatsapp) || items.length === 0}
                    className="w-full bg-alpha text-white py-4 rounded-2xl text-[12px] font-bold uppercase tracking-widest hover:bg-tango hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Place Order
                  </button>

                  {!hasAddress && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-tango text-center mt-4">
                      Please add delivery address
                    </p>
                  )}
                  
                  <p className="text-[11px] font-medium text-alpha/40 text-center mt-4 bg-alpha/5 p-3 rounded-xl">
                    Order details will be sent to your WhatsApp
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-alpha/40 backdrop-blur-md transition-opacity" onClick={() => setShowConsentModal(false)} />
          <div className="relative bg-white/95 backdrop-blur-2xl w-full max-w-md rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] border border-alpha/10 overflow-hidden transform scale-100 animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-alpha/5 bg-alpha/5">
              <h3 className="text-2xl font-secondary text-alpha">Confirm Order</h3>
              <button
                onClick={() => setShowConsentModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-alpha/50 hover:text-alpha hover:shadow-sm transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              {/* WhatsApp Info */}
              <div className="flex items-center gap-4 p-5 bg-[#25D366]/10 rounded-2xl border border-[#25D366]/20">
                <div className="w-10 h-10 rounded-[1rem] bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-[#25D366]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#25D366]/80 mb-0.5">Sent to WhatsApp</p>
                  <p className="text-[13px] font-bold text-alpha">{getWhatsappNumber()}</p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-3 bg-alpha/5 p-5 rounded-2xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-alpha/50 mb-3">Order Summary</p>
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-[13px] font-medium">
                    <span className="text-alpha/70 truncate mr-4">{item.product.name} × {item.quantity}</span>
                    <span className="text-alpha font-bold shrink-0">
                      ₹{((item.variantPrice || Number(item.product.price) || 0) * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
                <div className="h-px bg-alpha/10 my-3"></div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-alpha/60">Total</span>
                  <span className="text-lg font-bold text-alpha">₹{cartSubtotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Consent Checkbox */}
              <label className="flex items-start gap-4 cursor-pointer p-2">
                <div className="mt-0.5 relative">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                    consentChecked ? "bg-alpha border-alpha shadow-sm" : "border-alpha/20 bg-white"
                  }`}>
                    {consentChecked && <Check className="w-3.5 h-3.5 text-white scale-in" />}
                  </div>
                </div>
                <span className="text-[12px] font-medium text-alpha/70 leading-relaxed">
                  I consent to receive my order details and updates via WhatsApp. I understand that DravoHome will contact me on the provided number.
                </span>
              </label>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-alpha/5 bg-alpha/5 flex gap-3">
              <button
                onClick={() => setShowConsentModal(false)}
                disabled={placingOrder}
                className="flex-1 py-4 bg-white border border-alpha/10 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-alpha hover:border-alpha/30 hover:shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={!consentChecked || placingOrder}
                className="flex-[1.5] py-4 bg-alpha text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-tango hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {placingOrder ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Placing...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    Confirm
                  </>
                )}
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
