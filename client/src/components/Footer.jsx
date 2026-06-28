import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto" style={{ background: 'linear-gradient(180deg, #1a1d23 0%, #0d0f12 100%)' }}>
      {/* Top CTA Banner */}
      <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)' }}>
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-md-8 text-white mb-3 mb-md-0">
              <h5 className="fw-bold mb-1">
                <i className="bi bi-lightning-charge-fill me-2"></i>
                Subscribe & Get 15% Off Your First Order!
              </h5>
              <p className="mb-0 opacity-75 small">Join 50,000+ shoppers getting exclusive deals straight to their inbox.</p>
            </div>
            <div className="col-md-4">
              <form className="d-flex" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  className="form-control rounded-start-pill border-0 py-2"
                  placeholder="Enter your email"
                  style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
                />
                <button className="btn btn-dark rounded-end-pill px-4 fw-bold" type="submit">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container pt-5 pb-4">
        <div className="row g-4">
          {/* Brand & About */}
          <div className="col-lg-4 col-md-6">
            <Link to="/" className="text-decoration-none d-inline-block mb-3">
              <h4 className="fw-bold mb-0" style={{ color: '#818cf8' }}>
                <i className="bi bi-cart3 me-2"></i>SHOPEZ
              </h4>
            </Link>
            <p className="text-secondary small lh-lg mb-3">
              Your premium destination for the latest products. We offer high-quality items with lightning-fast delivery, secure payments, and hassle-free returns.
            </p>

            {/* Social Links */}
            <div className="d-flex gap-2">
              {[
                { icon: 'bi-facebook', color: '#1877f2', label: 'Facebook' },
                { icon: 'bi-twitter-x', color: '#1da1f2', label: 'Twitter' },
                { icon: 'bi-instagram', color: '#e4405f', label: 'Instagram' },
                { icon: 'bi-youtube', color: '#ff0000', label: 'YouTube' },
                { icon: 'bi-linkedin', color: '#0a66c2', label: 'LinkedIn' },
              ].map(({ icon, color, label }) => (
                <a
                  key={label}
                  href="#"
                  className="d-flex align-items-center justify-content-center rounded-circle text-white text-decoration-none"
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    transition: 'all 0.3s ease',
                  }}
                  title={label}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = color; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <i className={`bi ${icon}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white fw-bold mb-3 text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
              Shop
            </h6>
            <ul className="list-unstyled">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'All Products' },
                { to: '/cart', label: 'Shopping Cart' },
                { to: '/orders', label: 'Track Order' },
              ].map(({ to, label }) => (
                <li key={to} className="mb-2">
                  <Link
                    to={to}
                    className="text-secondary text-decoration-none small"
                    style={{ transition: 'color 0.2s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#a5b4fc'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white fw-bold mb-3 text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
              Support
            </h6>
            <ul className="list-unstyled">
              {[
                { to: '/profile', label: 'My Account' },
                { to: '/orders', label: 'Order History' },
                { to: '#', label: 'FAQ' },
                { to: '/return-policy', label: 'Return Policy' },
                { to: '/privacy-policy', label: 'Privacy Policy' },
              ].map(({ to, label }) => (
                <li key={label} className="mb-2">
                  <Link
                    to={to}
                    className="text-secondary text-decoration-none small"
                    style={{ transition: 'color 0.2s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#a5b4fc'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-lg-4 col-md-6">
            <h6 className="text-white fw-bold mb-3 text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
              Contact Us
            </h6>
            <ul className="list-unstyled">
              <li className="d-flex align-items-start mb-3">
                <i className="bi bi-geo-alt-fill me-3 mt-1" style={{ color: '#818cf8' }}></i>
                <span className="text-secondary small">123 Commerce Street, MG Road, Mumbai, Maharashtra 400001, India</span>
              </li>
              <li className="d-flex align-items-center mb-3">
                <i className="bi bi-telephone-fill me-3" style={{ color: '#818cf8' }}></i>
                <span className="text-secondary small">+91 98765 43210</span>
              </li>
              <li className="d-flex align-items-center mb-3">
                <i className="bi bi-envelope-fill me-3" style={{ color: '#818cf8' }}></i>
                <span className="text-secondary small">support@shopez.in</span>
              </li>
              <li className="d-flex align-items-center">
                <i className="bi bi-clock-fill me-3" style={{ color: '#818cf8' }}></i>
                <span className="text-secondary small">Mon – Sat: 9:00 AM – 9:00 PM IST</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="row mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="col-12">
            <div className="d-flex flex-wrap justify-content-center gap-4">
              {[
                { icon: 'bi-truck', text: 'Free Shipping over ₹500' },
                { icon: 'bi-shield-lock-fill', text: '100% Secure Payments' },
                { icon: 'bi-arrow-repeat', text: '7 Day Easy Returns' },
                { icon: 'bi-headset', text: '24/7 Customer Support' },
              ].map(({ icon, text }) => (
                <div key={text} className="d-flex align-items-center">
                  <i className={`bi ${icon} me-2 fs-5`} style={{ color: '#818cf8' }}></i>
                  <span className="text-secondary small">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="row mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="col-md-6 mb-3 mb-md-0">
            <p className="text-secondary small mb-0">
              © {currentYear} <span style={{ color: '#818cf8' }}>SHOPEZ</span>. All Rights Reserved. Made with <i className="bi bi-heart-fill text-danger"></i> in India
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <div className="d-flex justify-content-md-end justify-content-start gap-3 align-items-center">
              <span className="text-secondary small">We accept:</span>
              <div className="d-flex gap-2">
                {['bi-credit-card-fill', 'bi-credit-card-2-front-fill', 'bi-phone-fill', 'bi-bank'].map((icon, i) => (
                  <span
                    key={i}
                    className="d-flex align-items-center justify-content-center rounded"
                    style={{
                      width: '36px',
                      height: '24px',
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      fontSize: '0.85rem',
                      color: '#9ca3af',
                    }}
                  >
                    <i className={`bi ${icon}`}></i>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
