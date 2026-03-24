"use client";

import { useCart } from "@/src/contexts/CartContext";

interface CartIconProps {
    size?: number;
}

export default function CartIcon({ size = 24 }: CartIconProps) {
    const { itemCount } = useCart();
    
    return (
        <div className="relative">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width={size}
                height={size}
            >
                <g
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    {/* rounded square bag */}
                    <rect x="3" y="6" width="18" height="14" rx="3" />
                    {/* curved handle */}
                    <path d="M8 5a4 4 0 0 1 8 0" />
                    {/* handle connectors */}
                    <path d="M8 6v1" />
                    <path d="M16 6v1" />
                </g>
            </svg>
            {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-tango text-creme text-[10px] font-primary font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                </span>
            )}
        </div>
    );
}
