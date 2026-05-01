import { Link, useLocation, useNavigate } from 'react-router-dom';
import './TopNavigation.css';

interface TopNavigationProps {
  userRole: 'admin' | 'staff';
  userName?: string;
  onLogout?: () => void;
}

interface MenuItem {
  path: string;
  label: string;
  adminOnly?: boolean;
}

interface MenuTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: MenuItem[];
}

// --- SVG Icon Components ---
const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const OrderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const CatalogIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const InventoryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8l-2-4H5L3 8" />
    <rect x="3" y="8" width="18" height="13" rx="1" />
    <path d="M10 12h4" />
  </svg>
);

const PeopleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const ContentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16,17 21,12 16,7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// --- Menu Tabs Configuration ---
const menuTabs: MenuTab[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    items: [
      { path: '/dashboard', label: 'Overview' },
    ],
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: <OrderIcon />,
    items: [
      { path: '/orders', label: 'All Orders' },
    ],
  },
  {
    id: 'catalog',
    label: 'Catalog',
    icon: <CatalogIcon />,
    items: [
      { path: '/products', label: 'Products', adminOnly: true },
      { path: '/products/add', label: 'Add Product', adminOnly: true },
      { path: '/categories', label: 'Categories', adminOnly: true },
      { path: '/brands', label: 'Brands', adminOnly: true },
      { path: '/materials-colors', label: 'Materials & Colors', adminOnly: true },
      { path: '/offers', label: 'Offers', adminOnly: true },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: <InventoryIcon />,
    items: [
      { path: '/inventory', label: 'Overview' },
      { path: '/stock-management', label: 'Stock Management' },
      { path: '/stock-movements', label: 'Movements' },
      { path: '/stock-alerts', label: 'Alerts' },
    ],
  },
  {
    id: 'people',
    label: 'People',
    icon: <PeopleIcon />,
    items: [
      { path: '/users', label: 'Customers', adminOnly: true },
      { path: '/staff', label: 'Staff', adminOnly: true },
    ],
  },
  {
    id: 'content',
    label: 'Content',
    icon: <ContentIcon />,
    items: [
      { path: '/blog', label: 'Blog', adminOnly: true },
      { path: '/shop-by-room', label: 'Shop By Room', adminOnly: true },
      { path: '/backup', label: 'Backup & Restore', adminOnly: true },
    ],
  },
];

const TopNavigation = ({ userRole, userName, onLogout }: TopNavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout?.();
    navigate('/login');
  };

  // Determine which tab should be active based on current path
  const getActiveTabFromPath = () => {
    for (const tab of menuTabs) {
      for (const item of tab.items) {
        if (location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'))) {
          return tab.id;
        }
      }
    }
    return null;
  };

  const currentActiveTab = getActiveTabFromPath();

  // Filter tabs based on user role
  const filteredTabs = menuTabs
    .map((tab) => ({
      ...tab,
      items: tab.items.filter(
        (item) => !item.adminOnly || userRole === 'admin'
      ),
    }))
    .filter((tab) => tab.items.length > 0);

  // Get the active tab's items to show in sub-tabs
  const activeTabItems = filteredTabs.find((tab) => tab.id === currentActiveTab)?.items || [];

  return (
    <div className="top-navigation">
      {/* Main Navigation Bar */}
      <div className="top-nav-bar">
        {/* Logo */}
        <div className="top-nav-logo">
          <div className="top-nav-logo-mark">
            <span>C</span>
          </div>
          <div className="top-nav-logo-text">
            <span className="top-nav-brand">DravoHome</span>
            <span className="top-nav-brand-sub">Admin Panel</span>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="top-nav-tabs">
          {filteredTabs.map((tab) => {
            const isActive = currentActiveTab === tab.id;
            
            return (
              <Link
                key={tab.id}
                to={tab.items[0].path}
                className={`top-nav-tab ${isActive ? 'top-nav-tab--active' : ''}`}
              >
                <span className="top-nav-tab-icon">{tab.icon}</span>
                <span className="top-nav-tab-label">{tab.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Menu */}
        <div className="top-nav-user">
          <div className="top-nav-user-info">
            <div className="top-nav-user-avatar">
              {userName?.charAt(0).toUpperCase()}
            </div>
            <div className="top-nav-user-details">
              <span className="top-nav-user-name">{userName}</span>
              <span className="top-nav-user-role">{userRole}</span>
            </div>
          </div>
          <button className="top-nav-logout" onClick={handleLogout} title="Logout">
            <LogoutIcon />
          </button>
        </div>
      </div>

      {/* Sub-tabs (always shown for active tab) */}
      {activeTabItems.length > 0 && (
        <div className="top-nav-subtabs">
          <div className="top-nav-subtabs-container">
            {activeTabItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`top-nav-subtab ${isActive ? 'top-nav-subtab--active' : ''}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopNavigation;
