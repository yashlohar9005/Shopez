import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const CustomerLayout = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Sidebar */}
        <div className="col-lg-3">
          <div className="card shadow-sm border-0 rounded-3 mb-4 sticky-top" style={{ top: '100px', zIndex: 1010 }}>
            <div className="card-body p-4 text-center border-bottom">
              <img 
                src={user.avatar || 'https://via.placeholder.com/150'} 
                alt="Profile" 
                className="rounded-circle img-thumbnail mb-3 mx-auto d-block"
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              />
              <h5 className="fw-bold mb-1">{user.name}</h5>
              <p className="text-muted small mb-0">{user.email}</p>
            </div>
            
            <div className="list-group list-group-flush">
              <NavLink 
                to="/account/dashboard" 
                className={({ isActive }) => `list-group-item list-group-item-action border-0 py-3 d-flex align-items-center ${isActive ? 'active bg-primary text-white fw-bold' : 'text-dark'}`}
              >
                <i className="bi bi-speedometer2 me-3 fs-5"></i> Dashboard
              </NavLink>
              
              <NavLink 
                to="/account/orders" 
                className={({ isActive }) => `list-group-item list-group-item-action border-0 py-3 d-flex align-items-center ${isActive ? 'active bg-primary text-white fw-bold' : 'text-dark'}`}
              >
                <i className="bi bi-box-seam me-3 fs-5"></i> Order History
              </NavLink>

              <NavLink 
                to="/account/wishlist" 
                className={({ isActive }) => `list-group-item list-group-item-action border-0 py-3 d-flex align-items-center ${isActive ? 'active bg-primary text-white fw-bold' : 'text-dark'}`}
              >
                <i className="bi bi-heart me-3 fs-5"></i> Wishlist
              </NavLink>

              <NavLink 
                to="/account/analytics" 
                className={({ isActive }) => `list-group-item list-group-item-action border-0 py-3 d-flex align-items-center ${isActive ? 'active bg-primary text-white fw-bold' : 'text-dark'}`}
              >
                <i className="bi bi-graph-up me-3 fs-5"></i> Purchase Analytics
              </NavLink>

              <NavLink 
                to="/account/transactions" 
                className={({ isActive }) => `list-group-item list-group-item-action border-0 py-3 d-flex align-items-center ${isActive ? 'active bg-primary text-white fw-bold' : 'text-dark'}`}
              >
                <i className="bi bi-wallet2 me-3 fs-5"></i> Transactions
              </NavLink>

              <NavLink 
                to="/account/addresses" 
                className={({ isActive }) => `list-group-item list-group-item-action border-0 py-3 d-flex align-items-center ${isActive ? 'active bg-primary text-white fw-bold' : 'text-dark'}`}
              >
                <i className="bi bi-geo-alt me-3 fs-5"></i> Saved Addresses
              </NavLink>

              <NavLink 
                to="/account/settings" 
                className={({ isActive }) => `list-group-item list-group-item-action border-0 py-3 d-flex align-items-center ${isActive ? 'active bg-primary text-white fw-bold' : 'text-dark'}`}
              >
                <i className="bi bi-gear me-3 fs-5"></i> Profile Settings
              </NavLink>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-lg-9">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;
