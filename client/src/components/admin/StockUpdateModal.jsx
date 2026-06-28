import React, { useState, useEffect } from 'react';

const StockUpdateModal = ({ product, show, onClose, onSave }) => {
  const [stock, setStock] = useState(0);

  useEffect(() => {
    if (product) {
      setStock(product.stock);
    }
  }, [product]);

  if (!show || !product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(product._id, parseInt(stock, 10));
  };

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title fw-bold">Update Stock</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="d-flex align-items-center mb-4 p-3 bg-light rounded-3 border">
                <img 
                  src={product.images?.[0]?.url || 'https://via.placeholder.com/40'} 
                  alt={product.name}
                  className="rounded me-3 object-fit-cover"
                  style={{ width: '40px', height: '40px' }}
                />
                <div>
                  <h6 className="mb-0 text-truncate" style={{ maxWidth: '300px' }}>{product.name}</h6>
                  <small className="text-muted">Current Stock: {product.stock}</small>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium">New Stock Amount</label>
                <div className="input-group input-group-lg">
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={() => setStock(Math.max(0, parseInt(stock || 0) - 1))}
                  >
                    <i className="bi bi-dash"></i>
                  </button>
                  <input 
                    type="number" 
                    className="form-control text-center" 
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    min="0"
                    required
                  />
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={() => setStock(parseInt(stock || 0) + 1)}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
                <div className="form-text mt-2 text-center">
                  Set the absolute new stock value.
                </div>
              </div>
            </div>
            
            <div className="modal-footer border-top-0 pt-0">
              <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary px-4 shadow-sm">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockUpdateModal;
