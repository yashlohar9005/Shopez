import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import Loader from '../../components/Loader';

const AdminOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const invoiceRef = useRef(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await adminService.getOrderDetails(id);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      setActionLoading(true);
      await adminService.updateOrderStatus(id, status);
      await fetchOrderDetails();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) {
      try {
        setActionLoading(true);
        await adminService.cancelOrder(id);
        await fetchOrderDetails();
      } catch (err) {
        alert(err.response?.data?.message || err.message);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const printInvoice = () => {
    window.print();
  };

  if (loading) return <Loader />;
  if (error) return <div className="alert alert-danger shadow-sm border-0 mt-4">{error}</div>;
  if (!order) return <div className="alert alert-info shadow-sm mt-4">Order not found</div>;

  return (
    <div className="pb-4">
      {/* Non-printable Header */}
      <div className="d-print-none d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div className="d-flex align-items-center">
          <Link to="/admin/orders" className="btn btn-sm btn-light border shadow-sm rounded-circle me-3">
            <i className="bi bi-arrow-left"></i>
          </Link>
          <div>
            <h3 className="fw-bold m-0 text-dark d-flex align-items-center">
              Order Details
              <span className={`badge ms-3 fs-6 rounded-pill ${
                order.orderStatus === 'delivered' ? 'bg-success' : 
                order.orderStatus === 'shipped' ? 'bg-info text-dark' :
                order.orderStatus === 'processing' || order.orderStatus === 'pending' ? 'bg-warning text-dark' :
                'bg-danger'
              }`}>
                {order.orderStatus.toUpperCase()}
              </span>
            </h3>
            <p className="text-muted mb-0 small font-monospace mt-1">ID: #{order._id}</p>
          </div>
        </div>
        
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary shadow-sm" onClick={printInvoice}>
            <i className="bi bi-printer me-2"></i> Print Invoice
          </button>
          
          {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
            <div className="dropdown">
              <button className="btn btn-primary shadow-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" disabled={actionLoading}>
                {actionLoading ? 'Updating...' : 'Update Status'}
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                {(order.orderStatus === 'pending' || order.orderStatus === 'processing') && (
                  <li><button className="dropdown-item py-2" onClick={() => handleStatusUpdate('shipped')}><i className="bi bi-truck me-2 text-info"></i> Mark Shipped</button></li>
                )}
                {order.orderStatus === 'shipped' && (
                  <li><button className="dropdown-item py-2" onClick={() => handleStatusUpdate('delivered')}><i className="bi bi-check2-all me-2 text-success"></i> Mark Delivered</button></li>
                )}
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item py-2 text-danger" onClick={handleCancel}><i className="bi bi-x-circle me-2"></i> Cancel Order</button></li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Content (Printable) */}
      <div className="card border-0 shadow-sm rounded-3 print-area" ref={invoiceRef}>
        <div className="card-body p-5">
          {/* Invoice Header */}
          <div className="row mb-5 border-bottom pb-4">
            <div className="col-sm-6">
              <h2 className="fw-bold mb-1 text-primary d-flex align-items-center">
                <i className="bi bi-shield-lock me-2"></i> SHOPEZ
              </h2>
              <div className="text-muted small">Premium Shopping Destination</div>
            </div>
            <div className="col-sm-6 text-sm-end mt-4 mt-sm-0">
              <h4 className="text-muted mb-1">INVOICE</h4>
              <div className="text-dark fw-bold font-monospace">#{order._id.substring(10).toUpperCase()}</div>
              <div className="text-muted small">Date: {new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Addresses */}
          <div className="row mb-5">
            <div className="col-sm-6">
              <h6 className="text-muted text-uppercase fw-bold mb-3 small" style={{ letterSpacing: '1px' }}>Customer Info</h6>
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-person me-2 text-muted"></i>
                <span className="fw-medium text-dark">{order.user?.name || 'Guest User'}</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-envelope me-2 text-muted"></i>
                <a href={`mailto:${order.user?.email}`} className="text-decoration-none text-dark">{order.user?.email}</a>
              </div>
            </div>
            <div className="col-sm-6 text-sm-end mt-4 mt-sm-0">
              <h6 className="text-muted text-uppercase fw-bold mb-3 small" style={{ letterSpacing: '1px' }}>Shipping Address</h6>
              <div className="text-dark">
                {order.shippingAddress.address}<br />
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="table-responsive mb-5">
            <table className="table table-borderless border">
              <thead className="table-light border-bottom">
                <tr>
                  <th className="py-3 ps-4">Item Description</th>
                  <th className="py-3 text-center">Qty</th>
                  <th className="py-3 text-end">Price</th>
                  <th className="py-3 text-end pe-4">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} className="border-bottom">
                    <td className="py-3 ps-4">
                      <div className="d-flex align-items-center">
                        <img 
                          src={item.image || 'https://via.placeholder.com/40'} 
                          alt={item.name}
                          className="rounded me-3 object-fit-cover border d-print-none"
                          style={{ width: '40px', height: '40px' }}
                        />
                        <div className="fw-medium text-dark">{item.name}</div>
                      </div>
                    </td>
                    <td className="py-3 text-center align-middle">{item.quantity}</td>
                    <td className="py-3 text-end align-middle text-muted">₹{item.price.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-end align-middle fw-medium pe-4">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Row */}
          <div className="row">
            <div className="col-sm-6">
              <h6 className="text-muted text-uppercase fw-bold mb-3 small" style={{ letterSpacing: '1px' }}>Payment Info</h6>
              <div className="p-3 bg-light rounded-3 d-inline-block">
                <div className="mb-1"><span className="text-muted me-2">Method:</span> <span className="fw-medium text-uppercase">{order.paymentMethod}</span></div>
                <div className="mb-1">
                  <span className="text-muted me-2">Status:</span> 
                  <span className={`fw-bold ${order.paymentStatus === 'paid' ? 'text-success' : 'text-warning'}`}>
                    {order.paymentStatus.toUpperCase()}
                  </span>
                </div>
                {order.paymentStatus === 'paid' && (
                  <div><span className="text-muted me-2">Paid At:</span> <span className="small">{new Date(order.paidAt).toLocaleString()}</span></div>
                )}
              </div>
            </div>
            <div className="col-sm-6">
              <table className="table table-borderless mb-0">
                <tbody>
                  <tr>
                    <td className="text-end text-muted pb-1">Subtotal:</td>
                    <td className="text-end fw-medium pb-1" style={{ width: '150px' }}>₹{order.itemsPrice.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="text-end text-muted py-1">Shipping:</td>
                    <td className="text-end fw-medium py-1">₹{order.shippingPrice.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="text-end text-muted py-1">Tax:</td>
                    <td className="text-end fw-medium py-1">₹{order.taxPrice.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="border-top border-2">
                    <td className="text-end fw-bold py-3 fs-5">Total:</td>
                    <td className="text-end fw-bold py-3 fs-5 text-primary">₹{order.totalPrice.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
