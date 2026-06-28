import React from 'react';
import { Link } from 'react-router-dom';
import PaymentButton from './PaymentButton';

const OrderCard = ({ order }) => {
  const orderItems = order.items || order.orderItems || [];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Processing': return 'bg-warning text-dark';
      case 'Shipped': return 'bg-info text-dark';
      case 'Delivered': return 'bg-success';
      case 'Cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const formattedTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(order.totalPrice);

  return (
    <div className="card shadow-sm mb-4 border-0 rounded-3">
      <div className="card-header bg-light border-bottom-0 pt-3 pb-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center">
        <div>
          <span className="text-muted small d-block">Order ID</span>
          <span className="fw-bold">#{order._id.substring(0, 8).toUpperCase()}</span>
        </div>
        <div className="mt-2 mt-md-0 text-md-center">
          <span className="text-muted small d-block">Date Placed</span>
          <span className="fw-bold">{formattedDate}</span>
        </div>
        <div className="mt-2 mt-md-0 text-md-center">
          <span className="text-muted small d-block">Total Amount</span>
          <span className="fw-bold text-primary">{formattedTotal}</span>
        </div>
        <div className="mt-2 mt-md-0 text-md-end">
          <span className={`badge ${getStatusColor(order.orderStatus)} p-2`}>
            {order.orderStatus}
          </span>
        </div>
      </div>
      
      <div className="card-body">
        <h6 className="card-title fw-bold mb-3">Items ({orderItems.length})</h6>
        <div className="row g-3">
          {/* Show up to 3 items as preview */}
          {orderItems.slice(0, 3).map((item) => (
            <div className="col-12 col-md-6" key={item._id || Math.random()}>
              <div className="d-flex align-items-center">
                <img 
                  src={item.image || 'https://via.placeholder.com/50'} 
                  alt={item.name} 
                  className="rounded object-fit-cover me-3"
                  style={{ width: '50px', height: '50px' }}
                />
                <div>
                  <div className="fw-bold text-truncate" style={{ maxWidth: '200px' }} title={item.name}>
                    {item.name}
                  </div>
                  <div className="text-muted small">Qty: {item.quantity}</div>
                </div>
              </div>
            </div>
          ))}
          {orderItems.length > 3 && (
            <div className="col-12 text-muted small d-flex align-items-center">
              + {orderItems.length - 3} more item(s)
            </div>
          )}
        </div>
      </div>
      
      <div className="card-footer bg-white border-top-0 pb-3 d-flex justify-content-between align-items-center">
        <div>
          {order.paymentMethod === 'Razorpay' && order.paymentStatus === 'pending' && (
            <PaymentButton 
              order={order} 
              onSuccess={() => window.location.reload()} 
            />
          )}
          {order.paymentMethod === 'Razorpay' && order.paymentStatus === 'paid' && (
            <span className="badge bg-success py-2 px-3"><i className="bi bi-check-circle me-1"></i> Paid Online</span>
          )}
          {order.paymentMethod === 'COD' && (
            <span className="badge bg-secondary py-2 px-3"><i className="bi bi-cash-coin me-1"></i> Cash on Delivery</span>
          )}
        </div>
        <Link to={`/order/${order._id}`} className="btn btn-outline-primary btn-sm rounded-pill px-3">
          View Order Details
        </Link>
      </div>
    </div>
  );
};

export default OrderCard;
