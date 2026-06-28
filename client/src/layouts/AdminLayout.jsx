import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/admin/AdminNavbar';
import AdminSidebar from '../components/admin/AdminSidebar';

/**
 * AdminLayout
 * Wraps admin pages with a distinct admin navbar and sidebar.
 */
const AdminLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar />
      
      <div className="container-fluid flex-grow-1 p-0">
        <div className="row g-0 h-100 min-vh-100">
          {/* Admin Sidebar */}
          <AdminSidebar />

          {/* Admin Main Content Wrapper */}
          <div className="col py-4 px-4 bg-light">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
