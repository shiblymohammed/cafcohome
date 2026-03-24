"use client";

import { useWishlist } from "@/src/contexts/WishlistContext";

interface WishlistIconProps {
    size?: number;
}

export default function WishlistIcon({ size = 24 }: WishlistIconProps) {
    const { itemCount } = useWishlist();
    
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
                    <path d="M12 20s-6-4.4-8.5-8C1.5 8.5 3 5 6.5 5c2 0 3.5 1.2 4.5 2.5C12 6.2 13.5 5 15.5 5 19 5 20.5 8.5 18.5 12c-2.5 3.6-8.5 8-8.5 8z" />
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
