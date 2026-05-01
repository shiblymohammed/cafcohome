import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import './AdminLayout.css';

/* ─── Icons ─────────────────────────────────────────────── */
const Icons = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  orders:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  catalog:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  inventory: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8l-2-4H5L3 8"/><rect x="3" y="8" width="18" height="13" rx="1"/><path d="M10 12h4"/></svg>,
  people:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  content:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  logout:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  chevron:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  menu:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

/* ─── Nav Structure ─────────────────────────────────────── */
interface NavItem { path: string; label: string; adminOnly?: boolean; }
interface NavGroup {
  id: string; label: string; icon: React.ReactNode;
  color: string; items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard,
    color: 'var(--color-beta)',
    items: [{ path: '/dashboard', label: 'Overview' }],
  },
  {
    id: 'orders', label: 'Orders', icon: Icons.orders,
    color: 'var(--color-alpha)',
    items: [{ path: '/orders', label: 'All Orders' }],
  },
  {
    id: 'catalog', label: 'Catalog', icon: Icons.catalog,
    color: 'var(--color-gamma)',
    items: [
      { path: '/products',      label: 'Products',          adminOnly: true },
      { path: '/products/add',  label: 'Add Product',       adminOnly: true },
      { path: '/categories',    label: 'Categories',        adminOnly: true },
      { path: '/collections',   label: 'Collections',       adminOnly: true },
      { path: '/brands',        label: 'Brands',            adminOnly: true },
      { path: '/materials-colors', label: 'Materials & Colors', adminOnly: true },
      { path: '/offers',        label: 'Offers',            adminOnly: true },
    ],
  },
  {
    id: 'inventory', label: 'Inventory', icon: Icons.inventory,
    color: 'var(--color-delta)',
    items: [
      { path: '/inventory',         label: 'Overview' },
      { path: '/stock-management',  label: 'Stock Management' },
      { path: '/stock-movements',   label: 'Movements' },
      { path: '/stock-alerts',      label: 'Alerts' },
    ],
  },
  {
    id: 'people', label: 'People', icon: Icons.people,
    color: 'var(--color-zeta)',
    items: [
      { path: '/users', label: 'Customers', adminOnly: true },
      { path: '/staff', label: 'Staff',     adminOnly: true },
    ],
  },
  {
    id: 'content', label: 'Content', icon: Icons.content,
    color: 'var(--color-epsilon)',
    items: [
      { path: '/blog',         label: 'Blog',              adminOnly: true },
      { path: '/shop-by-room', label: 'Shop By Room',      adminOnly: true },
      { path: '/promotions',   label: 'Promotions',        adminOnly: true },
      { path: '/backup',       label: 'Backup & Restore',  adminOnly: true },
    ],
  },
  {
    id: 'phase2', label: 'Phase 2 🚀', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
    color: '#9333ea',
    items: [
      { path: '/phase2',              label: 'Overview',          adminOnly: true },
      { path: '/phase2/coupons',      label: 'Coupons',           adminOnly: true },
      { path: '/phase2/reviews',      label: 'Reviews',           adminOnly: true },
      { path: '/phase2/loyalty',      label: 'Loyalty Program',   adminOnly: true },
      { path: '/phase2/email-campaigns', label: 'Email Campaigns', adminOnly: true },
      { path: '/phase2/analytics',    label: 'Analytics',         adminOnly: true },
    ],
  },
];

