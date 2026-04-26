import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import TopNavigation from './TopNavigation';
import type { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import './AdminLayout.css';

const AdminLayout = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!user) {
    return null;
  }

  return (
    <div className="admin-layout admin-layout--top-nav">
      <TopNavigation
        userRole={user.role}
        userName={user.name}
        onLogout={handleLogout}
      />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
