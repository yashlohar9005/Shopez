import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const PaymentSuccess = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="container py-5 text-center" style={{ maxWidth: '600px' }}>
      <div className="card border-0 shadow-sm rounded-4 p-5">
        <div className="mb-4">
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
        </div>
        <h2 className="fw-bold mb-3">Payment Successful!</h2>
        <p className="text-muted mb-4">
          Thank you for your purchase. Your payment has been processed successfully and your order is now confirmed.
        </p>
        
        {orderId && (
          <div className="bg-light p-3 rounded-3 mb-4">
            <span className="text-muted small d-block mb-1">Order Reference ID</span>
            <span className="fw-bold fs-5 text-uppercase">{orderId.substring(0, 10)}</span>
          </div>
        )}

        <div className="d-grid gap-2 col-md-8 mx-auto">
          <Link to="/orders" className="btn btn-primary rounded-pill py-2">
            View My Orders
          </Link>
          <Link to="/" className="btn btn-outline-secondary rounded-pill py-2">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
