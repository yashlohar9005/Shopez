import React from 'react';
import { Link } from 'react-router-dom';

const ProductTable = ({ products, onDelete }) => {
  if (!products || products.length === 0) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <i className="bi bi-box-seam text-muted opacity-50 mb-3 d-block" style={{ fontSize: '3rem' }}></i>
          <h5 className="text-muted">No products found.</h5>
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
            <th scope="col" className="py-3">Category</th>
            <th scope="col" className="py-3">Price</th>
            <th scope="col" className="py-3">Stock</th>
            <th scope="col" className="py-3">Status</th>
            <th scope="col" className="text-end pe-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td className="ps-4 py-3">
                <div className="d-flex align-items-center">
                  <img 
                    src={product.images && product.images.length > 0 ? product.images[0].url : 'https://via.placeholder.com/48'} 
                    alt={product.name}
                    className="rounded me-3 object-fit-cover shadow-sm border"
                    style={{ width: '48px', height: '48px' }}
                  />
                  <div>
                    <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '250px' }} title={product.name}>
                      {product.name}
                    </div>
                    <div className="text-muted small font-monospace">#{product._id.substring(18)}</div>
                  </div>
                </div>
              </td>
              <td className="py-3 text-muted">
                {product.category?.name || 'N/A'}
              </td>
              <td className="py-3 fw-medium">
                ₹{product.price.toLocaleString('en-IN')}
              </td>
              <td className="py-3">
                <div className="d-flex align-items-center gap-2">
                  <span className={`badge rounded-pill ${
                    product.stock > 10 ? 'bg-success' : 
                    product.stock > 0 ? 'bg-warning text-dark' : 'bg-danger'
                  }`}>
                    {product.stock}
                  </span>
                  {product.stock > 0 && product.stock <= 5 && (
                    <i className="bi bi-exclamation-triangle-fill text-warning" title="Low Stock"></i>
                  )}
                </div>
              </td>
              <td className="py-3">
                {product.isActive ? (
                  <span className="badge rounded-pill bg-success bg-opacity-25 text-success">Active</span>
                ) : (
                  <span className="badge rounded-pill bg-secondary bg-opacity-25 text-secondary">Draft</span>
                )}
              </td>
              <td className="text-end pe-4 py-3">
                <div className="btn-group shadow-sm">
                  <Link 
                    to={`/product/${product._id}`} 
                    className="btn btn-sm btn-light border" 
                    title="View on Store"
                    target="_blank"
                  >
                    <i className="bi bi-eye text-secondary"></i>
                  </Link>
                  <Link 
                    to={`/admin/product/${product._id}/edit`} 
                    className="btn btn-sm btn-light border text-primary"
                    title="Edit Product"
                  >
                    <i className="bi bi-pencil"></i>
                  </Link>
                  <button 
                    className="btn btn-sm btn-light border text-danger"
                    title="Delete Product"
                    onClick={() => {
                      if(window.confirm(`Are you sure you want to delete ${product.name}?`)) {
                        onDelete(product._id);
                      }
                    }}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
