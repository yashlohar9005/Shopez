import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import adminService from '../../services/adminService';

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const data = await adminService.getUnreadNotificationCount();
        setUnreadCount(data.count || 0);
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
    };
    
    // Initial fetch
    fetchUnreadCount();
    
    // Polling could be added here, but for now we just fetch on mount
    // const interval = setInterval(fetchUnreadCount, 60000); // 1 minute
    // return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm border-bottom border-secondary">
      <div className="container-fluid px-4">
        <Link className="navbar-brand fw-bold text-gradient d-flex align-items-center" to="/admin/dashboard" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          <i className="bi bi-shield-lock me-2 text-primary"></i>
          SHOPEZ ADMIN
        </Link>
        
        <div className="d-flex align-items-center gap-3">
          {/* Notifications */}
          <Link to="/admin/notifications" className="position-relative text-white text-decoration-none">
            <i className="bi bi-bell fs-5"></i>
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                {unreadCount > 99 ? '99+' : unreadCount}
                <span className="visually-hidden">unread messages</span>
              </span>
            )}
          </Link>

          {/* User Profile */}
          <div className="dropdown">
            <button className="btn btn-link text-white text-decoration-none dropdown-toggle d-flex align-items-center gap-2" type="button" id="adminDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              {user?.avatar ? (
                <img src={user.avatar} alt="Admin" className="rounded-circle object-fit-cover" width="32" height="32" />
              ) : (
                <i className="bi bi-person-circle fs-4"></i>
              )}
              <span className="d-none d-md-inline fw-medium">{user?.name}</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0" aria-labelledby="adminDropdown">
              <li>
                <Link className="dropdown-item py-2" to="/admin/profile">
                  <i className="bi bi-person me-2 text-muted"></i> My Profile
                </Link>
              </li>
              <li>
                <Link className="dropdown-item py-2" to="/">
                  <i className="bi bi-shop me-2 text-muted"></i> View Store
                </Link>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item text-danger py-2" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
