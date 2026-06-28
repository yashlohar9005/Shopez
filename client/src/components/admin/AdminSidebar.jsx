import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();
  const path = location.pathname;

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'bi-speedometer2' },
    { name: 'Analytics', path: '/admin/analytics', icon: 'bi-graph-up' },
    { name: 'Orders', path: '/admin/orders', icon: 'bi-receipt' },
    { name: 'Transactions', path: '/admin/transactions', icon: 'bi-credit-card' },
    { name: 'Products', path: '/admin/products', icon: 'bi-box' },
    { name: 'Inventory', path: '/admin/inventory', icon: 'bi-boxes' },
    { name: 'Categories', path: '/admin/categories', icon: 'bi-tags' },
    { name: 'Users', path: '/admin/users', icon: 'bi-people' },
    { name: 'Reviews', path: '/admin/reviews', icon: 'bi-star' },
    { name: 'Coupons', path: '/admin/coupons', icon: 'bi-ticket-perforated' },
    { name: 'Notifications', path: '/admin/notifications', icon: 'bi-bell' },
  ];

  return (
    <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark text-white shadow min-vh-100">
      <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-4 position-sticky top-0 h-100">
        <div className="text-muted small text-uppercase fw-bold mb-3 d-none d-sm-block">
          Admin Menu
        </div>
        
        <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start w-100" id="menu">
          {menuItems.map((item) => {
            // Special check for products to highlight on child routes as well
            const isActive = item.name === 'Products' 
              ? path.includes('/admin/products') || path.includes('/admin/product/') 
              : path.includes(item.path);

            return (
              <li className="nav-item w-100 mb-2" key={item.name}>
                <Link 
                  to={item.path} 
                  className={`nav-link text-white w-100 ${isActive ? 'bg-primary' : 'hover-bg-secondary'}`}
                  style={isActive ? { background: 'var(--gradient-primary)', border: 'none' } : { transition: 'all 0.2s' }}
                >
                  <i className={`bi ${item.icon} fs-5 me-2`}></i> 
                  <span className="d-none d-sm-inline">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        
        <div className="w-100 mt-auto pb-4 pt-3 border-top border-secondary">
          <Link 
            to="/admin/profile" 
            className={`nav-link text-white w-100 ${path === '/admin/profile' ? 'bg-primary' : 'hover-bg-secondary'}`}
            style={path === '/admin/profile' ? { background: 'var(--gradient-primary)', border: 'none' } : {}}
          >
            <i className="bi bi-person-gear fs-5 me-2"></i> 
            <span className="d-none d-sm-inline">Admin Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
