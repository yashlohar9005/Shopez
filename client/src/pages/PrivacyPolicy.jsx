import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="fw-bold mb-4" style={{ color: '#4f46e5' }}>Privacy Policy</h1>
          <p className="lead text-secondary mb-5">
            Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information.
          </p>

          <div className="card shadow-sm border-0 mb-4 rounded-4">
            <div className="card-body p-4 p-md-5">
              <h3 className="h5 fw-bold mb-3">1. Information We Collect</h3>
              <p className="text-secondary mb-4">
                We collect information you provide directly to us, such as when you create an account, make a purchase, or contact customer support. This may include your name, email, shipping address, and payment details.
              </p>

              <h3 className="h5 fw-bold mb-3">2. How We Use Your Information</h3>
              <ul className="text-secondary mb-4">
                <li className="mb-2">To process and fulfill your orders.</li>
                <li className="mb-2">To communicate with you about your account or our services.</li>
                <li className="mb-2">To improve our website, products, and customer experience.</li>
                <li className="mb-2">To send promotional emails, if you have opted in.</li>
              </ul>

              <h3 className="h5 fw-bold mb-3">3. Data Security</h3>
              <p className="text-secondary mb-4">
                We implement a variety of security measures to maintain the safety of your personal information. All sensitive payment data is transmitted via Secure Socket Layer (SSL) technology and encrypted.
              </p>

              <h3 className="h5 fw-bold mb-3">4. Third-Party Disclosures</h3>
              <p className="text-secondary mb-0">
                We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties, except trusted third parties who assist us in operating our website or servicing you.
              </p>
            </div>
          </div>
          
          <div className="alert alert-info rounded-3 border-0 bg-light" role="alert">
            <i className="bi bi-shield-lock-fill me-2 text-primary"></i>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
