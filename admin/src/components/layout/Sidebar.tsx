import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';

interface SidebarProps {
  userRole: 'admin' | 'staff';
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userName?: string;
  onLogout?: () => void;
}

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

// --- SVG Icon Components ---
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const CategoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h6v6H4z" />
    <path d="M14 4h6v6h-6z" />
    <path d="M4 14h6v6H4z" />
    <circle cx="17" cy="17" r="3" />
  </svg>
);

const BrandIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18Z" />
    <path d="M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2" />
    <path d="M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </svg>
);

const PaletteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="10.5" r="2.5" />
    <circle cx="8.5" cy="7.5" r="2.5" />
    <circle cx="6.5" cy="12.5" r="2.5" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

const ProductIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const OfferIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="3" />
  </svg>
);

const OrderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);

const InventoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8l-2-4H5L3 8" />
    <rect x="3" y="8" width="18" height="13" rx="1" />
    <path d="M10 12h4" />
  </svg>
);

const StockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2m5.66 0H14a2 2 0 012 2v3.34" />
    <path d="M3 15h12" />
    <path d="M18 8l4 4-4 4" />
    <path d="M22 12H10" />
  </svg>
);

const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const StaffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

const BlogIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const RoomIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15,18 9,12 15,6" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16,17 21,12 16,7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const WarehouseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 8.35V20a2 2 0 01-2 2H4a2 2 0 01-2-2V8.35A2 2 0 013.26 6.5l8-3.2a2 2 0 011.48 0l8 3.2A2 2 0 0122 8.35z" />
    <path d="M6 18h12" />
    <path d="M6 14h12" />
    <rect x="6" y="10" width="12" height="12" rx="0" fill="none" />
  </svg>
);

// --- Menu Sections ---
const menuSections: MenuSection[] = [
  {
    title: 'Main',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
      { path: '/orders', label: 'Orders', icon: <OrderIcon /> },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { path: '/products', label: 'Products', icon: <ProductIcon />, adminOnly: true },
      { path: '/categories', label: 'Categories', icon: <CategoryIcon />, adminOnly: true },
      { path: '/brands', label: 'Brands', icon: <BrandIcon />, adminOnly: true },
      { path: '/materials-colors', label: 'Materials & Colors', icon: <PaletteIcon />, adminOnly: true },
      { path: '/offers', label: 'Offers', icon: <OfferIcon />, adminOnly: true },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { path: '/inventory', label: 'Overview', icon: <InventoryIcon /> },
      { path: '/stock-management', label: 'Stock Management', icon: <WarehouseIcon /> },
      { path: '/stock-movements', label: 'Movements', icon: <StockIcon /> },
      { path: '/stock-alerts', label: 'Alerts', icon: <AlertIcon /> },
    ],
  },
  {
    title: 'People',
    items: [
      { path: '/users', label: 'Customers', icon: <UsersIcon />, adminOnly: true },
      { path: '/staff', label: 'Staff', icon: <StaffIcon />, adminOnly: true },
    ],
  },
  {
    title: 'Content',
    items: [
      { path: '/blog', label: 'Blog', icon: <BlogIcon />, adminOnly: true },
      { path: '/shop-by-room', label: 'Shop By Room', icon: <RoomIcon />, adminOnly: true },
    ],
  },
];

const Sidebar = ({
  userRole,
  isOpen,
  onClose,
  collapsed,
  onToggleCollapse,
  userName,
  onLogout,
}: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleLogout = () => {
    onLogout?.();
    navigate('/login');
  };

  const filteredSections = menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.adminOnly || userRole === 'admin'
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside
        className={`sidebar ${isOpen ? 'sidebar--open' : ''} ${collapsed ? 'sidebar--collapsed' : ''}`}
      >
        {/* Logo Area */}
        <div className="sidebar__logo">
          <div className="sidebar__logo-mark">
            <span>C</span>
          </div>
          <div className="sidebar__logo-text">
            <span className="sidebar__brand">CAFCO</span>
            <span className="sidebar__brand-sub">Admin</span>
          </div>
          <button className="sidebar__close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          {filteredSections.map((section) => (
            <div className="sidebar__section" key={section.title}>
              <div className="sidebar__section-title">
                <span>{section.title}</span>
              </div>
              <div className="sidebar__section-items">
                {section.items.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== '/dashboard' &&
                      location.pathname.startsWith(item.path + '/'));
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`sidebar__item ${isActive ? 'sidebar__item--active' : ''}`}
                      onClick={onClose}
                      onMouseEnter={() => setHoveredItem(item.path)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span className="sidebar__item-icon">{item.icon}</span>
                      <span className="sidebar__item-label">{item.label}</span>
                      {isActive && <span className="sidebar__item-indicator" />}
                      {/* Tooltip for collapsed mode */}
                      {collapsed && hoveredItem === item.path && (
                        <span className="sidebar__tooltip">{item.label}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar__footer">
          {/* Collapse toggle */}
          <button
            className="sidebar__collapse-btn"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className={`sidebar__collapse-icon ${collapsed ? 'sidebar__collapse-icon--flipped' : ''}`}>
              <ChevronLeftIcon />
            </span>
            <span className="sidebar__collapse-label">Collapse</span>
          </button>

          {/* User profile */}
          {userName && (
            <div className="sidebar__user">
              <div className="sidebar__user-avatar">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="sidebar__user-info">
                <span className="sidebar__user-name">{userName}</span>
                <span className="sidebar__user-role">{userRole}</span>
              </div>
              <button
                className="sidebar__logout-btn"
                onClick={handleLogout}
                title="Logout"
              >
                <LogoutIcon />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
