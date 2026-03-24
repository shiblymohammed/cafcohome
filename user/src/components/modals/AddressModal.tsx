"use client";

import { useState, useEffect } from "react";
import { X, MapPin } from "lucide-react";
import CustomSelect from "@/src/components/ui/CustomSelect";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: AddressData) => void;
  initialAddress?: AddressData;
}

export interface AddressData {
  address: string;
  phone_number: string;
  pin_code: string;
  area: string;
  district: string;
  state: string;
}

export default function AddressModal({ isOpen, onClose, onSave, initialAddress }: AddressModalProps) {
  const [formData, setFormData] = useState<AddressData>({
    address: "",
    phone_number: "",
    pin_code: "",
    area: "",
    district: "",
    state: "",
  });
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState("");

  useEffect(() => {
    if (initialAddress) {
      setFormData(initialAddress);
    }
  }, [initialAddress]);

  // Prevent body scroll when modal is open
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

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pincode = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData({ ...formData, pin_code: pincode });
    setPincodeError("");

    if (pincode.length === 6) {
      setPincodeLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/pincode/${pincode}/`);
        if (response.ok) {
          const data = await response.json();
          
          // Set available areas if multiple exist
          if (data.areas && data.areas.length > 1) {
            setAvailableAreas(data.areas);
            setFormData(prev => ({
              ...prev,
              area: data.area || data.areas[0] || "",
              district: data.district || "",
              state: data.state || "",
            }));
          } else {
            setAvailableAreas([]);
            setFormData(prev => ({
              ...prev,
              area: data.area || "",
              district: data.district || "",
              state: data.state || "",
            }));
          }
        } else {
          setPincodeError("Invalid pincode");
          setAvailableAreas([]);
          setFormData(prev => ({
            ...prev,
            area: "",
            district: "",
            state: "",
          }));
        }
      } catch (error) {
        console.error("Pincode lookup error:", error);
        setPincodeError("Failed to lookup pincode");
        setAvailableAreas([]);
        setFormData(prev => ({
          ...prev,
          area: "",
          district: "",
          state: "",
        }));
      } finally {
        setPincodeLoading(false);
      }
    } else if (pincode.length < 6) {
      setAvailableAreas([]);
      setFormData(prev => ({
        ...prev,
        area: "",
        district: "",
        state: "",
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-alpha/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-creme w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-alpha/10">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-alpha" />
            <h2 className="text-2xl font-secondary text-alpha">
              {initialAddress?.address ? "Edit Address" : "Add Address"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-alpha/5 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-alpha" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5">
            {/* Phone Number */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-alpha/60 mb-2 font-primary">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
                className="w-full px-4 py-3 border border-alpha/20 bg-white text-sm font-primary placeholder:text-alpha/40 focus:outline-none focus:border-alpha transition-colors"
              />
            </div>

            {/* Street Address */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-alpha/60 mb-2 font-primary">
                Street Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House/Flat No., Building Name, Street"
                required
                rows={3}
                className="w-full px-4 py-3 border border-alpha/20 bg-white text-sm font-primary placeholder:text-alpha/40 focus:outline-none focus:border-alpha transition-colors resize-none"
              />
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-alpha/60 mb-2 font-primary">
                Pincode *
              </label>
              <input
                type="text"
                value={formData.pin_code}
                onChange={handlePincodeChange}
                placeholder="Enter 6-digit pincode"
                required
                maxLength={6}
                className="w-full px-4 py-3 border border-alpha/20 bg-white text-sm font-primary placeholder:text-alpha/40 focus:outline-none focus:border-alpha transition-colors"
              />
              {pincodeLoading && (
                <p className="text-xs text-alpha/60 mt-1">Looking up pincode...</p>
              )}
              {pincodeError && (
                <p className="text-xs text-red-600 mt-1">{pincodeError}</p>
              )}
            </div>

            {/* Area / Locality */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-alpha/60 mb-2 font-primary">
                Area / Locality * {availableAreas.length > 1 && <span className="text-tango">({availableAreas.length} options)</span>}
              </label>
              {availableAreas.length > 1 ? (
                <CustomSelect
                  id="area"
                  name="area"
                  value={formData.area}
                  options={availableAreas}
                  onChange={handleChange}
                  className="py-3"
                />
              ) : (
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  readOnly
                  required
                  className="w-full px-4 py-3 border border-alpha/10 bg-alpha/5 text-sm font-primary text-alpha/60 cursor-not-allowed"
                  placeholder="Auto-filled from pincode"
                />
              )}
            </div>

            {/* District */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-alpha/60 mb-2 font-primary">
                District *
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                readOnly
                required
                className="w-full px-4 py-3 border border-alpha/10 bg-alpha/5 text-sm font-primary text-alpha/60 cursor-not-allowed"
                placeholder="Auto-filled from pincode"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-alpha/60 mb-2 font-primary">
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                readOnly
                required
                className="w-full px-4 py-3 border border-alpha/10 bg-alpha/5 text-sm font-primary text-alpha/60 cursor-not-allowed"
                placeholder="Auto-filled from pincode"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-alpha/10 p-6 bg-ivory/30">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-alpha/20 text-alpha text-center px-6 py-4 hover:border-alpha transition font-primary text-xs uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="flex-1 bg-alpha text-creme text-center px-6 py-4 hover:bg-alpha/90 transition font-primary text-xs uppercase tracking-widest"
            >
              Save Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
