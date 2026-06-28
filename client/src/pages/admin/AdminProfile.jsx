import React from 'react';
import useAuth from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const AdminProfile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="pb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0 text-dark">Admin Profile</h2>
          <p className="text-muted mb-0 small">Manage your account settings</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Profile Card */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-3 text-center h-100">
            <div className="card-body p-5">
              <div className="position-relative d-inline-block mb-4">
                <img 
                  src={user.avatar || 'https://via.placeholder.com/150'} 
                  alt={user.name} 
                  className="rounded-circle object-fit-cover shadow border border-3 border-white"
                  style={{ width: '120px', height: '120px' }}
                />
                <span className="position-absolute bottom-0 end-0 p-2 bg-success border border-light rounded-circle" title="Online">
                  <span className="visually-hidden">Online</span>
                </span>
              </div>
              
              <h4 className="fw-bold mb-1">{user.name}</h4>
              <p className="text-muted mb-3">{user.email}</p>
              
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-4 py-2 fs-6 mb-4">
                <i className="bi bi-shield-lock me-2"></i> System Administrator
              </span>

              <hr className="my-4" />
              
              <div className="d-flex justify-content-center gap-2">
                <Link to="/profile" className="btn btn-outline-primary shadow-sm w-100">
                  <i className="bi bi-gear me-2"></i> Account Settings
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-3 h-100">
            <div className="card-header bg-white border-bottom border-light py-3">
              <h6 className="mb-0 fw-bold">Admin Information</h6>
            </div>
            <div className="card-body p-4">
              <div className="alert alert-info border-0 shadow-sm mb-4 bg-info bg-opacity-10 d-flex align-items-center">
                <i className="bi bi-info-circle-fill text-info fs-4 me-3"></i>
                <div>
                  <h6 className="mb-1 text-dark fw-bold">Administrative Access Granted</h6>
                  <p className="mb-0 small text-muted">You have full access to the dashboard. Please handle user data and store settings responsibly.</p>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label text-muted small text-uppercase fw-bold">Full Name</label>
                  <div className="form-control bg-light border-0 fw-medium">{user.name}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small text-uppercase fw-bold">Email Address</label>
                  <div className="form-control bg-light border-0 fw-medium">{user.email}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small text-uppercase fw-bold">Role</label>
                  <div className="form-control bg-light border-0 fw-medium text-uppercase">{user.role}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small text-uppercase fw-bold">Joined On</label>
                  <div className="form-control bg-light border-0 fw-medium">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
