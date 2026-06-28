import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/**
 * MainLayout
 * Wraps public and user-facing pages with the Navbar and Footer.
 * The <Outlet /> renders the nested child route components.
 */
const MainLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />
      
      {/* Main content wrapper */}
      <main className="flex-grow-1 py-4">
        <div className="container">
          {/* This is where the child route components will be injected */}
          <Outlet />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;
