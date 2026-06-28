import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCart from '../hooks/useCart';
import CartItem from '../components/CartItem';
import Loader from '../components/Loader';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, applyCoupon, moveToSavedForLater, moveToCart } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (loading && (!cart || !cart.items)) {
    return <Loader />;
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;
  const hasSavedForLater = cart && cart.savedForLater && cart.savedForLater.length > 0;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponSuccess('');
    try {
      await applyCoupon(couponCode);
      setCouponSuccess('Coupon applied successfully!');
    } catch (err) {
      setCouponError(err?.response?.data?.message || 'Invalid coupon');
    }
  };

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

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">Shopping Cart</h2>
      
      {isEmpty ? (
        <div className="text-center py-5 bg-white rounded shadow-sm">
          <i className="bi bi-cart-x fs-1 text-muted mb-3 d-block"></i>
          <h4 className="text-muted mb-4">Your cart is empty</h4>
          <Link to="/products" className="btn btn-primary px-4 rounded-pill">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-header bg-white border-bottom py-3">
                <h5 className="mb-0 fw-bold">Cart Items ({cart.itemCount})</h5>
              </div>
              <div className="card-body p-0 px-3">
                {cart.items.map((item) => (
                  <CartItem 
                    key={item._id} 
                    item={item} 
                    onUpdate={updateQuantity}
                    onRemove={removeFromCart}
                    onSaveForLater={moveToSavedForLater}
                  />
                ))}
              </div>
            </div>

            {hasSavedForLater && (
              <div className="card border-0 shadow-sm rounded-3 mt-4">
                <div className="card-header bg-white border-bottom py-3">
                  <h5 className="mb-0 fw-bold">Saved for Later ({cart.savedForLater.length})</h5>
                </div>
                <div className="card-body p-0 px-3">
                  {cart.savedForLater.map((item) => (
                    <CartItem 
                      key={item._id} 
                      item={item} 
                      onUpdate={updateQuantity}
                      onRemove={removeFromCart}
                      onMoveToCart={moveToCart}
                      isSavedForLater={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-header bg-white border-bottom py-3">
                <h5 className="mb-0 fw-bold">Order Summary</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleApplyCoupon} className="mb-4">
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Coupon Code" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button className="btn btn-dark" type="submit">Apply</button>
                  </div>
                  {couponError && <div className="text-danger small mt-1">{couponError}</div>}
                  {couponSuccess && <div className="text-success small mt-1">{couponSuccess}</div>}
                </form>

                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Subtotal ({cart.itemCount} items)</span>
                  <span className="fw-bold">{formattedSubtotal}</span>
                </div>
                
                {cart?.discountPrice > 0 && (
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Discount</span>
                    <span className="text-success fw-bold">-{formattedDiscount}</span>
                  </div>
                )}
                
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Tax (GST)</span>
                  <span className="fw-bold">{formattedTax}</span>
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Shipping</span>
                  <span className="text-success fw-bold">{formattedShipping}</span>
                </div>
                
                {cart?.estimatedDelivery && (
                  <div className="d-flex justify-content-between mb-3 small">
                    <span className="text-muted"><i className="bi bi-truck me-1"></i> Delivery By</span>
                    <span className="fw-bold text-dark">{new Date(cart.estimatedDelivery).toLocaleDateString()}</span>
                  </div>
                )}
                
                <hr />
                <div className="d-flex justify-content-between mb-4">
                  <span className="fs-5 fw-bold">Total</span>
                  <span className="fs-5 fw-bold text-primary">{formattedTotal}</span>
                </div>
                
                <button 
                  className="btn btn-primary w-100 py-3 rounded-pill fw-bold"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

