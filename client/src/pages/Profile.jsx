import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import ProfileForm from '../components/ProfileForm';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">My Account</h2>

      <div className="row g-4">
        {/* Profile Sidebar */}
        <div className="col-lg-4">
          {/* Profile Card */}
          <div className="card shadow-sm border-0 rounded-3 text-center mb-4">
            <div className="card-body p-4">
              <img 
                src={user.avatar || 'https://via.placeholder.com/150'} 
                alt="Profile" 
                className="rounded-circle img-thumbnail mb-3"
                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150';
                }}
              />
              <h4 className="fw-bold mb-1">{user.name}</h4>
              <p className="text-muted mb-3">{user.email}</p>
              
              <div className="d-flex justify-content-center align-items-center mb-3">
                <span className="badge bg-primary px-3 py-2 rounded-pill text-uppercase">
                  {user.role}
                </span>
              </div>
              
              <hr />
              
              <div className="text-muted small">
                <i className="bi bi-calendar3 me-1"></i> Member since {joinedDate}
              </div>
            </div>
          </div>

          {/* Account Info Card */}
          <div className="card shadow-sm border-0 rounded-3 mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="mb-0 fw-bold"><i className="bi bi-info-circle me-2"></i>Account Information</h6>
            </div>
            <div className="card-body p-3">
              <ul className="list-unstyled mb-0">
                <li className="d-flex align-items-center py-2 border-bottom">
                  <i className="bi bi-person-fill text-primary me-3"></i>
                  <div>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>Full Name</div>
                    <div className="small fw-bold">{user.name}</div>
                  </div>
                </li>
                <li className="d-flex align-items-center py-2 border-bottom">
                  <i className="bi bi-envelope-fill text-primary me-3"></i>
                  <div>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>Email</div>
                    <div className="small fw-bold">{user.email}</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="mb-0 fw-bold"><i className="bi bi-link-45deg me-2"></i>Quick Links</h6>
            </div>
            <div className="list-group list-group-flush">
              <Link to="/orders" className="list-group-item list-group-item-action d-flex align-items-center py-3">
                <i className="bi bi-box-seam text-primary me-3"></i>
                <div>
                  <div className="small fw-bold">My Orders</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>Track & manage your orders</div>
                </div>
                <i className="bi bi-chevron-right ms-auto text-muted"></i>
              </Link>
              <Link to="/cart" className="list-group-item list-group-item-action d-flex align-items-center py-3">
                <i className="bi bi-cart text-primary me-3"></i>
                <div>
                  <div className="small fw-bold">Shopping Cart</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>View items in your cart</div>
                </div>
                <i className="bi bi-chevron-right ms-auto text-muted"></i>
              </Link>
              <Link to="/products" className="list-group-item list-group-item-action d-flex align-items-center py-3">
                <i className="bi bi-grid text-primary me-3"></i>
                <div>
                  <div className="small fw-bold">Browse Products</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>Explore our catalog</div>
                </div>
                <i className="bi bi-chevron-right ms-auto text-muted"></i>
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="col-lg-8">
          <ProfileForm />
        </div>
      </div>
    </div>
  );
};

export default Profile;
