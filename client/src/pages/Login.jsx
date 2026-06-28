import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const { login, error, loading, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to original requested page or home if already logged in
  const redirect = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated, navigate, redirect]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      await login(email, password);
      // Navigation is handled by the useEffect above upon state change
    } catch (err) {
      setLocalError(err || 'Failed to login');
    }
  };

  return (
    <div className="row justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card shadow-sm border-0 rounded-3">
          <div className="card-body p-5">
            <div className="text-center mb-4">
              <i className="bi bi-person-circle fs-1 text-primary"></i>
              <h2 className="fw-bold mt-2">Welcome Back</h2>
              <p className="text-muted">Sign in to continue to SHOPEZ</p>
            </div>

            {(error || localError) && (
              <div className="alert alert-danger py-2">{localError || error}</div>
            )}

            <form onSubmit={submitHandler}>
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

              <div className="mb-4">
                <label className="form-label text-muted small fw-bold">Password</label>
                <input
                  type="password"
                  className="form-control bg-light"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                Sign In
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="mb-0">
                New Customer?{' '}
                <Link to={redirect !== '/' ? `/register?redirect=${redirect}` : '/register'} className="text-decoration-none fw-bold">
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
