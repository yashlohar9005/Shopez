import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const PaymentFailure = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;
  const errorMsg = location.state?.error || 'Your payment could not be processed at this time.';

  return (
    <div className="container py-5 text-center" style={{ maxWidth: '600px' }}>
      <div className="card border-0 shadow-sm rounded-4 p-5">
        <div className="mb-4">
          <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '5rem' }}></i>
        </div>
        <h2 className="fw-bold mb-3">Payment Failed</h2>
        <p className="text-muted mb-4">{errorMsg}</p>
        
        {orderId && (
          <div className="bg-light p-3 rounded-3 mb-4">
            <span className="text-muted small d-block mb-1">Order Reference ID</span>
            <span className="fw-bold fs-5 text-uppercase">{orderId.substring(0, 10)}</span>
            <p className="small text-muted mt-2 mb-0">You can retry payment from your orders page.</p>
          </div>
        )}

        <div className="d-grid gap-2 col-md-8 mx-auto">
          <Link to="/orders" className="btn btn-primary rounded-pill py-2">
            Go to Orders to Retry
          </Link>
          <Link to="/cart" className="btn btn-outline-secondary rounded-pill py-2">
            Return to Cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