/* ─── Sidebar ─────────────────────────────────────────── */
const Sidebar = ({
  userRole, userName, onLogout,
}: { userRole: string; userName?: string; onLogout: () => void }) => {
  const location = useLocation();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Auto-expand the active group
  const activeGroup = NAV.find(g =>
    g.items.some(i => location.pathname === i.path || location.pathname.startsWith(i.path + '/'))
  );

  const effectiveExpanded = expandedGroup ?? activeGroup?.id ?? null;

  const filteredNav = NAV.map(g => ({
    ...g,
    items: g.items.filter(i => !i.adminOnly || userRole === 'admin'),
  })).filter(g => g.items.length > 0);

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">D</div>
        <div className="sidebar-logo-text">
          <span className="sidebar-brand">DravoHome</span>
          <span className="sidebar-brand-sub">Admin</span>
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="sidebar-nav">
        {filteredNav.map(group => {
          const isExpanded = effectiveExpanded === group.id;
          const isGroupActive = group.items.some(
            i => location.pathname === i.path || location.pathname.startsWith(i.path + '/')
          );

          return (
            <div key={group.id} className={`sidebar-group ${isGroupActive ? 'active' : ''}`}>
              {/* Group header — single item groups navigate directly */}
              {group.items.length === 1 ? (
                <Link
                  to={group.items[0].path}
                  className={`sidebar-group-header ${isGroupActive ? 'active' : ''}`}
                  style={{ '--group-color': group.color } as any}
                >
                  <span className="sidebar-group-icon" style={{ color: group.color }}>{group.icon}</span>
                  <span className="sidebar-group-label">{group.label}</span>
                  {isGroupActive && <span className="sidebar-group-dot" style={{ background: group.color }} />}
                </Link>
              ) : (
                <>
                  <button
                    className={`sidebar-group-header ${isGroupActive ? 'active' : ''}`}
                    style={{ '--group-color': group.color } as any}
                    onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                  >
                    <span className="sidebar-group-icon" style={{ color: group.color }}>{group.icon}</span>
                    <span className="sidebar-group-label">{group.label}</span>
                    <span className={`sidebar-chevron ${isExpanded ? 'open' : ''}`}>{Icons.chevron}</span>
                  </button>

                  {/* Sub-items */}
                  <div className={`sidebar-items ${isExpanded ? 'expanded' : ''}`}>
                    <div className="sidebar-items-inner">
                      {group.items.map(item => {
                        const isActive = location.pathname === item.path ||
                          (item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'));
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-item ${isActive ? 'active' : ''}`}
                            style={{ '--group-color': group.color } as any}
                          >
                            <span className="sidebar-item-dot" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </nav>

      {/* User section at bottom */}
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">{userName?.charAt(0).toUpperCase()}</div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">{userName}</span>
          <span className="sidebar-user-role">{userRole}</span>
        </div>
        <button className="sidebar-logout" onClick={onLogout} title="Logout">
          {Icons.logout}
        </button>
      </div>
    </aside>
  );
};

/* ─── Mobile Top Bar with Tabs + Subtabs ─────────────────────────────────────── */
const MobileTopBar = ({ userRole, userName }: { userRole: string; userName?: string }) => {
  const location = useLocation();

  const filteredNav = NAV.map(g => ({
    ...g,
    items: g.items.filter(i => !i.adminOnly || userRole === 'admin'),
  })).filter(g => g.items.length > 0);

  const activeGroup = filteredNav.find(g =>
    g.items.some(i => location.pathname === i.path || location.pathname.startsWith(i.path + '/'))
  );

  const activeSubItems = activeGroup?.items || [];

  return (
    <header className="mobile-topbar">
      {/* Logo + avatar row */}
      <div className="mobile-topbar-main">
        <div className="mobile-topbar-logo">
          <div className="sidebar-logo-mark" style={{ width: 28, height: 28, fontSize: 13 }}>D</div>
          <span className="sidebar-brand" style={{ fontSize: 'var(--text-base)' }}>DravoHome</span>
        </div>
        <div className="mobile-topbar-right">
          <div className="sidebar-user-avatar" style={{ width: 30, height: 30, fontSize: 12 }}>
            {userName?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Main tabs */}
      <div className="mobile-tabs">
        {filteredNav.map(group => {
          const isActive = activeGroup?.id === group.id;
          return (
            <Link
              key={group.id}
              to={group.items[0].path}
              className={`mobile-tab ${isActive ? 'active' : ''}`}
            >
              <span style={{ color: isActive ? group.color : undefined }}>{group.icon}</span>
              <span>{group.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Subtabs — only when active group has multiple items */}
      {activeSubItems.length > 1 && (
        <div className="mobile-subtabs">
          {activeSubItems.map(item => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-subtab ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};

/* ─── Admin Layout ─────────────────────────────────────── */
const AdminLayout = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="admin-layout">
      {/* Desktop sidebar */}
      <div className="admin-sidebar-wrap">
        <Sidebar userRole={user.role} userName={user.name} onLogout={handleLogout} />
      </div>

      {/* Mobile top bar with tabs + subtabs */}
      <MobileTopBar userRole={user.role} userName={user.name} />

      {/* Main content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
