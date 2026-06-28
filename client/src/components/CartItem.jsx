import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CartItem = ({ item, onUpdate, onRemove, onSaveForLater, onMoveToCart, isSavedForLater = false }) => {
  const [loading, setLoading] = useState(false);

  // Safely extract product data (populated by mongoose)
  const product = item.product;
  
  if (!product) return null;

  const inStock = product.stock > 0;
  
  const handleQuantityChange = async (e) => {
    const newQty = Number(e.target.value);
    setLoading(true);
    await onUpdate(item._id, newQty);
    setLoading(false);
  };

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(product.price);

  const formattedTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(product.price * item.quantity);

  return (
    <div className="row align-items-center py-3 border-bottom position-relative">
      {loading && (
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-white opacity-75 d-flex justify-content-center align-items-center" style={{ zIndex: 10 }}>
          <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
        </div>
      )}
      
      {/* Product Image */}
      <div className="col-3 col-md-2">
        <Link to={`/product/${product._id}`}>
          <img 
            src={product.images && product.images.length > 0 ? product.images[0].url : 'https://via.placeholder.com/150'} 
            alt={product.name} 
            className="img-fluid rounded object-fit-cover"
            style={{ height: '80px', width: '100%' }}
          />
        </Link>
      </div>
      
      {/* Product Details */}
      <div className="col-9 col-md-4 mb-3 mb-md-0">
        <Link to={`/product/${product._id}`} className="text-decoration-none text-dark fw-bold d-block text-truncate">
          {product.name}
        </Link>
        <div className="text-muted small">{formattedPrice}</div>
      </div>
      
      {/* Quantity & Actions */}
      <div className="col-12 col-md-6 d-flex align-items-center justify-content-between">
        {/* Quantity Selector */}
        <div className="d-flex align-items-center" style={{ width: '120px' }}>
          <select 
            className="form-select form-select-sm"
            value={item.quantity}
            onChange={handleQuantityChange}
            disabled={!inStock}
          >
            {[...Array(Math.min(product.stock, 10)).keys()].map((x) => (
              <option key={x + 1} value={x + 1}>
                {x + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Item Total */}
        <div className="fw-bold text-end" style={{ width: '100px' }}>
          {formattedTotal}
        </div>

        {/* Remove Button & Save for later */}
        <div className="d-flex ms-3">
          {!isSavedForLater ? (
            <button 
              className="btn btn-outline-secondary btn-sm me-2"
              onClick={() => onSaveForLater && onSaveForLater(item._id)}
              title="Save for Later"
            >
              <i className="bi bi-bookmark"></i>
            </button>
          ) : (
            <button 
              className="btn btn-outline-primary btn-sm me-2"
              onClick={() => onMoveToCart && onMoveToCart(item._id)}
              title="Move to Cart"
            >
              <i className="bi bi-cart-plus"></i>
            </button>
          )}
          <button 
            className="btn btn-outline-danger btn-sm rounded-circle"
            onClick={() => onRemove(item._id)}
            title="Remove Item"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
