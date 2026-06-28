import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import Loader from '../../components/Loader';

const ManageCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minPurchaseAmount, setMinPurchaseAmount] = useState(0);
  const [expirationDate, setExpirationDate] = useState('');
  const [usageLimit, setUsageLimit] = useState(100);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCoupons();
      setCoupons(data?.coupons || data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coupon) => {
    setIsEditing(true);
    setCurrentId(coupon._id);
    setCode(coupon.code);
    setDiscountType(coupon.type);
    setDiscountValue(coupon.discount);
    setMinPurchaseAmount(coupon.minPurchase || 0);
    setExpirationDate(new Date(coupon.expiryDate).toISOString().split('T')[0]);
    setUsageLimit(coupon.usageLimit || 100);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentId(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('');
    setMinPurchaseAmount(0);
    setExpirationDate('');
    setUsageLimit(100);
  };

  const handleToggleStatus = async (id) => {
    try {
      await adminService.toggleCouponStatus(id);
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id, codeStr) => {
    if (window.confirm(`Are you sure you want to delete coupon "${codeStr}"?`)) {
      try {
        await adminService.deleteCoupon(id);
        fetchCoupons();
      } catch (err) {
        alert(err.response?.data?.message || err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    try {
      const payload = {
        code: code.toUpperCase(),
        type: discountType,
        discount: Number(discountValue),
        minPurchase: Number(minPurchaseAmount),
        expiryDate: expirationDate,
        usageLimit: Number(usageLimit)
      };

      if (isEditing) {
        await adminService.updateCoupon(currentId, payload);
      } else {
        await adminService.createCoupon(payload);
      }
      
      handleCancelEdit();
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="pb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0 text-dark">Manage Coupons</h2>
          <p className="text-muted mb-0 small">Create and track discount codes</p>
        </div>
      </div>

      {error && <div className="alert alert-danger shadow-sm border-0">{error}</div>}

      <div className="row g-4">
        {/* Form Column */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white border-bottom border-light py-3">
              <h6 className="mb-0 fw-bold">{isEditing ? 'Edit Coupon' : 'Create New Coupon'}</h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-medium">Coupon Code</label>
                  <input 
                    type="text" 
                    className="form-control text-uppercase font-monospace" 
                    value={code} 
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                    placeholder="e.g. SUMMER50"
                  />
                </div>
                
                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label fw-medium">Discount Type</label>
                    <select 
                      className="form-select"
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label fw-medium">Value</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={discountValue} 
                      onChange={(e) => setDiscountValue(e.target.value)}
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium">Minimum Purchase Amount (₹)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={minPurchaseAmount} 
                    onChange={(e) => setMinPurchaseAmount(e.target.value)}
                    min="0"
                  />
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-sm-6">
                    <label className="form-label fw-medium">Expiration Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={expirationDate} 
                      onChange={(e) => setExpirationDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label fw-medium">Usage Limit</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={usageLimit} 
                      onChange={(e) => setUsageLimit(e.target.value)}
                      min="1"
                    />
                  </div>
                </div>
                
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                    {submitLoading ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span> Saving...</>
                    ) : (
                      <><i className={`bi bi-${isEditing ? 'check-circle' : 'plus-circle'} me-2`}></i>{isEditing ? 'Save Changes' : 'Create Coupon'}</>
                    )}
                  </button>
                  {isEditing && (
                    <button type="button" className="btn btn-light border text-secondary" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* List Column */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white border-bottom border-light py-3">
              <h6 className="mb-0 fw-bold">All Coupons</h6>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="p-5"><Loader /></div>
              ) : coupons.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-ticket-perforated text-muted opacity-50 mb-3 d-block" style={{ fontSize: '3rem' }}></i>
                  <h6 className="text-muted">No coupons found. Create one to offer discounts.</h6>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Code</th>
                        <th>Discount</th>
                        <th>Status</th>
                        <th>Usage</th>
                        <th>Expires</th>
                        <th className="text-end pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((coupon) => {
                        const isExpired = new Date(coupon.expiryDate) < new Date();
                        const isMaxedOut = coupon.usedCount >= coupon.usageLimit;
                        
                        return (
                          <tr key={coupon._id} className={!coupon.isActive || isExpired || isMaxedOut ? 'bg-light' : ''}>
                            <td className="ps-4 font-monospace fw-bold text-dark">{coupon.code}</td>
                            <td>
                              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
                                {coupon.type === 'percentage' ? `${coupon.discount}% OFF` : `₹${coupon.discount} OFF`}
                              </span>
                              {coupon.minPurchase > 0 && (
                                <div className="small text-muted mt-1" style={{ fontSize: '0.7rem' }}>Min ₹{coupon.minPurchase}</div>
                              )}
                            </td>
                            <td>
                              <div className="form-check form-switch m-0 d-flex justify-content-center" style={{ width: 'fit-content' }}>
                                <input 
                                  className="form-check-input cursor-pointer" 
                                  type="checkbox" 
                                  role="switch" 
                                  checked={coupon.isActive}
                                  onChange={() => handleToggleStatus(coupon._id)}
                                />
                              </div>
                            </td>
                            <td>
                              <div className="small">
                                <span className={isMaxedOut ? 'text-danger fw-bold' : 'fw-medium'}>{coupon.usedCount}</span> 
                                <span className="text-muted"> / {coupon.usageLimit}</span>
                              </div>
                              <div className="progress mt-1" style={{ height: '4px', width: '60px' }}>
                                <div 
                                  className={`progress-bar ${isMaxedOut ? 'bg-danger' : 'bg-success'}`} 
                                  role="progressbar" 
                                  style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                                ></div>
                              </div>
                            </td>
                            <td>
                              <span className={`small ${isExpired ? 'text-danger fw-bold' : 'text-muted'}`}>
                                {new Date(coupon.expiryDate).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="text-end pe-4">
                              <div className="btn-group shadow-sm">
                                <button 
                                  className="btn btn-sm btn-light border text-primary"
                                  onClick={() => handleEdit(coupon)}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-light border text-danger"
                                  onClick={() => handleDelete(coupon._id, coupon.code)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCoupons;
