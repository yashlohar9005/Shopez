import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import orderService from '../services/orderService';
import Loader from '../components/Loader';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderById(id);
      setOrder(data);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      setActionLoading(true);
      try {
        await orderService.cancelOrder(id);
        await fetchOrder(); // Refresh order details
      } catch (err) {
        alert(err?.response?.data?.message || 'Failed to cancel order');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleReturnOrder = async () => {
    if (window.confirm('Are you sure you want to return this order?')) {
      setActionLoading(true);
      try {
        await orderService.returnOrder(id);
        await fetchOrder(); // Refresh order details
      } catch (err) {
        alert(err?.response?.data?.message || 'Failed to request return');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleDownloadInvoice = () => {
    // In a real app, this would hit an API to generate a PDF.
    // For now, we route to a dedicated Invoice page view to print.
    window.open(`/invoice/${order._id}`, '_blank');
  };

  if (loading) return <Loader />;
  if (error) return <div className="alert alert-danger m-5">{error}</div>;
  if (!order) return <div className="alert alert-info m-5">Order not found</div>;

  const formatPrice = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    }) : '—';

  const statusBadge = (status) => {
    const colors = {
      processing: 'bg-warning text-dark',
      shipped: 'bg-info text-white',
      delivered: 'bg-success',
      cancelled: 'bg-danger',
    };
    return <span className={`badge ${colors[status] || 'bg-secondary'}`}>{status}</span>;
  };

  const paymentBadge = (status) => {
    const colors = {
      pending: 'bg-warning text-dark',
      success: 'bg-success',
      paid: 'bg-success',
      failed: 'bg-danger',
      refunded: 'bg-info',
    };
    return <span className={`badge ${colors[status] || 'bg-secondary'}`}>{status}</span>;
  };

  const canCancel = ['pending', 'confirmed', 'processing'].includes(order.orderStatus);
  const canReturn = order.orderStatus === 'delivered';

  const timelineSteps = [
    { label: 'Placed', date: order.createdAt, active: true },
    { label: 'Confirmed', date: order.confirmedAt, active: !!order.confirmedAt },
    { label: 'Processing', date: order.orderStatus === 'processing' ? new Date() : null, active: ['processing', 'shipped', 'out_for_delivery', 'delivered'].includes(order.orderStatus) },
    { label: 'Shipped', date: order.shippedAt, active: !!order.shippedAt },
    { label: 'Out for Delivery', date: order.orderStatus === 'out_for_delivery' ? new Date() : null, active: ['out_for_delivery', 'delivered'].includes(order.orderStatus) },
    { label: 'Delivered', date: order.deliveredAt, active: !!order.deliveredAt },
  ];

  return (
    <div className="container py-4">
      <Link to="/orders" className="btn btn-light mb-4">
        <i className="bi bi-arrow-left"></i> Back to Orders
      </Link>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Order Details</h2>
        <div>
          {canCancel && (
            <button className="btn btn-outline-danger me-2" onClick={handleCancelOrder} disabled={actionLoading}>
              {actionLoading ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
          {canReturn && (
            <button className="btn btn-outline-warning me-2" onClick={handleReturnOrder} disabled={actionLoading}>
              {actionLoading ? 'Requesting...' : 'Request Return'}
            </button>
          )}
          <button className="btn btn-outline-primary" onClick={handleDownloadInvoice}>
            <i className="bi bi-file-earmark-pdf me-2"></i>Download Invoice
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column - Order Info */}
        <div className="col-lg-8">
          
          {/* Timeline */}
          {['cancelled', 'returned', 'refunded'].includes(order.orderStatus) ? (
            <div className={`alert ${order.orderStatus === 'cancelled' ? 'alert-danger' : 'alert-warning'} mb-4`}>
              <h5 className="fw-bold mb-1">
                Order {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
              </h5>
              <p className="mb-0">
                This order was {order.orderStatus} on {formatDate(order.cancelledAt || order.returnedAt || order.refundedAt || new Date())}.
              </p>
            </div>
          ) : (
            <div className="card border-0 shadow-sm rounded-3 mb-4">
              <div className="card-body p-4">
                <div className="position-relative m-4">
                  <div className="progress" style={{ height: '2px' }}>
                    <div className="progress-bar bg-success" role="progressbar" style={{ width: `${(timelineSteps.filter(s => s.active).length - 1) / (timelineSteps.length - 1) * 100}%` }}></div>
                  </div>
                  {timelineSteps.map((step, idx) => (
                    <div key={idx} className="position-absolute top-0 translate-middle d-flex flex-column align-items-center" style={{ left: `${(idx / (timelineSteps.length - 1)) * 100}%` }}>
                      <div className={`rounded-circle d-flex align-items-center justify-content-center ${step.active ? 'bg-success text-white' : 'bg-secondary text-white'}`} style={{ width: '30px', height: '30px', marginTop: '-14px' }}>
                        {step.active ? <i className="bi bi-check"></i> : <span className="small">{idx + 1}</span>}
                      </div>
                      <div className="mt-2 text-center" style={{ minWidth: '80px' }}>
                        <div className={`small fw-bold ${step.active ? 'text-success' : 'text-muted'}`}>{step.label}</div>
                        {step.date && <div className="text-muted" style={{ fontSize: '0.7rem' }}>{formatDate(step.date)}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Order Header */}
          <div className="card border-0 shadow-sm rounded-3 mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-sm-4 mb-3 mb-sm-0">
                  <div className="text-muted small">Order ID</div>
                  <div className="fw-bold">#{order._id.slice(-8).toUpperCase()}</div>
                </div>
                <div className="col-sm-4 mb-3 mb-sm-0">
                  <div className="text-muted small">Date Placed</div>
                  <div className="fw-bold">{formatDate(order.createdAt)}</div>
                </div>
                <div className="col-sm-4">
                  <div className="text-muted small">Status</div>
                  <div>{statusBadge(order.orderStatus)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="card border-0 shadow-sm rounded-3 mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold">Items ({order.items?.length || 0})</h5>
            </div>
            <div className="card-body p-0">
              {order.items?.map((item, idx) => (
                <div key={idx} className="d-flex align-items-center p-3 border-bottom">
                  <img
                    src={item.image || 'https://placehold.co/60x60/EEEEEE/31343C?text=No+Image'}
                    alt={item.name}
                    className="rounded object-fit-cover me-3"
                    style={{ width: '60px', height: '60px' }}
                  />
                  <div className="flex-grow-1">
                    <Link to={`/product/${item.product}`} className="text-decoration-none text-dark fw-bold">
                      {item.name}
                    </Link>
                    <div className="text-muted small">
                      {formatPrice(item.price)} × {item.quantity}
                    </div>
                  </div>
                  <div className="fw-bold">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Addresses */}
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm rounded-3 h-100">
                <div className="card-header bg-white border-bottom py-3">
                  <h5 className="mb-0 fw-bold">Shipping Address</h5>
                </div>
                <div className="card-body">
                  <p className="mb-1">{order.shippingAddress?.street}</p>
                  <p className="mb-1">
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                  </p>
                  <p className="mb-0">{order.shippingAddress?.country}</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm rounded-3 h-100">
                <div className="card-header bg-white border-bottom py-3">
                  <h5 className="mb-0 fw-bold">Billing Address</h5>
                </div>
                <div className="card-body">
                  <p className="mb-1">{order.billingAddress?.street || order.shippingAddress?.street}</p>
                  <p className="mb-1">
                    {order.billingAddress?.city || order.shippingAddress?.city}, {order.billingAddress?.state || order.shippingAddress?.state} {order.billingAddress?.zipCode || order.shippingAddress?.zipCode}
                  </p>
                  <p className="mb-0">{order.billingAddress?.country || order.shippingAddress?.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Special Instructions / Order Notes */}
          {order.orderNotes && (
            <div className="card border-0 shadow-sm rounded-3 mb-4">
              <div className="card-header bg-white border-bottom py-3">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-journal-text me-2 text-primary"></i>
                  Special Instructions
                </h5>
              </div>
              <div className="card-body">
                <p className="mb-0 text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                  {order.orderNotes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Summary */}
        <div className="col-lg-4">
          {/* Payment Info */}
          <div className="card border-0 shadow-sm rounded-3 mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold">Payment</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Method</span>
                <span className="fw-bold">{order.paymentMethod}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Status</span>
                {paymentBadge(order.paymentStatus)}
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="card border-0 shadow-sm rounded-3 sticky-top" style={{ top: '100px' }}>
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold">Order Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Items</span>
                <span>{formatPrice(order.itemsPrice)}</span>
              </div>
              {order.discountPrice > 0 && (
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Discount</span>
                  <span className="text-success">-{formatPrice(order.discountPrice)}</span>
                </div>
              )}
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tax (GST)</span>
                <span>{formatPrice(order.taxPrice)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Shipping {order.deliveryOption === 'Express' && '(Express)'}</span>
                <span className={order.shippingPrice === 0 ? 'text-success fw-bold' : ''}>
                  {order.shippingPrice === 0 ? 'Free' : formatPrice(order.shippingPrice)}
                </span>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded">
                <span className="fs-5 fw-bold">Total</span>
                <span className="fs-4 fw-bold text-primary">{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
