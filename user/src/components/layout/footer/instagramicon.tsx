interface InstagramIconProps {
  size?: number;
}

export default function InstagramIcon({ size = 24 }: InstagramIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
    >
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
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="3.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.7"
      />
      <circle cx="17.4" cy="6.6" r="0.7" fill="currentColor" />
    </svg>
  );
}
