import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

interface SidebarProps {
  userRole: 'admin' | 'staff';
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/categories', label: 'Categories', icon: '🏷️', adminOnly: true },
  { path: '/brands', label: 'Brands', icon: '🏢', adminOnly: true },
  { path: '/materials-colors', label: 'Materials & Colors', icon: '🎨', adminOnly: true },
  { path: '/products', label: 'Products', icon: '🛋️', adminOnly: true },
  { path: '/offers', label: 'Offers', icon: '🎁', adminOnly: true },
  { path: '/orders', label: 'Orders', icon: '📦' },
  { path: '/users', label: 'Users', icon: '👥', adminOnly: true },
  { path: '/staff', label: 'Staff', icon: '👨‍💼', adminOnly: true },
  { path: '/blog', label: 'Blog', icon: '📝', adminOnly: true },
  { path: '/shop-by-room', label: 'Shop By Room', icon: '🏠', adminOnly: true },
];

const Sidebar = ({ userRole, isOpen, onClose }: SidebarProps) => {
  const location = useLocation();

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || userRole === 'admin'
  );

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>CAFCO</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <nav className="sidebar-nav">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${
                location.pathname === item.path ? 'active' : ''
              }`}
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
