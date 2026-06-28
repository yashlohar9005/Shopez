import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';

/**
 * ProtectedRoute
 * Prevents non-authenticated users from accessing certain routes.
 * Redirects to /login and saves the intended destination.
 */
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  // If authenticated, render the child routes (Outlet)
  // If not, redirect to login, passing the current location in state
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default ProtectedRoute;
