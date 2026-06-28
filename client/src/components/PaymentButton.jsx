import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import paymentService from '../services/paymentService';
import useAuth from '../hooks/useAuth';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PaymentButton = ({ order, onSuccess, onRetry }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Load Razorpay script dynamically
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your connection.');
      }

      // 2. Fetch Razorpay Key
      const key = await paymentService.getRazorpayKey();

      // 3. Create Razorpay Order from our Backend
      const razorpayOrder = await paymentService.createOrder(order._id);

      // 4. Configure Razorpay Options
      const options = {
        key: key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'SHOPEZ',
        description: `Payment for Order ${order._id.substring(0, 8)}`,
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            // 5. Verify payment signature on our backend
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id
            });
            
            // Navigate to success page or call success handler
            if (onSuccess) {
              onSuccess();
            } else {
              navigate('/payment/success', { state: { orderId: order._id } });
            }
          } catch (err) {
            console.error('Payment verification failed:', err);
            navigate('/payment/failure', { state: { orderId: order._id, error: err.toString() } });
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: order.shippingAddress?.phone || ''
        },
        theme: {
          color: '#0d6efd'
        }
      };

      // 6. Open Razorpay Checkout
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        if (onRetry) {
          onRetry(response.error.description);
        } else {
          navigate('/payment/failure', { 
            state: { 
              orderId: order._id, 
              error: response.error.description 
            } 
          });
        }
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong initiating payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="alert alert-danger py-2 px-3 small">{error}</div>}
      <button 
        className="btn btn-primary w-100 fw-bold" 
        onClick={handlePayment} 
        disabled={loading}
      >
        {loading ? (
          <><span className="spinner-border spinner-border-sm me-2"></span> Processing...</>
        ) : (
          <><i className="bi bi-credit-card me-2"></i> Pay ₹{order.totalPrice.toLocaleString('en-IN')}</>
        )}
      </button>
    </div>
  );
};

export default PaymentButton;
