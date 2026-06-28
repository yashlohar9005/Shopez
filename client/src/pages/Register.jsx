import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const { register, error, loading, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated, navigate, redirect]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      await register({ name, email, password });
      // Navigation handled by useEffect
    } catch (err) {
      // Error handled by Context and displayed below
    }
  };

  return (
    <div className="row justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <div className="col-12 col-md-6 col-lg-5">
        <div className="card shadow-sm border-0 rounded-3">
          <div className="card-body p-5">
            <div className="text-center mb-4">
              <i className="bi bi-person-plus fs-1 text-primary"></i>
              <h2 className="fw-bold mt-2">Create Account</h2>
              <p className="text-muted">Join SHOPEZ today for premium shopping</p>
            </div>

            {message && <div className="alert alert-danger py-2">{message}</div>}
            {error && <div className="alert alert-danger py-2">{error}</div>}

            <form onSubmit={submitHandler}>
              <div className="mb-3">
                <label className="form-label text-muted small fw-bold">Full Name</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  placeholder="Enter name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-bold">Email Address</label>
                <input
                  type="email"
                  className="form-control bg-light"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-bold">Password</label>
                <input
                  type="password"
                  className="form-control bg-light"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-muted small fw-bold">Confirm Password</label>
                <input
                  type="password"
                  className="form-control bg-light"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-100 py-2 rounded-pill fw-bold"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : null}
                Register
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="mb-0">
                Already have an account?{' '}
                <Link to={redirect !== '/' ? `/login?redirect=${redirect}` : '/login'} className="text-decoration-none fw-bold">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
