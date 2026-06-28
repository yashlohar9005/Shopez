import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import useCart from '../hooks/useCart';
import SearchBar from './SearchBar';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useContext(AuthContext);
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm" style={{ zIndex: 1030 }}>
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand fw-bold fs-4 text-primary" to="/">
          <i className="bi bi-cart3 me-2"></i>SHOPEZ
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Content */}
        <div className="collapse navbar-collapse" id="navbarContent">
          {/* Search Bar - Center */}
          <div className="mx-auto my-3 my-lg-0 w-100" style={{ maxWidth: '500px' }}>
            <SearchBar />
          </div>

          {/* Right Links */}
          <ul className="navbar-nav ms-auto align-items-center">
            {/* Products Link */}
            <li className="nav-item">
              <Link className="nav-link px-3" to="/products">
                Products
              </Link>
            </li>

            {/* Cart Link */}
            <li className="nav-item">
              <Link className="nav-link px-3 position-relative" to="/cart">
                <i className="bi bi-cart fs-5"></i>
                <span className="position-absolute top-10 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                  {itemCount}
                </span>
              </Link>
            </li>

            {/* Auth Links */}
            {isAuthenticated ? (
              <li className="nav-item dropdown ms-lg-2" ref={dropdownRef}>
                <button
                  className="nav-link btn btn-link d-flex align-items-center border-0 text-white-50 shadow-none py-1"
                  onClick={toggleDropdown}
                  style={{ background: 'none', textDecoration: 'none', cursor: 'pointer' }}
                >
                  <img 
                    src={user?.avatar || 'https://via.placeholder.com/30'} 
                    alt="avatar" 
                    className="rounded-circle me-2 object-fit-cover" 
                    width="30" 
                    height="30" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/30';
                    }}
                  />
                  <span className="text-light me-1">{user?.name?.split(' ')[0] || 'User'}</span>
                  <i className={`bi bi-chevron-${dropdownOpen ? 'up' : 'down'} small text-white-50`}></i>
                </button>
                {dropdownOpen && (
                  <ul
                    className="dropdown-menu dropdown-menu-end shadow border-0 show"
                    style={{ position: 'absolute', right: 0, top: '100%', minWidth: '200px' }}
                  >
                    <li>
                      <Link className="dropdown-item py-2" to="/profile" onClick={() => setDropdownOpen(false)}>
                        <i className="bi bi-person me-2"></i>My Account
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item py-2" to="/cart" onClick={() => setDropdownOpen(false)}>
                        <i className="bi bi-cart me-2"></i>My Cart
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item py-2" to="/orders" onClick={() => setDropdownOpen(false)}>
                        <i className="bi bi-box-seam me-2"></i>My Orders
                      </Link>
                    </li>
                    
                    {isAdmin && (
                      <>
                        <li><hr className="dropdown-divider" /></li>
                        <li><h6 className="dropdown-header">Admin Portal</h6></li>
                        <li>
                          <Link className="dropdown-item py-2" to="/admin/dashboard" onClick={() => setDropdownOpen(false)}>
                            <i className="bi bi-speedometer2 me-2"></i>Dashboard
                          </Link>
                        </li>
                      </>
                    )}
                    
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger py-2" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i>Logout
                      </button>
                    </li>
                  </ul>
                )}
              </li>
            ) : (
              <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                <Link className="btn btn-primary px-4 rounded-pill" to="/login">
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
