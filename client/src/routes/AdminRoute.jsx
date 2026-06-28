import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';

/**
 * AdminRoute
 * Prevents non-admin users from accessing admin routes.
 * Redirects to home if user is logged in but not an admin.
 */
const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useContext(AuthContext);

  if (loading) {
    return <Loader />;
  }

  // Check both authentication and admin role
  if (isAuthenticated && isAdmin) {
    return <Outlet />;
  }

  // If not logged in, they hit the login page (handled by AppRoutes ordering usually, 
  // but safe to redirect to login). If logged in but not admin, redirect to home.
  return <Navigate to={isAuthenticated ? '/' : '/login'} replace />;
};

export default AdminRoute;
