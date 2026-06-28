import React, { useEffect, useState } from 'react';
import customerApiService from '../../services/customerApiService';
import Loader from '../../components/Loader';

const SavedAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', phone: '', addressLine1: '', addressLine2: '',
    city: '', state: '', postalCode: '', country: 'India',
    addressType: 'Home', isDefault: false
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await customerApiService.getAddresses();
      setAddresses(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await customerApiService.updateAddress(editId, formData);
      } else {
        await customerApiService.addAddress(formData);
      }
      setShowModal(false);
      fetchAddresses();
    } catch (err) {
      console.error(err);
      alert('Failed to save address');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await customerApiService.deleteAddress(id);
        fetchAddresses();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEdit = (addr) => {
    setFormData(addr);
    setEditId(addr._id);
    setShowModal(true);
  };

  const openNew = () => {
    setFormData({
      fullName: '', phone: '', addressLine1: '', addressLine2: '',
      city: '', state: '', postalCode: '', country: 'India',
      addressType: 'Home', isDefault: false
    });
    setEditId(null);
    setShowModal(true);
  };

  const handleSetDefault = async (addr) => {
    try {
      await customerApiService.updateAddress(addr._id, { ...addr, isDefault: true });
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold m-0">Saved Addresses</h3>
        <button className="btn btn-primary shadow-sm" onClick={openNew}>
          <i className="bi bi-plus-lg me-1"></i> Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-5 bg-white rounded shadow-sm">
          <i className="bi bi-geo-alt fs-1 text-muted mb-3 d-block"></i>
          <h4 className="text-muted mb-3">No saved addresses</h4>
          <p className="text-muted small">Add your shipping addresses for a faster checkout experience.</p>
        </div>
      ) : (
        <div className="row g-4">
          {addresses.map(addr => (
            <div key={addr._id} className="col-md-6">
              <div className={`card shadow-sm h-100 ${addr.isDefault ? 'border-primary border-2' : 'border-0'}`}>
                <div className="card-body position-relative">
                  {addr.isDefault && (
                    <span className="badge bg-primary position-absolute top-0 end-0 m-3">Default</span>
                  )}
                  <div className="d-flex align-items-center mb-3">
                    <span className="badge bg-light text-dark border me-2">{addr.addressType}</span>
                    <h6 className="mb-0 fw-bold">{addr.fullName}</h6>
                  </div>
                  <p className="mb-1 text-muted small">{addr.addressLine1}</p>
                  {addr.addressLine2 && <p className="mb-1 text-muted small">{addr.addressLine2}</p>}
                  <p className="mb-1 text-muted small">{addr.city}, {addr.state} {addr.postalCode}</p>
                  <p className="mb-3 text-muted small">{addr.country}</p>
                  <p className="mb-0 fw-bold small"><i className="bi bi-telephone me-2"></i>{addr.phone}</p>
                </div>
                <div className="card-footer bg-white border-top d-flex gap-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEdit(addr)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(addr._id)}>Delete</button>
                  {!addr.isDefault && (
                    <button className="btn btn-sm btn-link text-decoration-none ms-auto" onClick={() => handleSetDefault(addr)}>Set as Default</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Modal (Simple inline modal for brevity) */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{editId ? 'Edit Address' : 'Add New Address'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small">Full Name</label>
                      <input type="text" className="form-control" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small">Phone</label>
                      <input type="text" className="form-control" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small">Address Line 1</label>
                      <input type="text" className="form-control" required value={formData.addressLine1} onChange={e => setFormData({...formData, addressLine1: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small">Address Line 2 (Optional)</label>
                      <input type="text" className="form-control" value={formData.addressLine2} onChange={e => setFormData({...formData, addressLine2: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">City</label>
                      <input type="text" className="form-control" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">State</label>
                      <input type="text" className="form-control" required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">Postal Code</label>
                      <input type="text" className="form-control" required value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">Address Type</label>
                      <select className="form-select" value={formData.addressType} onChange={e => setFormData({...formData, addressType: e.target.value})}>
                        <option value="Home">Home</option>
                        <option value="Office">Office</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="defaultCheck" checked={formData.isDefault} onChange={e => setFormData({...formData, isDefault: e.target.checked})} />
                        <label className="form-check-label small" htmlFor="defaultCheck">Make this my default address</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Address</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedAddresses;
