import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';

const ProfileForm = () => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        name,
        email,
      };
      if (password) {
        userData.password = password;
      }
      
      await updateProfile(userData);
      setMessage('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');

      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 rounded-3">
      <div className="card-body p-4 p-md-5">
        <h4 className="fw-bold mb-1">Edit Profile</h4>
        <p className="text-muted small mb-4">Update your personal information and password</p>
        
        {message && (
          <div className="alert alert-success d-flex align-items-center" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>{message}
          </div>
        )}
        {error && (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
          </div>
        )}

        <form onSubmit={submitHandler}>
          {/* Personal Information */}
          <h6 className="fw-bold text-primary mb-3">
            <i className="bi bi-person me-2"></i>Personal Information
          </h6>
          
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label text-muted small fw-bold">Full Name</label>
              <input
                type="text"
                className="form-control bg-light"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small fw-bold">Email Address</label>
              <input
                type="email"
                className="form-control bg-light"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Change Password */}
          <hr className="my-4" />
          <h6 className="fw-bold text-primary mb-3">
            <i className="bi bi-lock me-2"></i>Change Password
          </h6>
          <p className="text-muted small mb-3">Leave blank if you don't want to change your password.</p>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label text-muted small fw-bold">New Password</label>
              <input
                type="password"
                className="form-control bg-light"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small fw-bold">Confirm New Password</label>
              <input
                type="password"
                className="form-control bg-light"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className="btn btn-primary px-5 py-2 rounded-pill fw-bold"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : (
                <i className="bi bi-check2-circle me-2"></i>
              )}
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
