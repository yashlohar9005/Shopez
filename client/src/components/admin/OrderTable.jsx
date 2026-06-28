import React from 'react';
import { Link } from 'react-router-dom';

const OrderTable = ({ orders, onStatusUpdate, onCancel }) => {
  if (!orders || orders.length === 0) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <i className="bi bi-receipt text-muted opacity-50 mb-3 d-block" style={{ fontSize: '3rem' }}></i>
          <h5 className="text-muted">No orders found.</h5>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const s = status.toLowerCase();
    if (s === 'delivered') return <span className="badge rounded-pill bg-success"><i className="bi bi-check2-all me-1"></i>Delivered</span>;
    if (s === 'shipped') return <span className="badge rounded-pill bg-info text-dark"><i className="bi bi-truck me-1"></i>Shipped</span>;
    if (s === 'processing' || s === 'pending') return <span className="badge rounded-pill bg-warning text-dark"><i className="bi bi-box-seam me-1"></i>Processing</span>;
    if (s === 'cancelled') return <span className="badge rounded-pill bg-danger"><i className="bi bi-x-circle me-1"></i>Cancelled</span>;
    return <span className="badge rounded-pill bg-secondary">{status}</span>;
  };

  return (
    <div className="table-responsive bg-white rounded-3 shadow-sm border-0">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th scope="col" className="ps-4 py-3">Order Details</th>
            <th scope="col" className="py-3">Customer</th>
            <th scope="col" className="py-3">Amount</th>
            <th scope="col" className="py-3">Status</th>
            <th scope="col" className="text-end pe-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td className="ps-4 py-3">
                <div className="fw-bold text-dark font-monospace mb-1">#{order._id.substring(18).toUpperCase()}</div>
                <div className="text-muted small">
                  <i className="bi bi-calendar3 me-1"></i> {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </td>
              <td className="py-3">
                <div className="d-flex align-items-center">
                  <img 
                    src={order.user?.avatar || 'https://via.placeholder.com/32'} 
                    alt={order.user?.name}
                    className="rounded-circle me-2 object-fit-cover shadow-sm"
                    style={{ width: '32px', height: '32px' }}
                  />
                  <div>
                    <div className="fw-medium text-dark">{order.user?.name || 'Guest User'}</div>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{order.user?.email || 'N/A'}</div>
                  </div>
                </div>
              </td>
              <td className="py-3 fw-bold">
                ₹{order.totalPrice.toLocaleString('en-IN')}
                <div className="small fw-normal text-muted mt-1">
                  {order.paymentStatus === 'paid' ? (
                    <span className="text-success"><i className="bi bi-check-circle-fill me-1"></i>Paid</span>
                  ) : (
                    <span className="text-warning text-dark"><i className="bi bi-hourglass-split me-1"></i>Pending</span>
                  )}
                </div>
              </td>
              <td className="py-3">
                {getStatusBadge(order.orderStatus)}
              </td>
              <td className="text-end pe-4 py-3">
                <div className="dropdown">
                  <button className="btn btn-sm btn-light border text-primary" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Manage <i className="bi bi-chevron-down ms-1" style={{ fontSize: '0.75rem' }}></i>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                    <li>
                      <Link className="dropdown-item py-2" to={`/admin/orders/${order._id}`}>
                        <i className="bi bi-eye text-primary me-2"></i> View Full Details
                      </Link>
                    </li>
                    {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
                      <>
                        <li><hr className="dropdown-divider" /></li>
                        <li><h6 className="dropdown-header text-uppercase">Update Status</h6></li>
                        
                        {order.orderStatus === 'pending' || order.orderStatus === 'processing' ? (
                          <li>
                            <button className="dropdown-item py-2" onClick={() => onStatusUpdate(order._id, 'shipped')}>
                              <i className="bi bi-truck text-info me-2"></i> Mark as Shipped
                            </button>
                          </li>
                        ) : null}

                        {order.orderStatus === 'shipped' ? (
                          <li>
                            <button className="dropdown-item py-2" onClick={() => onStatusUpdate(order._id, 'delivered')}>
                              <i className="bi bi-check2-all text-success me-2"></i> Mark as Delivered
                            </button>
                          </li>
                        ) : null}
                        
                        <li>
                          <button 
                            className="dropdown-item py-2 text-danger" 
                            onClick={() => {
                              if(window.confirm('Are you sure you want to cancel this order? This will restore inventory stock.')) {
                                onCancel(order._id);
                              }
                            }}
                          >
                            <i className="bi bi-x-circle me-2"></i> Cancel Order
                          </button>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
