interface LinkedInIconProps {
  size?: number;
}

export default function LinkedInIcon({ size = 24 }: LinkedInIconProps) {
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
      {/* LinkedIn "in" */}
      <rect x="6.5" y="10" width="2.5" height="8" fill="currentColor" />
      <circle cx="7.7" cy="7.2" r="1.3" fill="currentColor" />
      <path
        d="M11.5 10h2.4v1.1c.3-.6 1.1-1.2 2.3-1.2 2.5 0 2.9 1.6 2.9 3.7v4.4h-2.5v-3.9c0-.9 0-2.1-1.3-2.1s-1.5 1-1.5 2v4h-2.5V10z"
        fill="currentColor"
      />
    </svg>
  );
}
