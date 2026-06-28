import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import Loader from '../../components/Loader';

const Invoice = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
    fetchOrder();
  }, [id]);

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

  if (loading) return <Loader />;
  if (error) return <div className="alert alert-danger m-5">{error}</div>;
  if (!order) return <div className="alert alert-info m-5">Order not found</div>;

  return (
    <div className="container py-5 bg-white">
      <div className="d-flex justify-content-between mb-4 d-print-none">
        <Link to={`/orders/${id}`} className="btn btn-light">
          <i className="bi bi-arrow-left"></i> Back
        </Link>
        <button className="btn btn-primary" onClick={() => window.print()}>
          <i className="bi bi-printer me-2"></i> Print Invoice
        </button>
      </div>

      <div className="invoice-box border p-5 rounded">
        <div className="row mb-5 border-bottom pb-4">
          <div className="col-sm-6">
            <h1 className="fw-bold text-primary mb-0">SHOPEZ</h1>
            <p className="text-muted mt-2">Your Premium E-Commerce Store</p>
          </div>
          <div className="col-sm-6 text-sm-end">
            <h3 className="fw-bold">INVOICE</h3>
            <p className="mb-0 text-muted">Invoice No: {order.invoiceId || `INV-${order._id.slice(-6).toUpperCase()}`}</p>
            <p className="mb-0 text-muted">Date: {formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="row mb-5">
          <div className="col-sm-6">
            <h5 className="fw-bold border-bottom pb-2 mb-3">Billed To</h5>
            <p className="mb-1 fw-bold">{order.user?.name || 'Customer'}</p>
            <p className="mb-1">{order.billingAddress?.street || order.shippingAddress?.street}</p>
            <p className="mb-1">{order.billingAddress?.city || order.shippingAddress?.city}, {order.billingAddress?.state || order.shippingAddress?.state} {order.billingAddress?.zipCode || order.shippingAddress?.zipCode}</p>
            <p className="mb-0">{order.billingAddress?.country || order.shippingAddress?.country}</p>
          </div>
          <div className="col-sm-6 text-sm-end">
            <h5 className="fw-bold border-bottom pb-2 mb-3">Order Details</h5>
            <p className="mb-1"><strong>Order ID:</strong> #{order._id.slice(-8).toUpperCase()}</p>
            <p className="mb-1"><strong>Payment Method:</strong> {order.paymentMethod}</p>
            <p className="mb-0"><strong>Delivery Option:</strong> {order.deliveryOption}</p>
          </div>
        </div>

        <div className="table-responsive mb-5">
          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Item</th>
                <th className="text-center">Qty</th>
                <th className="text-end">Unit Price</th>
                <th className="text-end">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-end">{formatPrice(item.price)}</td>
                  <td className="text-end">{formatPrice(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="row">
          <div className="col-sm-6">
            <p className="text-muted small">
              Thank you for shopping with Shopez. This is a computer-generated invoice and does not require a physical signature.
            </p>
          </div>
          <div className="col-sm-6">
            <table className="table table-borderless table-sm text-end">
              <tbody>
                <tr>
                  <td><strong>Subtotal:</strong></td>
                  <td>{formatPrice(order.itemsPrice)}</td>
                </tr>
                {order.discountPrice > 0 && (
                  <tr>
                    <td><strong>Discount:</strong></td>
                    <td className="text-success">-{formatPrice(order.discountPrice)}</td>
                  </tr>
                )}
                <tr>
                  <td><strong>Tax (GST):</strong></td>
                  <td>{formatPrice(order.taxPrice)}</td>
                </tr>
                <tr>
                  <td><strong>Shipping:</strong></td>
                  <td>{order.shippingPrice === 0 ? 'Free' : formatPrice(order.shippingPrice)}</td>
                </tr>
                <tr className="fs-5 border-top border-dark">
                  <td><strong className="text-primary">Grand Total:</strong></td>
                  <td><strong className="text-primary">{formatPrice(order.totalPrice)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
