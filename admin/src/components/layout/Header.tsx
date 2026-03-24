import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  userName: string;
  userRole: 'admin' | 'staff';
  onMenuClick: () => void;
  onLogout: () => void;
}

const Header = ({ userName, userRole, onMenuClick, onLogout }: HeaderProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowUserMenu(false);
    onLogout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={onMenuClick}>
          ☰
        </button>
        <h1 className="header-title">Admin Panel</h1>
      </div>
      <div className="header-right">
        <div className="user-menu-container">
          <button
            className="user-menu-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <span className="user-avatar">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </span>
            <span className="user-name">{userName || 'User'}</span>
            <span className="user-role-badge">{userRole}</span>
          </button>
          {showUserMenu && (
            <div className="user-menu-dropdown">
              <div className="user-menu-header">
                <div className="user-menu-name">{userName}</div>
                <div className="user-menu-role">{userRole}</div>
              </div>
              <button className="user-menu-item" onClick={handleLogout}>
                <span>🚪</span> Logout
              </button>
            </div>
          )}
        </div>
      </div>
      {showUserMenu && (
        <div
          className="user-menu-overlay"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;
