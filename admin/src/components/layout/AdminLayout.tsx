import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Header from './Header';
import Sidebar from './Sidebar';
import type { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="admin-layout">
      <Sidebar
        userRole={user.role}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />
      <div className="admin-content-wrapper">
        <Header
          userName={user.name}
          userRole={user.role}
          onMenuClick={toggleSidebar}
          onLogout={handleLogout}
        />
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
