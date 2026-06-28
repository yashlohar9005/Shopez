import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useCart from '../hooks/useCart';
import orderService from '../services/orderService';
import CheckoutForm from '../components/CheckoutForm';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  if (!cart || !cart.items || cart.items.length === 0) {
    return null; // Will redirect via useEffect
  }

  const formatPrice = (price) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price || 0);

  const formattedSubtotal = formatPrice(cart?.subTotal);
  const formattedDiscount = formatPrice(cart?.discountPrice);
  const formattedTax = formatPrice(cart?.taxPrice);
  const formattedShipping = cart?.shippingPrice === 0 ? 'Free' : formatPrice(cart?.shippingPrice);
  const formattedTotal = formatPrice(cart?.totalPrice);

  const submitOrder = async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.createOrder(orderData);
      clearCart();
      
      const successMessage = orderData.paymentMethod === 'Razorpay' 
        ? 'Order placed successfully! Please complete your payment below.' 
        : 'Order placed successfully with Cash on Delivery!';
        
      // Navigate to Orders page on success
      navigate('/orders', { state: { message: successMessage } });
    } catch (err) {
      setError(err.toString());
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <Link to="/cart" className="btn btn-light mb-4">
        <i className="bi bi-arrow-left"></i> Back to Cart
      </Link>
      
      <h2 className="fw-bold mb-4">Checkout</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        {/* Checkout Form */}
        <div className="col-lg-7">
          <CheckoutForm onSubmit={submitOrder} loading={loading} />
        </div>

        {/* Order Summary */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 rounded-3 sticky-top" style={{ top: '100px' }}>
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold">Order Summary</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush mb-3">
                {cart.items.map((item) => (
                  <li className="list-group-item px-0 d-flex justify-content-between align-items-center" key={item._id}>
                    <div className="d-flex align-items-center">
                      <img 
                        src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/50'} 
                        alt={item.product?.name} 
                        className="rounded object-fit-cover me-2"
                        style={{ width: '40px', height: '40px' }}
                      />
                      <div>
                        <div className="text-truncate" style={{ maxWidth: '180px' }}>
                          {item.product?.name}
                        </div>
                        <div className="text-muted small">Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <span className="text-muted">
                      ₹{(item.product?.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </li>
                ))}
              </ul>

              <hr />
              
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal</span>
                <span>{formattedSubtotal}</span>
              </div>
              
              {cart?.discountPrice > 0 && (
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Discount</span>
                  <span className="text-success">-{formattedDiscount}</span>
                </div>
              )}
              
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tax (GST)</span>
                <span>{formattedTax}</span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Shipping</span>
                <span className="text-success fw-bold">{formattedShipping}</span>
              </div>
              
              <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded">
                <span className="fs-5 fw-bold">Total</span>
                <span className="fs-4 fw-bold text-primary">{formattedTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

