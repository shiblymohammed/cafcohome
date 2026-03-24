interface SearchIconProps {
    size?: number;
    className?: string;
}

export default function SearchIcon({ size = 24, className }: SearchIconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={className}
        >
            <g
                fill="none"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {/* circle lens */}
                <circle cx="11" cy="11" r="6" />
                {/* handle */}
                <path d="M16 16l4 4" />
            </g>
        </svg>
    );
}
