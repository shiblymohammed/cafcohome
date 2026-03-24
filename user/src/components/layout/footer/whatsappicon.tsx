interface WhatsAppIconProps {
  size?: number;
}

export default function WhatsAppIcon({ size = 24 }: WhatsAppIconProps) {
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
      {/* WhatsApp icon */}
      <path
        d="M12 6.5c-3 0-5.5 2.5-5.5 5.5 0 1 .3 2 .8 2.8l-.5 1.9 2-.5c.8.5 1.7.8 2.7.8 3 0 5.5-2.5 5.5-5.5s-2.5-5.5-5.5-5.5zm3.2 7.8c-.1.4-.8.8-1.1.8-.3 0-.6.1-2-.4-1.7-.6-2.8-2.3-2.9-2.4-.1-.1-.7-.9-.7-1.7s.4-1.2.6-1.4c.1-.1.3-.2.4-.2h.3c.1 0 .3 0 .4.3.1.3.5 1.2.5 1.3 0 .1.1.2 0 .3-.1.1-.1.2-.2.3l-.3.3c-.1.1-.2.2-.1.4.1.2.5.8 1.1 1.3.7.6 1.3.8 1.5.9.2.1.3.1.4-.1.1-.1.5-.6.6-.8.1-.2.3-.2.4-.1.2.1 1 .5 1.2.6.2.1.3.1.4.2 0 .2 0 .6-.1 1z"
        fill="currentColor"
      />
    </svg>
  );
}
