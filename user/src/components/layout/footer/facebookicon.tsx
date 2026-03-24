interface FacebookIconProps {
  size?: number;
}

export default function FacebookIcon({ size = 24 }: FacebookIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
    >
      {/* outer rounded square */}
      <rect
        x="2.2"
        y="2.2"
        width="19.6"
        height="19.6"
        rx="5.2"
        ry="5.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.7"
      />
      {/* facebook "f" */}
      <path
        d="M14.5 7.2h-1.6c-.5 0-.9.4-.9.9v1.4h2.4l-.3 2.3h-2.1v5.2h-2.3v-5.2H8.7v-2.3h1.0V8.0c0-1.6 1.0-3.0 2.9-3.0h1.9v2.2z"
        fill="currentColor"
      />
    </svg>
  );
}
