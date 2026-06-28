import React from 'react';

const InventoryTable = ({ products, onUpdateStock }) => {
  if (!products || products.length === 0) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <i className="bi bi-boxes text-muted opacity-50 mb-3 d-block" style={{ fontSize: '3rem' }}></i>
          <h5 className="text-muted">No inventory records found.</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="table-responsive bg-white rounded-3 shadow-sm border-0">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th scope="col" className="ps-4 py-3">Product</th>
            <th scope="col" className="py-3">SKU / ID</th>
            <th scope="col" className="py-3 text-center">Current Stock</th>
            <th scope="col" className="py-3">Status</th>
            <th scope="col" className="text-end pe-4 py-3">Quick Update</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const isOutOfStock = product.stock === 0;
            const isLowStock = product.stock > 0 && product.stock <= 5;
            
            return (
              <tr key={product._id} className={isOutOfStock ? 'table-danger' : isLowStock ? 'table-warning' : ''}>
                <td className="ps-4 py-3">
                  <div className="d-flex align-items-center">
                    <img 
                      src={product.images && product.images.length > 0 ? product.images[0].url : 'https://via.placeholder.com/48'} 
                      alt={product.name}
                      className="rounded me-3 object-fit-cover shadow-sm bg-white"
                      style={{ width: '48px', height: '48px' }}
                    />
                    <div>
                      <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '250px' }} title={product.name}>
                        {product.name}
                      </div>
                      <div className="text-muted small">{product.category?.name || 'Uncategorized'}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 font-monospace text-muted small">
                  {product._id.substring(18).toUpperCase()}
                </td>
                <td className="py-3 text-center">
                  <span className={`fs-5 fw-bold ${isOutOfStock ? 'text-danger' : isLowStock ? 'text-dark' : 'text-success'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="py-3">
                  {isOutOfStock ? (
                    <span className="badge bg-danger"><i className="bi bi-x-circle me-1"></i> Out of Stock</span>
                  ) : isLowStock ? (
                    <span className="badge bg-warning text-dark"><i className="bi bi-exclamation-triangle me-1"></i> Low Stock</span>
                  ) : (
                    <span className="badge bg-success"><i className="bi bi-check-circle me-1"></i> In Stock</span>
                  )}
                </td>
                <td className="text-end pe-4 py-3">
                  <div className="btn-group shadow-sm">
                    <button 
                      className="btn btn-sm btn-light border text-danger"
                      onClick={() => onUpdateStock(product, -1)}
                      disabled={isOutOfStock}
                      title="Decrease by 1"
                    >
                      <i className="bi bi-dash-lg"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-light border text-primary fw-medium px-3"
                      onClick={() => onUpdateStock(product, 'modal')}
                      title="Set custom amount"
                    >
                      Update
                    </button>
                    <button 
                      className="btn btn-sm btn-light border text-success"
                      onClick={() => onUpdateStock(product, 1)}
                      title="Increase by 1"
                    >
                      <i className="bi bi-plus-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
