import React from 'react';

const ReturnPolicy = () => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="fw-bold mb-4" style={{ color: '#4f46e5' }}>Return Policy</h1>
          <p className="lead text-secondary mb-5">
            We want you to be completely satisfied with your purchase. Learn more about our return and refund process below.
          </p>

          <div className="card shadow-sm border-0 mb-4 rounded-4">
            <div className="card-body p-4 p-md-5">
              <h3 className="h5 fw-bold mb-3">1. Return Window</h3>
              <p className="text-secondary mb-4">
                You have 7 days from the date of delivery to return most unused items in their original condition and packaging.
              </p>

              <h3 className="h5 fw-bold mb-3">2. Eligibility for Returns</h3>
              <ul className="text-secondary mb-4">
                <li className="mb-2">Items must be unworn, unwashed, and have original tags attached.</li>
                <li className="mb-2">Electronics must remain unopened in their original sealed packaging unless defective.</li>
                <li className="mb-2">Certain items like intimates, swimwear, and customized products are non-returnable.</li>
              </ul>

              <h3 className="h5 fw-bold mb-3">3. How to Initiate a Return</h3>
              <p className="text-secondary mb-4">
                To start a return, go to your <strong>Order History</strong> in your account, select the order, and click "Return Item". You will receive a shipping label and instructions via email.
              </p>

              <h3 className="h5 fw-bold mb-3">4. Refunds</h3>
              <p className="text-secondary mb-0">
                Once we receive and inspect your returned item, we will process your refund. Refunds will be issued to the original payment method within 5-7 business days.
              </p>
            </div>
          </div>
          
          <div className="alert alert-info rounded-3 border-0 bg-light" role="alert">
            <i className="bi bi-info-circle-fill me-2 text-primary"></i>
            Have questions? Contact our support team at <strong>support@shopez.in</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
