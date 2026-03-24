interface MenuAnimationProps {
  isOpen: boolean;
  size?: number;
}

export default function MenuAnimation({ isOpen, size = 24 }: MenuAnimationProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      width={size} 
      height={size}
      className={isOpen ? "menu-open" : ""}
    >
      <path className="menu-line l1" d="M4 7h16"/>
      <path className="menu-line l2" d="M4 12h16"/>
      <path className="menu-line l3" d="M4 17h8"/>
    </svg>
  );
}
