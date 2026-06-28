import React, { useState } from 'react';

const CheckoutForm = ({ onSubmit, loading }) => {
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('India');
  
  // Billing Address State
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [billingStreet, setBillingStreet] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingZipCode, setBillingZipCode] = useState('');
  const [billingCountry, setBillingCountry] = useState('India');

  const [deliveryOption, setDeliveryOption] = useState('Standard');
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [orderNotes, setOrderNotes] = useState('');

  const submitHandler = (e) => {
    e.preventDefault();
    
    const shippingAddress = { street, city, state, zipCode, country };
    const billingAddress = sameAsShipping 
      ? shippingAddress 
      : { street: billingStreet, city: billingCity, state: billingState, zipCode: billingZipCode, country: billingCountry };

    onSubmit({
      shippingAddress,
      billingAddress,
      deliveryOption,
      paymentMethod,
      orderNotes: orderNotes.trim(),
    });
  };

  return (
    <div className="card shadow-sm border-0 rounded-3 mb-4">
      <div className="card-body p-4">
        <h4 className="fw-bold mb-4">Shipping Address</h4>
        
        <form onSubmit={submitHandler}>
          <div className="mb-3">
            <label className="form-label text-muted small fw-bold">Street Address</label>
            <input
              type="text"
              className="form-control bg-light"
              placeholder="123 Main St"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              required
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label text-muted small fw-bold">City</label>
              <input
                type="text"
                className="form-control bg-light"
                placeholder="Mumbai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small fw-bold">State</label>
              <input
                type="text"
                className="form-control bg-light"
                placeholder="Maharashtra"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small fw-bold">Zip Code</label>
              <input
                type="text"
                className="form-control bg-light"
                placeholder="400001"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-muted small fw-bold">Country</label>
            <input
              type="text"
              className="form-control bg-light"
              placeholder="India"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </div>


          <hr className="my-4" />

          {/* Billing Address Toggle */}
          <div className="form-check mb-4">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="sameAsShipping" 
              checked={sameAsShipping}
              onChange={(e) => setSameAsShipping(e.target.checked)}
            />
            <label className="form-check-label fw-bold" htmlFor="sameAsShipping">
              Billing Address is same as Shipping Address
            </label>
          </div>

          {!sameAsShipping && (
            <div className="p-3 bg-white border rounded mb-4">
              <h5 className="fw-bold mb-3">Billing Address</h5>
              <div className="mb-3">
                <label className="form-label text-muted small fw-bold">Street Address</label>
                <input type="text" className="form-control bg-light" value={billingStreet} onChange={(e) => setBillingStreet(e.target.value)} required />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label text-muted small fw-bold">City</label>
                  <input type="text" className="form-control bg-light" value={billingCity} onChange={(e) => setBillingCity(e.target.value)} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-muted small fw-bold">State</label>
                  <input type="text" className="form-control bg-light" value={billingState} onChange={(e) => setBillingState(e.target.value)} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-muted small fw-bold">Zip Code</label>
                  <input type="text" className="form-control bg-light" value={billingZipCode} onChange={(e) => setBillingZipCode(e.target.value)} required />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small fw-bold">Country</label>
                <input type="text" className="form-control bg-light" value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} required />
              </div>
            </div>
          )}

          <hr className="my-4" />

          <h4 className="fw-bold mb-3">Delivery Options</h4>
          <div className="form-check mb-2">
            <input className="form-check-input" type="radio" name="deliveryOption" id="standard" value="Standard" checked={deliveryOption === 'Standard'} onChange={(e) => setDeliveryOption(e.target.value)} />
            <label className="form-check-label" htmlFor="standard">
              Standard Delivery (5-7 days)
            </label>
          </div>
          <div className="form-check mb-4">
            <input className="form-check-input" type="radio" name="deliveryOption" id="express" value="Express" checked={deliveryOption === 'Express'} onChange={(e) => setDeliveryOption(e.target.value)} />
            <label className="form-check-label" htmlFor="express">
              Express Delivery (1-2 days) - ₹100 Extra
            </label>
          </div>

          <hr className="my-4" />
          
          <h4 className="fw-bold mb-3">Payment Method</h4>
          
          <div className="form-check mb-2">
            <input 
              className="form-check-input" 
              type="radio" 
              name="paymentMethod" 
              id="razorpay" 
              value="Razorpay"
              checked={paymentMethod === 'Razorpay'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <label className="form-check-label fw-bold" htmlFor="razorpay">
              Razorpay (Credit Card / UPI / NetBanking)
            </label>
          </div>

          <div className="form-check mb-2">
            <input 
              className="form-check-input" 
              type="radio" 
              name="paymentMethod" 
              id="cod" 
              value="COD"
              checked={paymentMethod === 'COD'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <label className="form-check-label" htmlFor="cod">
              Cash on Delivery (COD)
            </label>
          </div>

          <div className="form-check mb-4">
            <input 
              className="form-check-input" 
              type="radio" 
              name="paymentMethod" 
              id="wallet" 
              value="Wallet"
              checked={paymentMethod === 'Wallet'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <label className="form-check-label" htmlFor="wallet">
              Wallet Balance
            </label>
          </div>

          <hr className="my-4" />

          <h4 className="fw-bold mb-3">Special Instructions</h4>
          <p className="text-muted small mb-2">
            Add any special requests for your order (e.g., "Gift wrap this item", "Deliver after 6 PM")
          </p>
          <div className="mb-4">
            <textarea
              id="orderNotes"
              className="form-control bg-light"
              rows="3"
              maxLength={500}
              placeholder="Enter any special instructions here (optional)"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
            />
            <div className="text-muted small text-end mt-1">
              {orderNotes.length}/500 characters
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100 py-3 rounded-pill fw-bold"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : null}
            Place Order
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;
